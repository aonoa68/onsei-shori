# サイトの公開手順

このサイトは **`course_site/` だけ**を1つのリポジトリとして公開します。

科目ディレクトリの側（`../第NN回/`）には、小テストの正解と解説、動画台本が
入っています。学生に見せるものではないため、**リポジトリに含めません**。
`course_site/` をリポジトリのルートにすることで、これらが公開範囲から外れます。

> ビッグデータ応用Ⅰは構成が違います。あちらは演習スクリプトへリンクしているため、
> 科目ディレクトリ全体を1つのリポジトリにしています。

## 初回のみ（リポジトリ作成〜公開）

### 1. GitHub でリポジトリを作成

```bash
gh repo create aonoa68/onsei-shori --public
```

### 2. `course_site/` で git を初期化して push

```bash
git init
git add .
git commit -m "初回公開"
git branch -M main
git remote add origin https://github.com/aonoa68/onsei-shori.git
git push -u origin main
```

### 3. サイトを公開

```bash
mkdocs gh-deploy --force
```

公開先は https://aonoa68.github.io/onsei-shori/ です。

## 2回目以降（更新するとき）

```bash
git add .
git commit -m "更新内容"
git push
mkdocs gh-deploy --force
```

`git push` はソースの保存、`gh-deploy` はサイトの公開です。両方必要です。

## 各回のページを作り直すとき

`build_pages.py` が `../第NN回/lecture.md` から `docs/sessions/NN.md` を再生成します。
元資料はリポジトリの外にあるので、この操作は手元でのみ実行できます。

```bash
python build_pages.py
```

## 注意

- スライドの PDF と HTML で約42MBあります。リポジトリの大半がこれです。
- 他の授業サイト（統計学Ⅰ・統計学Ⅱ・社会調査入門・行動計量学）も
  同じ手動の `gh-deploy` 方式です。自動公開のワークフローは使っていません。
