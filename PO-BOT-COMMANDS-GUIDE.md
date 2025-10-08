# PO Bot 指令完整指南

本文件提供 PO Bot (Sarah - Product Owner) 所有可用指令的詳細說明與使用建議。

---

## 快速參考：完整指令對比表

| 指令 | 主要用途 | 使用時機 | 產出 | 參數 | 執行模式 |
|------|---------|---------|------|------|---------|
| `/help` | 顯示幫助資訊 | 不熟悉指令時 | 所有可用命令列表 | 無 | 即時 |
| `/create-epic` | 建立 Epic（大型功能模組） | Brownfield 專案需要新功能模組 | Epic 定義（YAML 格式） | `description` (必填) | 互動式 |
| `/create-story` | 建立 User Story | 需要將需求轉換為開發任務 | 完整 Story（含 AC、Tasks、Dev Notes） | `requirements` (必填) | 互動式 |
| `/validate-story` | Story 驗證與品質檢查 | Story 建立後、開發前驗證 | 驗證報告 + GO/NO-GO 決策 + 實作準備度評分 | `story` (選填) | 自動分析 |
| `/correct-course` | 變更管理與專案調整 | 需求變更、方向調整、遇到阻礙 | Sprint Change Proposal（含影響分析、修正提案） | 無 | 漸進式 / YOLO |
| `/shard-doc` | 文件分割工具 | 大型文件難以維護時 | 分割後的小文件 + index.md | `document` (選填) | 自動 / 手動 |
| `/execute-checklist` | 專案計劃全面驗證 | 開發執行前的完整檢查 | 驗證報告 + 準備度評估 + Go/No-Go 建議 | 無 | 互動式 / YOLO |
| `/clear` | 清除對話歷史 | 需要重新開始對話 | 確認訊息 | 無 | 即時 |

---

## 按功能分類

### 📝 創建類指令

| 指令 | 建立內容 | 適用專案類型 | 複雜度 |
|------|---------|-------------|-------|
| `/create-epic` | Epic（功能模組） | Brownfield | 中 |
| `/create-story` | User Story（開發任務） | All | 高 |

### ✅ 驗證類指令

| 指令 | 驗證對象 | 驗證深度 | 產出決策 |
|------|---------|---------|---------|
| `/validate-story` | 單一 Story | 10 大驗證項目 | GO / NO-GO |
| `/execute-checklist` | 整個專案計劃 | 10 大類別檢查 | Go / No-Go |

### 🔧 管理類指令

| 指令 | 管理對象 | 使用情境 | 產出文件 |
|------|---------|---------|---------|
| `/correct-course` | 專案變更 | 需求變更、調整方向 | Sprint Change Proposal |
| `/shard-doc` | 大型文件 | 文件過大難維護 | 分割後的多個小文件 |

### 🛠️ 工具類指令

| 指令 | 功能 | 頻率 |
|------|------|------|
| `/help` | 顯示說明 | 按需 |
| `/clear` | 清除歷史 | 按需 |

---

## 詳細指令說明

### 1. `/create-epic` - 建立 Epic

**用途**: 為 Brownfield 專案建立 Epic（大型功能模組）

**參數**:
- `description` (必填): Epic 的描述

**產出範例**:
```yaml
epic_id: "2"
epic_title: "使用者認證系統"
description: "實作完整的使用者登入、註冊、密碼重設功能"
stories:
  - 2.1: 使用者註冊
  - 2.2: 使用者登入
  - 2.3: 密碼重設
```

**使用範例**:
```
/create-epic description: 建立完整的使用者認證系統
```

---

### 2. `/create-story` - 建立 User Story

**用途**: 根據需求建立詳細的 User Story

**參數**:
- `requirements` (必填): Story 需求描述

**產出**: 完整的 User Story，包含：
- Story ID 和標題
- User Story 描述（As a... I want... So that...）
- Acceptance Criteria（驗收條件）
- Tasks/Subtasks（開發任務清單）
- Dev Notes（技術實作細節）
- Testing Instructions
- Dependencies

**使用範例**:
```
/create-story requirements: 實作使用者註冊功能，需要 email 驗證
```

**適用專案**: Greenfield 和 Brownfield 都適用

---

### 3. `/validate-story` - Story 驗證

**用途**: 在開發前全面驗證 Story 的完整性和準確性

**參數**:
- `story` (選填): Story 內容（可在 thread 中貼上完整內容）

**驗證項目** (10 大類):
1. **Template 完整性**：檢查是否缺少必要 Section、未填寫的 placeholder
2. **檔案結構與原始碼樹**：檔案路徑、目錄結構、建立順序
3. **UI/Frontend 完整性**：UI 元件、樣式指引、互動流程
4. **Acceptance Criteria 滿足度**：AC 涵蓋度、可測試性
5. **測試指示**：測試方法、關鍵測試案例
6. **安全考量**：安全需求、認證授權、敏感資料處理
7. **任務順序**：邏輯順序、依賴關係、任務粒度
8. **反幻覺驗證** ⭐：技術主張可追溯性、架構對齊
9. **Dev Agent 實作就緒度**：情境完整性、指示明確性
10. **產出驗證報告**：Critical/Should-Fix/Nice-to-Have Issues

**產出**:
- Critical Issues（必須修正）
- Should-Fix Issues（重要改善）
- Nice-to-Have（可選增強）
- 反幻覺發現
- 最終評估：✅ GO / ❌ NO-GO
- 實作準備度評分（1-10）
- 信心等級（High/Medium/Low）

**使用範例**:
```
/validate-story
```
或在 thread 中貼上完整 Story 後執行

---

### 4. `/execute-checklist` - 專案計劃驗證

**用途**: 執行 PO Master Checklist，在開發執行前驗證專案計劃

**執行模式**:
- **互動模式**：逐節檢查，每節確認後進行下一節（適合深度審查）
- **YOLO 模式**（推薦）：一次性完整分析後產出報告（較快速）

**智慧適應**:
- 自動偵測專案類型（Greenfield / Brownfield）
- 自動偵測是否包含 UI/UX 元件
- 根據專案類型跳過不適用的檢查項目

**驗證類別** (10 大類):
1. **專案設置與初始化**：開發環境、核心依賴
2. **基礎設施與部署**：Database、API、CI/CD、測試框架
3. **外部依賴與整合**：第三方服務、外部 API
4. **UI/UX 考量**（如適用）：設計系統、前端架構、使用者流程
5. **使用者/Agent 職責**：任務分配、職責清晰
6. **功能排序與依賴**：功能依賴、技術依賴、跨 Epic 依賴
7. **風險管理**（Brownfield）：破壞性變更、回滾策略、使用者影響
8. **MVP 範圍對齊**：核心目標、使用者旅程、技術需求
9. **文件與交接**：開發文件、使用者文件、知識轉移
10. **MVP 後續考量**：未來增強、監控反饋

**產出報告**:
- Executive Summary：專案類型、整體準備度百分比、Go/No-Go 建議
- 專案特定分析（Greenfield / Brownfield）
- 風險評估（Top 5 risks）
- MVP 完整性
- 實作準備度
- 具體建議（Must-fix / Should-fix / Consider / Post-MVP）
- [Brownfield Only] 整合信心評估

**使用範例**:
```
/execute-checklist
```

---

### 5. `/correct-course` - 變更管理

**用途**: 結構化的變更管理，處理需求變更或專案調整

**執行模式**:
- **漸進式**（推薦）：逐節討論 change-checklist，共同草擬變更
- **YOLO 模式**：批次分析後產出完整報告

**執行流程**:
1. **初始設定**：確認變更觸發點、影響範圍、選擇互動模式
2. **執行 Checklist 分析**（4 大區塊）：
   - 變更情境 (Change Context)
   - Epic/Story 影響分析
   - 文件衝突解決
   - 路徑評估與建議
3. **草擬變更提案**：
   - 修改 User Story（文字、AC、優先級）
   - 新增/移除/重排 Stories
   - 更新架構圖（Mermaid）
   - 修改技術清單、PRD、架構文件
4. **產出報告**：Sprint Change Proposal

**產出**: Sprint Change Proposal，包含：
- 分析摘要（問題、影響、選擇理由）
- 具體編輯提案（修改前後對照）
- 下一步建議：
  - 直接實施（PO/SM 可處理）
  - 需要深度重規劃（PM/Architect 介入）

**使用情境**:
- 客戶需求改變
- 技術方案需要調整
- 發現架構缺陷需要修正
- Sprint 中發現阻礙需要變更計畫

**使用範例**:
```
/correct-course
```

---

### 6. `/shard-doc` - 文件分割

**用途**: 將大型 Markdown 文件分割成多個小文件，方便管理和閱讀

**參數**:
- `document` (選填): 要分割的文件內容

**分割方式**:

#### 方式 A - 自動化（推薦）
使用 `@kayvan/markdown-tree-parser` 套件：
```bash
npm install -g @kayvan/markdown-tree-parser
md-tree explode docs/prd.md docs/prd
```

**前提條件**:
- `.bmad-core/core-config.yaml` 的 `markdownExploder` 設為 `true`
- 已安裝 `@kayvan/markdown-tree-parser`

#### 方式 B - 手動分割
如果無法使用自動化工具：
1. 辨識所有 `##` 標題作為分割點
2. 提取每個 Section 的完整內容（含子章節、程式碼、圖表）
3. 調整標題層級（`##` → `#`，`###` → `##`）
4. 生成檔名（小寫 dash-case）
5. 建立 `index.md` 索引檔案

**產出範例**:
```
原始文件: docs/prd.md (500+ 行)

分割後:
docs/prd/
  ├── index.md
  ├── executive-summary.md
  ├── core-goals.md
  ├── tech-stack.md
  └── user-stories.md
```

**特別保留**:
- 程式碼區塊（含 closing backticks）
- Mermaid 圖表（完整語法）
- 表格、清單
- 所有格式和縮排

**使用範例**:
```
/shard-doc
```
或
```
/shard-doc document: [貼上大型文件內容]
```

---

### 7. `/help` - 顯示幫助

**用途**: 顯示 PO Bot 所有可用命令

**使用範例**:
```
/help
```

---

### 8. `/clear` - 清除歷史

**用途**: 清除當前 channel 或 thread 的對話歷史

**使用範例**:
```
/clear
```

---

## 詳細對比：驗證類指令

### `/validate-story` vs `/execute-checklist`

| 比較項目 | `/validate-story` | `/execute-checklist` |
|---------|------------------|---------------------|
| **驗證範圍** | 單一 Story | 整個專案計劃 |
| **驗證時機** | Story 建立後、開發前 | 專案啟動前、Sprint 開始前 |
| **驗證深度** | Story 層級（模板、任務、AC） | 專案層級（架構、依賴、風險） |
| **主要關注** | 反幻覺、實作就緒度 | 依賴順序、MVP 範圍、風險管理 |
| **適用專案** | All | Greenfield / Brownfield（智慧適應） |
| **產出評分** | 1-10 實作準備度 | 整體準備度百分比 |
| **決策建議** | GO / NO-GO | Go / No-Go / Conditional |
| **執行時長** | 中（5-10 分鐘） | 長（15-30 分鐘） |
| **適用階段** | Story 層級品質檢查 | 專案層級全面檢查 |

**選擇建議**:
- 單一 Story 驗證 → 使用 `/validate-story`
- 專案啟動前全面檢查 → 使用 `/execute-checklist`
- 兩者可互補使用，不互斥

---

## 詳細對比：創建類指令

### `/create-epic` vs `/create-story`

| 比較項目 | `/create-epic` | `/create-story` |
|---------|---------------|----------------|
| **層級** | Epic（高層級） | Story（細節層級） |
| **粒度** | 粗（功能模組） | 細（具體任務） |
| **包含內容** | Epic 描述、Story 清單 | AC、Tasks、Dev Notes、Testing |
| **適用專案** | Brownfield | All |
| **依賴關係** | 包含多個 Stories | 屬於某個 Epic |
| **開發就緒** | 需要進一步展開成 Stories | 可直接進入開發 |
| **技術細節** | 無 | 有（Dev Notes） |
| **工作量** | 定義範圍 | 定義實作細節 |

**選擇建議**:
- Brownfield 專案大型功能 → 先用 `/create-epic` 再用 `/create-story`
- Greenfield 專案或單一功能 → 直接用 `/create-story`

---

## 工作流程建議

### 情境 A: 全新功能（Greenfield）
```
1. /create-story requirements: [需求描述]
   → PO Bot 產出完整 Story

2. /validate-story
   → 驗證 Story 完整性，確保開發就緒
   → 檢查反幻覺、技術細節、任務順序

3. [可選] /execute-checklist
   → 專案層級檢查（適合大型專案）

4. 開始開發
```

### 情境 B: 既有系統增強（Brownfield）
```
1. /create-epic description: [功能模組描述]
   → 定義 Epic 範圍和包含的 Stories

2. /create-story requirements: [各個 Story 的需求]
   → 為每個 Story 建立詳細內容

3. /validate-story
   → 逐一驗證每個 Story

4. /execute-checklist
   → 專案層級檢查（強烈建議！）
   → 特別注意風險管理、既有系統整合

5. 開始開發
```

### 情境 C: 需求變更
```
1. /correct-course
   → 使用 change-checklist 分析變更
   → 評估影響範圍
   → 產出 Sprint Change Proposal

2. [根據提案修改 Stories]

3. /validate-story
   → 驗證修改後的 Story

4. 繼續開發
```

### 情境 D: 文件過大難以維護
```
1. /shard-doc document: [貼上大型 PRD/Architecture 內容]
   → 自動或手動分割成多個小文件

2. 後續維護更容易
   → 可個別更新各 section
   → 版本控制更清晰
```

### 情境 E: 專案啟動前全面檢查
```
1. [準備好 PRD、Architecture、Epic/Story 定義]

2. /execute-checklist
   → 選擇執行模式（互動式 / YOLO）
   → 全面驗證 10 大類別

3. [根據報告修正問題]
   → Must-fix items: 必須修正
   → Should-fix items: 重要改善
   → Consider items: 可考慮

4. [再次執行 /execute-checklist 確認]

5. 專案啟動
```

---

## 指令優先級建議

### ⭐ 必學指令（核心功能）

#### 1. `/create-story` - 最常用
**原因**: 將需求轉換為可開發的 Story 是 PO 的核心工作

**建議**:
- 先熟悉這個指令
- 學習如何撰寫清楚的 requirements 描述
- 理解產出的 Story 結構（AC、Tasks、Dev Notes）

#### 2. `/validate-story` - 品質保證
**原因**: 確保 Story 完整且可開發，避免開發時遇到資訊缺口

**建議**:
- 每次建立 Story 後都執行
- 特別注意反幻覺驗證（技術細節是否有依據）
- 根據報告修正 Critical Issues

#### 3. `/help` - 查詢說明
**原因**: 隨時查詢可用指令

**建議**:
- 遇到不確定時使用
- 定期查看是否有新增指令

---

### 🔧 進階指令（提升品質）

#### 4. `/execute-checklist` - 專案檢查
**原因**: 大型專案或 Brownfield 專案必備，確保依賴順序正確

**建議**:
- Brownfield 專案強烈建議使用
- 專案啟動前執行一次
- 使用 YOLO 模式節省時間

#### 5. `/correct-course` - 變更管理
**原因**: 專業的變更管理流程，避免變更失控

**建議**:
- 遇到需求變更時使用
- 使用漸進式模式確保充分討論
- 保留 Sprint Change Proposal 作為決策記錄

---

### 🛠️ 輔助指令（特定情境）

#### 6. `/create-epic` - Brownfield 專案
**原因**: 僅適用於 Brownfield 專案的大型功能模組

**建議**:
- 不是所有專案都需要
- 先確認是否真的需要 Epic 層級規劃
- 建立後仍需展開成 Stories

#### 7. `/shard-doc` - 文件管理
**原因**: 解決大型文件維護問題

**建議**:
- 當文件超過 500 行時考慮使用
- 優先使用自動化方式（md-tree）
- 分割後更容易做版本控制

#### 8. `/clear` - 重置對話
**原因**: 工具指令，按需使用

**建議**:
- 切換專案或任務時使用
- 避免上下文混淆

---

## 學習路徑建議

### 第 1 週：基礎功能
```
Day 1-2: 學習 /create-story
- 嘗試建立 3-5 個不同類型的 Story
- 理解產出的結構

Day 3-4: 學習 /validate-story
- 驗證之前建立的 Stories
- 理解驗證報告的意義
- 根據報告修正問題

Day 5: 完整流程練習
- create-story → validate-story → 修正 → 再驗證
```

### 第 2 週：進階功能
```
Day 1-2: 學習 /execute-checklist
- 準備一個完整的專案計劃
- 執行全面檢查
- 理解 10 大類別的意義

Day 3-4: 學習 /correct-course
- 模擬需求變更情境
- 練習使用 change-checklist
- 產出 Sprint Change Proposal

Day 5: Brownfield 專案練習
- 學習 /create-epic
- Epic → Stories 完整流程
```

### 第 3 週：綜合應用
```
實際專案應用:
- 使用完整工作流程
- 建立自己的最佳實踐
- 根據專案類型選擇合適指令
```

---

## 常見問題 (FAQ)

### Q1: `/validate-story` 和 `/execute-checklist` 都要用嗎？
**A**: 不一定，視專案規模而定
- **小型專案/單一功能**: `/validate-story` 就足夠
- **大型專案/Brownfield**: 兩者都建議使用
- **最佳實踐**: Story 層級用 `/validate-story`，專案層級用 `/execute-checklist`

### Q2: 什麼時候需要用 `/create-epic`？
**A**: 僅限 Brownfield 專案的大型功能
- 如果功能可以用單一 Story 描述，不需要 Epic
- 如果需要 5+ Stories 組成一個功能模組，考慮用 Epic
- Greenfield 專案通常不需要

### Q3: `/shard-doc` 的自動模式和手動模式哪個好？
**A**: 優先使用自動模式
- 自動模式更準確、更快速
- 只有在無法安裝 `md-tree` 時才用手動模式
- 設定 `.bmad-core/core-config.yaml` 的 `markdownExploder: true`

### Q4: `/correct-course` 的漸進式和 YOLO 模式怎麼選？
**A**: 視變更複雜度而定
- **重大變更、影響範圍大**: 使用漸進式，確保充分討論
- **小型調整、影響明確**: 使用 YOLO，節省時間
- **不確定時**: 選擇漸進式較安全

### Q5: 每次都要執行 `/validate-story` 嗎？
**A**: 強烈建議
- Story 是開發的基礎，品質很重要
- 驗證可以發現技術幻覺（未經驗證的技術主張）
- 避免開發時遇到資訊缺口
- 執行時間不長（5-10 分鐘），但效益很高

### Q6: 如何知道 Story 是否通過驗證？
**A**: 看最終評估
- ✅ **GO**: 可以開始開發
- ❌ **NO-GO**: 必須修正 Critical Issues
- **實作準備度 ≥ 8**: 品質良好
- **實作準備度 < 6**: 需要大幅改善

### Q7: `/execute-checklist` 執行一次要多久？
**A**: 視專案規模而定
- **小型專案**: 15-20 分鐘
- **中型專案**: 20-30 分鐘
- **大型/複雜專案**: 30-45 分鐘
- **建議**: 使用 YOLO 模式可節省時間

### Q8: 指令可以在 thread 中使用嗎？
**A**: 可以
- 所有指令都支援在 thread 中使用
- Bot 會維持 thread 的對話歷史
- 適合長時間討論或多輪修正

---

## 最佳實踐建議

### 1. Story 建立最佳實踐
- ✅ 使用清楚、具體的 requirements 描述
- ✅ 包含使用者角色、需求、目的
- ✅ 說明關鍵的技術限制或要求
- ❌ 避免過於模糊的描述（如「改善系統」）
- ❌ 避免一次包含太多功能（應拆分成多個 Stories）

### 2. Story 驗證最佳實踐
- ✅ 每次建立 Story 後立即驗證
- ✅ 優先修正 Critical Issues
- ✅ 注意反幻覺發現（技術細節是否有依據）
- ✅ 確保實作準備度 ≥ 7 再開始開發
- ❌ 不要忽略 Should-Fix Issues
- ❌ 不要在 NO-GO 狀態下開始開發

### 3. 專案檢查最佳實踐
- ✅ Brownfield 專案必須執行 `/execute-checklist`
- ✅ 專案啟動前至少執行一次
- ✅ 使用 YOLO 模式節省時間
- ✅ 根據報告修正 Must-fix items
- ❌ 不要跳過風險管理類別（Brownfield）
- ❌ 不要在準備度 < 70% 時啟動專案

### 4. 變更管理最佳實踐
- ✅ 任何需求變更都應執行 `/correct-course`
- ✅ 保留 Sprint Change Proposal 作為記錄
- ✅ 變更後重新驗證受影響的 Stories
- ✅ 與團隊充分溝通變更影響
- ❌ 不要直接修改 Story 而不經過變更分析
- ❌ 不要忽略對既有功能的影響

### 5. 文件管理最佳實踐
- ✅ 文件超過 500 行時考慮分割
- ✅ 優先使用自動化分割（md-tree）
- ✅ 分割後維護 index.md
- ✅ 保持檔名的一致性（lowercase-dash-case）
- ❌ 不要手動複製貼上（容易漏內容）
- ❌ 不要分割正在頻繁修改的文件

---

## 技術細節補充

### 反幻覺驗證 (Anti-Hallucination)
這是 `/validate-story` 最重要的功能之一：

**什麼是技術幻覺？**
- AI 產生的技術細節沒有依據
- 引用不存在的函式庫或 API
- 假設架構決策但實際未定義
- 使用未經驗證的技術模式

**如何避免？**
- 所有技術主張必須可追溯到來源文件（PRD、Architecture）
- Dev Notes 內容必須與架構規格一致
- 不應出現「發明」的技術決策
- 所有引用必須正確且可存取

**範例**:
```
❌ 錯誤: "使用 Redis 快取使用者 session"
   （但 Architecture 文件從未提及 Redis）

✅ 正確: "根據 architecture.md 第 3.2 節，使用 Redis 快取使用者 session"
   （有明確來源引用）
```

---

## 版本記錄

- **v1.0** (2025-01-08): 初版建立
  - 包含所有 8 個指令的完整說明
  - 指令對比表
  - 工作流程建議
  - 學習路徑建議
  - 最佳實踐

---

## 相關資源

- **專案 README**: `/README.md` - 專案整體說明
- **BMAD 方法論**: `/.bmad-core/` - 完整的 BMAD 核心檔案
- **環境設定**: `/.env.example` - 環境變數範本

---

**最後更新**: 2025-01-08
**維護者**: VibeHub Team
