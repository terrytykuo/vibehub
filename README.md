# VibeHub - BMAD Discord Bots

將 BMAD (Build, Measure, Adapt, Deliver) methodology 的 PO 和 Dev 角色移植到 Discord 的 bot 系統。

## 專案結構

```
vibehub/
├── bots/
│   ├── vibe-bot.js       - 通用 ChatGPT bot
│   ├── po-bot.js         - PO (Sarah) - Product Owner bot
│   ├── dev-bot.js        - Dev (James) - Developer bot
│   └── bmad-loader.js    - BMAD 依賴檔案載入系統
├── .bmad-core/           - BMAD 方法論核心檔案
│   ├── agents/           - 角色定義 (po.md, dev.md)
│   ├── tasks/            - 任務定義
│   ├── templates/        - 文件範本
│   └── checklists/       - 檢查清單
├── index.js              - 主程式入口，啟動所有 bots
├── .env                  - 環境變數配置
└── .env.example          - 環境變數範本
```

## 系統需求

- Node.js 16+
- Discord Bot Tokens (需要 3 個 bot)
- OpenAI API Key

## 安裝步驟

1. **安裝依賴**
```bash
npm install
```

2. **設定環境變數**

複製 `.env.example` 為 `.env` 並填入你的 tokens：

```bash
cp .env.example .env
```

編輯 `.env`：
```env
# Vibe Bot (通用 ChatGPT bot)
DISCORD_TOKEN_VIBE=your_vibe_bot_token_here

# PO Bot (Sarah - Product Owner)
DISCORD_TOKEN_PO=your_po_bot_token_here

# Dev Bot (James - Developer)
DISCORD_TOKEN_DEV=your_dev_bot_token_here

# OpenAI API Key (所有 bots 共用)
OPENAI_API_KEY=your_openai_api_key_here
```

3. **建立 Discord Bots**

前往 [Discord Developer Portal](https://discord.com/developers/applications) 建立 3 個 bot applications：
- Vibe Bot
- PO Bot (建議命名為 "Sarah - PO")
- Dev Bot (建議命名為 "James - Dev")

每個 bot 需要啟用以下權限：
- `GUILD_MESSAGES`
- `MESSAGE_CONTENT`
- Send Messages
- Create Public Threads

4. **邀請 Bots 到你的 Discord Server**

使用 OAuth2 URL Generator 產生邀請連結，選擇：
- Scopes: `bot`, `applications.commands`
- Bot Permissions: 如上所述

## 啟動

```bash
node index.js
```

或使用 npm script（如果有設定）：
```bash
npm start
```

## 功能說明

### 📝 PO Bot (Sarah - Product Owner)

**角色定位**：Technical Product Owner & Process Steward
**風格**：Meticulous, analytical, detail-oriented, systematic, collaborative

**可用命令**：

- `/help` - 顯示所有 PO 可用命令
- `/create-epic [description]` - 建立 Epic（brownfield 專案）
- `/create-story [requirements]` - 根據需求建立 User Story
- `/validate-story [story]` - 驗證 Story 的完整性
- `/correct-course` - 執行 correct-course 任務
- `/shard-doc [document]` - 分割文件
- `/execute-checklist` - 執行 PO master checklist
- `/clear` - 清除對話歷史

### 💻 Dev Bot (James - Developer)

**角色定位**：Expert Senior Software Engineer & Implementation Specialist
**風格**：Extremely concise, pragmatic, detail-oriented, solution-focused

**可用命令**：

- `/help` - 顯示所有 Dev 可用命令
- `/develop-story [story]` - 根據 Story 產生實作計畫
- `/explain [topic]` - 詳細解釋實作方式（訓練模式）
- `/run-tests` - 執行測試與 linting 建議
- `/review-qa [code]` - 進行 QA review
- `/debug [issue]` - Debug 協助
- `/execute-checklist` - 執行 Story DOD checklist
- `/clear` - 清除對話歷史

### 💬 Vibe Bot

通用的 ChatGPT 對話 bot

**可用命令**：
- `/ask [question]` - 詢問任何問題
- `/clear` - 清除對話歷史

## 使用方式

### 基本使用

1. 在 Discord channel 中輸入 slash command，例如：
   ```
   /create-story requirements: 建立使用者登入功能
   ```

2. Bot 會根據 BMAD 方法論的角色定義回應

3. 如果回應超過 2000 字元，會自動建立 thread

### Thread 互動

當 bot 建立 thread 後，你可以在 thread 中繼續對話：
- 直接在 thread 中輸入訊息（不需要 slash command）
- Bot 會維持角色情境繼續對話
- 對話歷史會保留在該 thread 中

### 進階使用

**完整工作流程範例**：

1. 使用 PO bot 建立 story：
   ```
   /create-story requirements: 實作使用者註冊功能，需要 email 驗證
   ```

2. PO bot 回應完整的 story（YAML 格式）

3. 複製 story 內容，使用 Dev bot 開始實作：
   ```
   /develop-story story: [貼上完整 story]
   ```

4. Dev bot 提供實作計畫

5. 在實作過程中需要協助：
   ```
   /debug issue: Jest 測試一直失敗
   ```

6. 完成後執行 checklist：
   ```
   /execute-checklist
   ```

## 技術架構

### BMAD Loader 系統

`bmad-loader.js` 提供依賴檔案載入功能：

- 自動讀取 `.bmad-core/` 下的檔案
- 根據命令動態載入相關的 tasks, templates, checklists
- 將角色 persona 和依賴注入到 OpenAI system prompt

### Persona 注入

每個 bot 在執行命令時會：
1. 載入對應的 agent 定義（po.md 或 dev.md）
2. 根據命令載入相關的 dependencies
3. 組合成完整的 system message
4. 傳送給 OpenAI API

### 對話歷史管理

- 以 channel ID 或 thread ID 為 key
- 儲存完整的對話歷史
- `/clear` 命令可清除特定 channel 的歷史

## 開發

### 新增命令

1. 在對應的 bot 檔案（`po-bot.js` 或 `dev-bot.js`）的 `commands` 陣列中新增 SlashCommandBuilder

2. 在 `interactionCreate` 的 switch case 中新增處理邏輯

3. 設定對應的 dependencies（tasks, templates, checklists）

### 新增 BMAD 依賴檔案

1. 將檔案放入 `.bmad-core/` 對應的目錄

2. 在 `bmad-loader.js` 的 `dependencies` 物件中註冊

## 疑難排解

### Bot 無法啟動
- 檢查 `.env` 檔案中的 tokens 是否正確
- 確認 bot 已被邀請到 Discord server
- 檢查 console 的錯誤訊息

### Slash commands 沒有出現
- 等待幾分鐘讓 Discord 同步命令
- 重新啟動 bot
- 檢查 bot 的權限設定

### OpenAI API 錯誤
- 確認 API key 有效
- 檢查 API quota
- 查看錯誤訊息確認具體問題

## BMAD 方法論

本專案基於 BMAD (Build, Measure, Adapt, Deliver) methodology，包含兩個核心角色：

- **PO (Product Owner)**：負責需求管理、story 規劃、驗證等
- **Dev (Developer)**：負責實作、測試、code review 等

詳細的方法論請參考 `.bmad-core/` 目錄下的文件。

## License

MIT

## 貢獻

歡迎提交 Pull Requests 或開 Issues！
