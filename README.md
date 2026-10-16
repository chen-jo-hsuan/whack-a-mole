# 🐹 打地鼠 (Whack-a-Mole)

一個使用 Vite + React 與 CSS 打造的精美打地鼠網頁小遊戲。

🎮 **線上試玩**：[https://chen-jo-hsuan.github.io/whack-a-mole/](https://chen-jo-hsuan.github.io/whack-a-mole/)

---

## 🌟 遊戲特色

- ⏱️ **20 秒限時挑戰**：快節奏考驗手眼協調與動態視力。
- 💥 **三種地鼠機制**：
  - 🐹 **普通地鼠**：擊中 +10 分，連續命中累積 Combo 加成！
  - ✨ **黃金地鼠**：稀有出現，擊中 +30 分！
  - 💣 **炸彈地鼠**：避開陷阱！敲到扣 15 分並中斷連擊！
- 🏁 **結算與成果評價**：20 秒時間到即刻呈現 **FINISH** 結算面板、成績評價頭銜與「重新開始」功能。
- 🎵 **Web Audio 原生合成音效**：內建卡通打擊音效、連擊音效與緊急倒數警告聲，支援隨時靜音。
- ⌨️ **雙重操控模式**：支援滑鼠敲擊（附木槌揮舞特效）或鍵盤數字鍵 `1 ~ 9` 直覺對應九宮格。

---

## 🚀 本地開發

```bash
# 複製專案
git clone https://github.com/chen-jo-hsuan/whack-a-mole.git

# 進入目錄
cd whack-a-mole

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

---

## 🛠️ 技術棧

- **框架**：React 19 + Vite 8
- **樣式**：Vanilla CSS (3D 透視地洞、擬真草坪、流暢微動畫)
- **音效**：Web Audio API
- **部署**：GitHub Pages
