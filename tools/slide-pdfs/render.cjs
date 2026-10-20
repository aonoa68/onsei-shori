'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '../..');
const slidesDir = path.join(repoRoot, 'docs/slides');
const fontDir = process.env.SLIDE_PDF_FONT_DIR || path.join(__dirname, 'fonts');
const sessions = Array.from({ length: 12 }, (_, i) => String(i + 3).padStart(2, '0'));
const requested = process.argv.slice(2);
const targets = requested.length ? requested : sessions;
if (targets.some(num => !sessions.includes(num)) || new Set(targets).size !== targets.length) {
  throw new Error('Use unique session numbers from 03 through 14. No arguments renders all 12 PDFs.');
}

// Noto CJK Sans2.004, from the official notofonts/noto-cjk release.
const fonts = [
  { weight: 400, file: 'NotoSansCJKjp-Regular.otf', sha256: '68a3fc98800b2a27b371f2fb79991daf3633bd89309d4ffaa6946fd587f375b5' },
  { weight: 700, file: 'NotoSansCJKjp-Bold.otf', sha256: 'e53dcb0dcb2922e45d01aae1ebd2f382bb81d4229b18b6b883bd170678af1f76' }
];
const fontCss = fonts.map(font => {
  const bytes = fs.readFileSync(path.join(fontDir, font.file));
  if (createHash('sha256').update(bytes).digest('hex') !== font.sha256) {
    throw new Error(`Font checksum mismatch: ${font.file}`);
  }
  return `@font-face {
    font-family: 'Onsei Noto'; font-style: normal; font-weight: ${font.weight};
    src: url(data:font/otf;base64,${bytes.toString('base64')}) format('opentype');
  }`;
}).join('\n');

const printCss = `${fontCss}
  section { font-family: 'Onsei Noto', sans-serif !important; }
  section pre, section code {
    font-family: 'DejaVu Sans Mono', 'Onsei Noto', monospace !important;
  }
  section mjx-container svg text { font-family: 'Onsei Noto', sans-serif !important; }
`;

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const reports = [];
  try {
    for (const num of targets) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      try {
        // Use the checked local font files, not a changing Google Fonts response.
        await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort());
        await page.goto(pathToFileURL(path.join(slidesDir, `${num}.html`)).href, {
          waitUntil: 'networkidle', timeout: 60000
        });
        await page.emulateMedia({ media: 'print' });
        await page.addStyleTag({ content: printCss });
        await page.evaluate(async () => {
          await Promise.all([
            document.fonts.load('400 22px "Onsei Noto"', '音声処理'),
            document.fonts.load('700 36px "Onsei Noto"', '音声処理')
          ]);
          await document.fonts.ready;
          if (!document.fonts.check('400 22px "Onsei Noto"', '音声処理') ||
              !document.fonts.check('700 36px "Onsei Noto"', '音声処理')) {
            throw new Error('Japanese fonts did not load.');
          }
        });
        const slides = await page.locator('section').evaluateAll(sections => sections.map((section, index) => {
          const rect = section.getBoundingClientRect();
          const footer = section.querySelector(':scope > footer');
          const footerTop = footer ? footer.getBoundingClientRect().top - rect.top : rect.height;
          const content = [...section.children].filter(element =>
            !['HEADER', 'FOOTER', 'STYLE', 'SCRIPT'].includes(element.tagName) &&
            getComputedStyle(element).display !== 'none'
          );
          const bottom = Math.max(0, ...content.map(element => element.getBoundingClientRect().bottom - rect.top));
          const limit = Math.min(720, footerTop) - 8;
          return {
            slide: index + 1,
            width: rect.width, height: rect.height,
            contentBottom: Number(bottom.toFixed(2)),
            limit: Number(limit.toFixed(2)),
            overflow: bottom > limit + 0.5
          };
        }));
        if (!slides.length) throw new Error(`${num}: no slides found`);
        const invalidSize = slides.filter(slide => Math.abs(slide.width - 1280) > 0.5 || Math.abs(slide.height - 720) > 0.5);
        const overflow = slides.filter(slide => slide.overflow);
        if (invalidSize.length || overflow.length) {
          console.error(JSON.stringify({ session: num, invalidSize, overflow }, null, 2));
          throw new Error(`${num}: slide dimensions or footer clearance failed; PDF was not written.`);
        }
        await page.pdf({
          path: path.join(slidesDir, `${num}.pdf`),
          width: '1280px', height: '720px',
          preferCSSPageSize: true, printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        const report = { session: num, pages: slides.length, overflow: 0 };
        reports.push(report);
        console.log(JSON.stringify(report));
      } finally {
        await page.close();
      }
    }
    console.log(`Rendered ${reports.length} PDFs with 8px footer clearance (1280x720 CSS px; 960x540 PDF pt).`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
