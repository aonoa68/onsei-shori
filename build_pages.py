#!/usr/bin/env python3
"""../第NN回/lecture.md から docs/sessions/NN.md を作り直す。
元資料を直したら、このスクリプトを実行してから mkdocs build する。"""
import os,re,glob
HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.dirname(HERE)
META=re.compile(r"^\*\*(?:科目名|科目|担当|形式|対象|対象学年|所要時間|回数|授業形式)\*\*\s*[:：]")
for i in range(1,15):
    w=os.path.join(SRC,f"第{i:02d}回"); lec=open(os.path.join(w,"lecture.md"),encoding="utf-8").read()
    title=re.sub(r"^第0?\d+回[：:]\s*","",lec.split("\n",1)[0].lstrip("# ").strip())
    fmt="動画回" if os.path.exists(os.path.join(w,"cbt_questions.md")) else "オンライン同期回"
    note="（オンデマンド動画＋CBTテスト）" if fmt=="動画回" else "（Zoom・録画を後日公開）"
    body=[l for k,l in enumerate(lec.split("\n")[1:]) if not (k<30 and META.match(l))]
    head=(f"# 第{i}回　{title}\n\n"
          '!!! info "この回の資料"\n'
          f"    - [📊 スライドを開く（HTML）](../slides/{i:02d}.html)\n"
          f"    - [📄 スライド（PDF）](../slides/{i:02d}.pdf)\n"
          f"    - 形式：**{fmt}**{note}\n")
    out=re.sub(r"\n{3,}","\n\n",head+"\n".join(body))
    open(os.path.join(HERE,"docs","sessions",f"{i:02d}.md"),"w",encoding="utf-8").write(out)
print("docs/sessions を作り直しました（14ページ）")
