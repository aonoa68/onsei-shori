# 音声処理と認識　授業サイト

2027年度開講の「音声処理と認識」（情報科学部 情報科学科・3年後期）の授業サイト。
2027年度の開講に向けて作成している。公開先は https://aonoa68.github.io/onsei-shori/ 。

## 中身

| 場所 | 中身 | 元ファイル |
|---|---|---|
| `docs/index.md` | 科目の説明・到達目標・全14回の一覧・成績評価 | `../No_音声処理と認識_修正済.docx`（授業科目の概要） |
| `docs/sessions/NN.md` | 各回の講義本文 | `../第NN回/lecture.md` |
| `docs/slides/NN.html` | スライド（Marpで変換） | `../第NN回/slides.md` |
| `docs/slides/NN.pdf` | スライド（配布用） | `../第NN回/slides_preview.pdf` |
| `docs/project.md` | 期末プロジェクト説明書 | `../期末プロジェクト説明書.md` |

## 載せていないもの

- **小テスト（`../第NN回/cbt_questions.md`）**。正解と解説が入っているため。実施は Google Forms を想定。
- **動画台本（`../第NN回/video_script.md`）**。動画を作るための原稿で、学生に見せるものではない。

## 進化の視点（2026-09-17 追加）

全14回の `lecture.md` に「## 進化の視点」の節を1つずつ入れた。**その回の技術に直接つながる進化・生物学の話**を置き、最後に学生への問いで閉じる形にしてある。

例：第2回は喉頭下降説の再検討（Fitch ほか 2016／Boë ほか 2017・2019）からソース・フィルタモデルへ、第5回は聴覚に着想を得た特徴量と内耳の違いからメル尺度へ、第7回は乳児の統計学習（Saffran ほか 1996）から自己教師あり学習との比較へ、第10回は会話の間の言語横断研究（Stivers ほか 2009）から応答遅延の設計へ。

引用した文献は、書き込む前に書誌を確認済み。

## ページの作り直し

現在の訂正済み原稿は `docs/sessions/NN.md` にある。通常はこのファイルを編集し、MkDocsで確認・ビルドする。

```bash
mkdocs serve
mkdocs build
```

> **注意（2026-10-20）**：`build_pages.py` はリポジトリ外の `../第NN回/lecture.md` から14回分を上書きする。公開側だけに追加した導出や内容訂正も上書きされるため、通常の更新では実行しない。外部原稿から再生成する場合は、先に訂正を外部原稿へ取り込み、別の作業コピーで出力の差分を確認する。

2026-10-20の内容確認では、第2回に続き第3〜14回の本文・HTMLスライド・配布用PDFを訂正した。数式の前提、コードの入出力、実験結果の評価条件、一次資料への引用、演習と解答の整合を確認している。関連する `docs/project.md`、科目概要の書誌・ナビゲーションも更新した。

リポジトリ外の `lecture.md`・`slides.md`・動画台本・独立したCBT問題ファイルは、この訂正では変更していない。これらを教材の生成に使う場合は、先に公開側の訂正を取り込むこと。

## 手元で見る

```bash
cd course_site
mkdocs serve      # http://127.0.0.1:8000 で開く
```

スライドを作り直すとき（`../第NN回/slides.md` を編集したあと）：

```bash
cd ..
marp "第04回/slides.md" -o course_site/docs/slides/04.html --html
```

`--allow-local-files` は付けない。付けると変換が終わらない。

## 公開の仕組み

ソースは `main`、生成済みサイトは `gh-pages` で管理し、GitHub Pagesから公開する。更新時はビルド後の本文・HTMLスライド・PDF・検索索引をそろえて反映し、公開URLで確認する。日程や課題の提出先は開講前に確定する。

## 資料側に残っている食い違い（未修正）

- 第10〜12回の `lecture.md` の見出しに「全15回中」とあるが、この科目は**全14回**。
- 第11回の `lecture.md` は CBT を「コンピュータベーストレーニング」としているが、授業科目の概要では **Computer-Based Testing**。

サイト側では、これらの行は各回ページに出ないようにしてある（元ファイルは直していない）。

## 第3〜14回のPDF再生成

`tools/slide-pdfs/render.cjs` は、修正済みHTMLから第3〜14回のPDFを手動で再生成するツールです。Playwrightと日本語フォントの版を固定し、本文・コード・SVG数式の文字表示、スライドの寸法、フッターまでの余白を検査します。はみ出しがあれば生成を停止します。

初回はNode.js環境で、次をリポジトリのルートから実行します。

```bash
cd tools/slide-pdfs
npm install
npx playwright install --with-deps chromium
mkdir -p fonts
curl -fL https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf -o fonts/NotoSansCJKjp-Regular.otf
curl -fL https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf -o fonts/NotoSansCJKjp-Bold.otf
node render.cjs
```

フォントのSHA256はレンダラーで検証します。Linuxではコード用のDejaVu Sans Monoも用意してください。特定の回だけを作り直す場合は、`node render.cjs 03 04` のように回番号を指定できます。PDFを確認した後、原稿とPDFを保存し、MkDocsでビルドして公開ページへ反映します。このツールがGitHubへ書き込むことはありません。
