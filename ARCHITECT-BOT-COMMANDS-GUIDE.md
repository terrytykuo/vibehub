# Architect Bot 指令完整指南

本文件提供 Architect Bot (Winston - Architect) 所有可用指令的詳細說明與使用建議。

---

## 快速參考：完整指令對比表

| 指令 | 主要用途 | 使用時機 | 產出 | 參數 | 執行模式 |
|------|---------|---------|------|------|---------|
| `/help` | 顯示幫助資訊 | 不熟悉指令時 | 所有可用命令列表 | 無 | 即時 |
| `/create-backend-architecture` | 建立後端架構文件 | 需要定義後端系統架構時 | Backend Architecture Document | 無 | 互動式 / YOLO |
| `/create-brownfield-architecture` | 建立 Brownfield 架構文件 | 為既有系統建立架構文件時 | Brownfield Architecture Document | 無 | 互動式 / YOLO |
| `/create-front-end-architecture` | 建立前端架構文件 | 需要定義前端技術架構時 | Frontend Architecture Document | 無 | 互動式 / YOLO |
| `/create-full-stack-architecture` | 建立全端架構文件 | 全端專案需要完整架構時 | Full-Stack Architecture Document | 無 | 互動式 / YOLO |
| `/document-project` | 為既有專案建立文件 | 需要為現有專案建立文件時 | Brownfield Project Documentation | 無 | 互動式 |
| `/execute-checklist` | 執行架構驗證清單 | 架構設計完成後驗證時 | 架構驗證報告 + 風險評估 | `{checklist}` (選填) | 互動式 / 綜合模式 |
| `/research` | 深度技術研究 | 需要深入研究技術主題時 | 研究 Prompt（用於深度研究） | `{topic}` (必填) | 互動式 |
| `/shard-prd` | 分割 Architecture 文件 | Architecture 文件過大時 | 分割後的多個小文件 | 無 | 自動 / 手動 |
| `/doc-out` | 輸出完整文件 | 需要輸出目前文件內容時 | 完整文件內容 | 無 | 即時 |
| `/yolo` | 切換 YOLO 模式 | 想要快速建立文件時 | 模式切換確認 | 無 | 即時 |
| `/clear` | 清除對話歷史 | 需要重新開始對話 | 確認訊息 | 無 | 即時 |

---

## Architect Bot 角色定位

**名稱**: Winston
**角色**: Holistic System Architect & Full-Stack Technical Leader
**專長**: 系統設計、架構文件、技術選型、API 設計、基礎設施規劃

### 核心特質
- 🏗️ **Comprehensive（全面性）**: 考慮系統的所有層面
- 🏗️ **Pragmatic（務實）**: 選擇實用的技術方案
- 🏗️ **User-centric（使用者中心）**: 從使用者體驗出發設計架構
- 🏗️ **Technically deep yet accessible（技術深度與易懂兼具）**: 深入技術但保持文件可讀性

### 核心原則
1. **Holistic System Thinking** - 將每個元件視為更大系統的一部分
2. **User Experience Drives Architecture** - 從使用者旅程反推架構設計
3. **Pragmatic Technology Selection** - 可能時選擇成熟技術，必要時採用新技術
4. **Progressive Complexity** - 設計簡單但可擴展的系統
5. **Cross-Stack Performance Focus** - 跨層級全面優化效能
6. **Developer Experience as First-Class Concern** - 重視開發者體驗
7. **Security at Every Layer** - 實施深度防禦
8. **Data-Centric Design** - 讓資料需求驅動架構
9. **Cost-Conscious Engineering** - 平衡技術理想與財務現實
10. **Living Architecture** - 為變化和適應而設計

---

## 按功能分類

### 📝 創建類指令

| 指令 | 建立內容 | 適用專案類型 | 複雜度 |
|------|---------|-------------|-------|
| `/create-backend-architecture` | Backend Architecture | Backend/Microservices | 高 |
| `/create-brownfield-architecture` | Brownfield Architecture | 既有系統增強 | 高 |
| `/create-front-end-architecture` | Frontend Architecture | 前端專案 | 高 |
| `/create-full-stack-architecture` | Full-Stack Architecture | 全端專案 | 非常高 |
| `/document-project` | Brownfield Documentation | 既有專案 | 高 |

### ✅ 驗證類指令

| 指令 | 驗證對象 | 驗證深度 | 產出決策 |
|------|---------|---------|---------|
| `/execute-checklist` | 架構文件 | 10 大類別檢查 | 架構驗證報告 |

### 🔍 研究類指令

| 指令 | 研究內容 | 使用工具 | 複雜度 |
|------|---------|---------|-------|
| `/research` | 技術主題 | 深度研究 Prompt | 中 |

### 🛠️ 工具類指令

| 指令 | 功能 | 頻率 |
|------|------|------|
| `/help` | 顯示說明 | 按需 |
| `/shard-prd` | 分割文件 | 按需 |
| `/doc-out` | 輸出文件 | 按需 |
| `/yolo` | 模式切換 | 按需 |
| `/clear` | 清除歷史 | 按需 |

---

## 詳細指令說明

### 1. `/create-backend-architecture` - 建立後端架構文件

**用途**: 為後端系統建立完整的架構文件

**執行模式**:
- **互動模式**（預設）: 逐節建立，深度討論每個技術決策
- **YOLO 模式**: 輸入 `/yolo` 切換為批次處理

**產出**: 完整的 `architecture.md` 文件

#### 主要章節

**1. Introduction（介紹）**
- 文件範圍和目的
- Starter Template 決策（是否使用現有框架）
- Change Log（變更記錄）

**2. High Level Architecture（高層架構）**
- Technical Summary（技術摘要）
- High Level Overview（高層概觀）
  - 架構風格（Monolith/Microservices/Serverless/Event-Driven）
  - Repository 結構（Monorepo/Polyrepo）
  - Service 架構決策
- High Level Project Diagram（Mermaid 架構圖）
- Architectural and Design Patterns（架構與設計模式）

**範例 - Architectural Patterns**:
```markdown
- **Serverless Architecture:** 使用 AWS Lambda - _Rationale:_ 符合 PRD 的成本優化需求
- **Repository Pattern:** 抽象資料存取層 - _Rationale:_ 支援測試和未來資料庫遷移
- **Event-Driven Communication:** 使用 SNS/SQS - _Rationale:_ 支援非同步處理和系統韌性
```

**3. Tech Stack** ⭐ 最重要
- Cloud Infrastructure
- Technology Stack Table
  - 包含：Category, Technology, Version, Purpose, Rationale
  - 必須指定精確版本（不能用 "latest"）
  - 這是唯一的真實來源（Single Source of Truth）

**範例 - Tech Stack Table**:
| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Language** | TypeScript | 5.3.3 | 主要開發語言 | 強型別、優秀工具、團隊專長 |
| **Runtime** | Node.js | 20.11.0 | JavaScript 執行環境 | LTS 版本、穩定效能 |
| **Framework** | NestJS | 10.3.2 | 後端框架 | 企業級、良好 DI、符合團隊模式 |
| **Database** | PostgreSQL | 15.4 | 主要資料庫 | ACID、關聯式、豐富生態系 |

**4. Data Models（資料模型）**
- 核心業務實體定義
- 屬性和資料型別
- 模型間關係

**5. Components（元件）**
- 主要邏輯元件/服務及職責
- Repository 結構對應
- 元件間互動

**6. Source Tree（原始碼結構）**
- 專案目錄結構（ASCII 樹狀圖）
- 檔案命名慣例
- 模組組織原則

**7. API Design（API 設計）**
- RESTful API 規範
- GraphQL Schema（如適用）
- API 版本管理策略
- 錯誤處理格式

**8. Authentication & Authorization（認證與授權）**
- 認證機制（JWT/OAuth/Session）
- 授權模型（RBAC/ABAC）
- Session 管理

**9. Data Layer（資料層）**
- Database Schema
- ORM/Query Builder 選擇
- Migration 策略
- Connection Pooling

**10. Infrastructure（基礎設施）**
- Deployment Architecture
- CI/CD Pipeline
- Monitoring & Logging
- Scaling Strategy

**11. Security（安全性）**
- Security Best Practices
- Data Encryption
- API Security
- Vulnerability Management

**12. Testing Strategy（測試策略）**
- Unit Testing
- Integration Testing
- E2E Testing
- Performance Testing

**使用範例**:
```
/create-backend-architecture
```

**適用情境**: Greenfield 後端專案、微服務架構、API 服務

---

### 2. `/create-brownfield-architecture` - 建立 Brownfield 架構文件

**用途**: 為既有系統建立反映「真實現況」的架構文件

**特色**:
- ⚠️ **不是理想架構，而是實際現況**
- 包含技術債、workarounds、legacy code
- 誠實記錄不一致的模式
- 明確標示不可修改的區域

**產出**: `brownfield-architecture.md`

#### 與一般 Architecture 的差異

| 項目 | Greenfield Architecture | Brownfield Architecture |
|------|------------------------|-------------------------|
| **目的** | 定義理想架構 | 記錄實際現況 |
| **內容** | 設計決策和模式 | 真實狀態 + 技術債 |
| **技術債** | 不適用 | **明確記錄** |
| **Workarounds** | 不適用 | **必須包含** |
| **Legacy Code** | 不適用 | **標示不可改區域** |
| **不一致** | 應避免 | **誠實記錄** |

#### 主要章節

**1. Introduction**
- 文件範圍（如有 PRD，專注於相關區域）
- Change Log

**2. Quick Reference - Key Files and Entry Points**
- 關鍵檔案清單
- 系統入口點
- 核心業務邏輯位置
- API 定義
- 資料模型
- 關鍵演算法

**範例**:
```markdown
### Critical Files for Understanding the System
- **Main Entry**: `src/index.js`
- **Configuration**: `config/app.config.js`, `.env.example`
- **Core Business Logic**: `src/services/`
- **API Definitions**: `src/routes/`
- **Database Models**: `src/models/`
- **Key Algorithms**: `src/utils/complexCalculation.js` (payment calculation logic)
```

**3. High Level Architecture**
- Technical Summary
- Actual Tech Stack（從 package.json/requirements.txt 取得）
- Repository Structure Reality Check

**4. Source Tree and Module Organization**
- Project Structure（實際狀況）
- 包含註解說明不一致之處

**範例**:
```text
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic (NOTE: 不一致的模式 - user 和 payment 服務不同)
├── models/          # Database models (Sequelize)
├── utils/           # 混合包 - 需要重構
└── legacy/          # ⚠️ DO NOT MODIFY - 舊的 payment 系統仍在使用中
```

**5. Technical Debt and Known Issues** ⚠️ 關鍵章節
- Critical Technical Debt（關鍵技術債）
- Workarounds and Gotchas（變通方法與陷阱）

**範例**:
```markdown
### Critical Technical Debt
1. **Payment Service**: `src/legacy/payment.js` 中的 legacy code - 高度耦合、無測試
2. **User Service**: 與其他服務模式不同，使用 callbacks 而非 promises
3. **Database Migrations**: 手動追蹤，沒有適當的 migration 工具

### Workarounds and Gotchas
- **Environment Variables**: 即使是 staging 也必須設定 `NODE_ENV=production`（歷史原因）
- **Database Connections**: Connection pool 硬編碼為 10，改變會破壞 payment service
```

**6. Integration Points and External Dependencies**
- External Services
- Internal Integration Points

**7. If Enhancement PRD Provided - Impact Analysis**
- 需要修改的檔案清單
- 需要新增的檔案/模組
- 整合考量事項

**使用範例**:
```
/create-brownfield-architecture
```

**適用情境**: 既有系統增強、遺留系統現代化、技術債管理

---

### 3. `/create-front-end-architecture` - 建立前端架構文件

**用途**: 為前端專案建立技術架構文件

**前置需求**: 建議先有 UI/UX Specification（由 UX Bot 建立）

**產出**: `front-end-architecture.md`

#### 主要章節

**1. Introduction**
- 文件目的
- 與 UI/UX Spec 的關係
- Change Log

**2. Framework & Core Libraries**
- Frontend Framework 選擇（React/Vue/Angular/Svelte）
- 版本和理由
- 核心函式庫

**3. Component Architecture**
- 元件組織方法（Atomic Design/Feature-based/Domain-driven）
- Component 層級結構
- 元件命名慣例

**4. State Management**
- State Management 策略（Redux/Zustand/Pinia/Context API）
- Global vs Local State
- State 結構設計

**5. Data Flow**
- 資料流模式
- API 整合層
- Error Handling

**6. Styling Approach**
- CSS 方法論（CSS Modules/Styled Components/Tailwind）
- Theme 系統
- Responsive Design 實作

**7. Directory Structure**
- 專案目錄結構（ASCII 樹狀圖）
- 檔案組織原則
- 模組放置規則

**8. Routing & Navigation**
- Routing 策略
- Route 定義
- Route Protection

**9. Frontend Performance**
- Code Splitting
- Lazy Loading
- Image Optimization
- Performance Monitoring

**10. Build & Bundle**
- Build Tool（Vite/Webpack/Parcel）
- Bundle 優化
- Environment 管理

**11. Testing Strategy**
- Component Testing（Jest/Vitest + Testing Library）
- E2E Testing（Playwright/Cypress）
- Visual Regression Testing

**使用範例**:
```
/create-front-end-architecture
```

**適用情境**: SPA 應用、前端專案、需要與 Backend 分離的架構

---

### 4. `/create-full-stack-architecture` - 建立全端架構文件

**用途**: 為全端專案建立完整的架構文件（整合前後端）

**產出**: `fullstack-architecture.md`

#### 特色
- 包含 Backend 和 Frontend 所有章節
- 特別關注前後端整合
- API 合約定義
- 資料流完整性

#### 額外章節（相比單獨的前後端架構）

**Frontend-Backend Integration**
- API Client 設定
- HTTP Client Configuration
- Request/Response Interceptors
- Error Handling Strategy
- Authentication Token Management

**Shared Types & Contracts**
- TypeScript 型別共享策略
- API 合約定義
- Schema Validation

**Development Workflow**
- Full-Stack 開發流程
- Local Development Setup
- Hot Reload 設定
- Debugging 策略

**Deployment Strategy**
- Monorepo Deployment
- Frontend/Backend 分離部署
- CI/CD Pipeline（完整流程）

**使用範例**:
```
/create-full-stack-architecture
```

**適用情境**: Monorepo 專案、緊密整合的前後端、中小型全端應用

---

### 5. `/document-project` - 為既有專案建立文件

**用途**: 為現有專案（沒有文件或文件不足）建立完整的 Brownfield 文件

**執行流程**:

#### 步驟 1: 檢查 PRD
- 如果有 PRD → 專注於相關區域
- 如果沒有 PRD → 詢問使用者：
  1. 是否先建立 PRD？
  2. 是否有既有需求文件？
  3. 能否描述計劃的增強功能？
  4. 還是要完整文件化整個專案？

#### 步驟 2: 專案分析
Bot 會進行：
1. **專案結構探索**：檢視目錄結構
2. **技術堆疊識別**：查看 package.json, requirements.txt 等
3. **Build 系統分析**：找出建置腳本、CI/CD 設定
4. **既有文件審查**：檢查 README、docs 資料夾
5. **程式碼模式分析**：取樣關鍵檔案理解模式

#### 步驟 3: Elicitation Questions
Bot 會詢問：
- 專案的主要目的是什麼？
- 是否有特別複雜或重要的區域？
- 預期 AI agents 執行什麼任務？（bug fixes/features/refactoring）
- 偏好的文件格式？
- 目標技術層級？（junior/senior/mixed）
- 是否有特定的功能或增強計畫？

#### 步驟 4: 深度程式碼分析
- 探索關鍵區域（entry points、config、dependencies）
- 詢問澄清問題
- 對應真實狀況（不是理論最佳實踐）

#### 步驟 5: 產出文件
生成 `brownfield-architecture.md` 包含：
- 實際狀態（包含技術債）
- 關鍵檔案引用（而非重複內容）
- Workarounds 和限制
- 如果有 PRD：影響分析

**使用範例**:
```
/document-project
```

**適用情境**:
- 接手既有專案
- 遺留系統需要文件
- 準備進行系統增強前的現況分析

---

### 6. `/execute-checklist` - 執行架構驗證清單

**用途**: 在架構設計完成後，進行全面的品質驗證

**參數**:
- `{checklist}` (選填) - 預設使用 `architect-checklist`

**執行模式**:
- **互動模式**: 逐節審查，每節確認後進行下一節
- **綜合模式**: 完整分析後產出報告

**必要文件**:
在執行前，Bot 會檢查：
1. `architecture.md` - 主要架構文件
2. `prd.md` - PRD（用於需求對齊）
3. `frontend-architecture.md` - 如果是 UI 專案
4. System Diagrams
5. API Documentation
6. Technology Stack Details

#### 驗證類別（10 大類）

**1. REQUIREMENTS ALIGNMENT（需求對齊）**
- Functional Requirements Coverage
- Non-Functional Requirements Alignment
- Technical Constraints Adherence

**2. ARCHITECTURE FUNDAMENTALS（架構基礎）**
- Architecture Clarity
- Separation of Concerns
- Design Patterns & Best Practices
- Modularity & Maintainability

**3. TECHNICAL STACK & DECISIONS（技術堆疊與決策）**
- Technology Selection
- Frontend Architecture [[FRONTEND ONLY]]
- Backend Architecture
- Data Architecture

**4. FRONTEND DESIGN & IMPLEMENTATION [[FRONTEND ONLY]]**
- Frontend Philosophy & Patterns
- Frontend Structure & Organization
- Component Design
- Frontend-Backend Integration
- Routing & Navigation
- Frontend Performance

**5. RESILIENCE & OPERATIONAL READINESS（韌性與營運就緒）**
- Error Handling & Resilience
- Monitoring & Observability
- Performance & Scaling
- Deployment & DevOps

**6. SECURITY & COMPLIANCE（安全與合規）**
- Authentication & Authorization
- Data Security
- API & Service Security
- Infrastructure Security

**7. IMPLEMENTATION GUIDANCE（實作指引）**
- Coding Standards & Practices
- Testing Strategy
- Frontend Testing [[FRONTEND ONLY]]
- Development Environment
- Technical Documentation

**8. DEPENDENCY & INTEGRATION MANAGEMENT（依賴與整合管理）**
- External Dependencies
- Internal Dependencies
- Third-Party Integrations

**9. AI AGENT IMPLEMENTATION SUITABILITY（AI Agent 實作適用性）**
- Modularity for AI Agents
- Clarity & Predictability
- Implementation Guidance
- Error Prevention & Handling

**10. ACCESSIBILITY IMPLEMENTATION [[FRONTEND ONLY]]**
- Accessibility Standards
- Accessibility Testing

#### 產出報告

**1. Executive Summary（執行摘要）**
- 整體架構就緒度（High/Medium/Low）
- 關鍵風險識別
- 架構主要優勢
- 專案類型和評估章節

**2. Section Analysis（章節分析）**
- 每個主要章節的通過率（百分比）
- 最令人擔憂的失敗或缺口
- 需要立即關注的章節

**3. Risk Assessment（風險評估）**
- Top 5 risks by severity
- 每個風險的緩解建議
- 解決問題對時程的影響

**4. Recommendations（建議）**
- Must-fix items（開發前必須修正）
- Should-fix items（提升品質）
- Nice-to-have improvements

**5. AI Implementation Readiness（AI 實作就緒度）**
- AI agent 實作的特定考量
- 需要額外澄清的區域
- 複雜度熱點

**6. Frontend-Specific Assessment（前端特定評估）** (如適用)
- Frontend 架構完整性
- 主架構與前端架構文件的對齊
- UI/UX 規格涵蓋度
- 元件設計清晰度

**使用範例**:
```
/execute-checklist
```
或指定特定 checklist:
```
/execute-checklist architect-checklist
```

**適用情境**:
- 架構設計完成後的驗證
- 開發前的品質檢查
- 找出架構缺陷和風險

---

### 7. `/research` - 深度技術研究

**用途**: 為特定技術主題建立深度研究 Prompt

**參數**:
- `{topic}` (必填) - 要研究的主題

**產出**: 優化的研究 Prompt（可用於 Web Search 或其他研究工具）

**使用範例**:
```
/research serverless architecture patterns
/research postgresql vs mongodb for e-commerce
/research react state management solutions 2024
```

**產出範例**:
```markdown
## Deep Research Prompt: Serverless Architecture Patterns

### Research Objectives
1. Understand current serverless architecture patterns in 2024
2. Compare AWS Lambda, Azure Functions, Google Cloud Functions
3. Identify best practices for microservices architecture
4. Evaluate cost implications and performance characteristics

### Key Questions to Answer
- What are the most common serverless patterns?
- How do different cloud providers compare?
- What are the cold start mitigation strategies?
- What are the cost optimization techniques?

### Research Scope
- Focus on production-ready patterns
- Include real-world case studies
- Consider scalability and reliability
- Evaluate developer experience

### Output Format
Please provide:
1. Summary of key findings (3-5 bullet points)
2. Comparison table of major providers
3. Best practices recommendations
4. Potential pitfalls to avoid
5. Further reading resources
```

**適用情境**:
- 技術選型前的研究
- 深入了解特定技術
- 比較不同方案

---

### 8. `/shard-prd` - 分割 Architecture 文件

**用途**: 將大型 `architecture.md` 分割成多個小文件

**功能**: 與 PO Bot 的 `/shard-doc` 類似，但專門用於 Architecture 文件

**使用範例**:
```
/shard-prd
```

**產出**:
```
docs/architecture/
├── index.md
├── introduction.md
├── high-level-architecture.md
├── tech-stack.md
├── data-models.md
├── components.md
├── source-tree.md
└── ...
```

**適用情境**: Architecture 文件超過 500 行時

---

### 9. `/doc-out` - 輸出完整文件

**用途**: 輸出目前正在編輯的文件的完整內容

**使用範例**:
```
/doc-out
```

**適用情境**: 需要查看目前文件的完整狀態

---

### 10. `/yolo` - 切換 YOLO 模式

**用途**: 在互動模式和 YOLO 模式之間切換

**使用範例**:
```
/yolo
```

**效果**:
- 從逐節建立 → 批次建立
- 或從批次建立 → 逐節建立

---

### 11. `/help` - 顯示幫助

**用途**: 顯示 Architect Bot 所有可用命令

---

### 12. `/clear` - 清除歷史

**用途**: 清除當前 channel 或 thread 的對話歷史

---

## 工作流程建議

### 情境 A: Greenfield 全端專案

```
1. [準備] PO Bot: /create-story
   → 建立初始 Stories

2. Architect Bot: /create-full-stack-architecture
   → 建立完整的全端架構
   → 定義 Tech Stack、Data Models、API Design

3. UX Bot: /create-front-end-spec
   → 根據架構定義 UI/UX 規格

4. Architect Bot: /execute-checklist
   → 驗證架構完整性
   → 識別風險和缺口

5. [根據報告修正問題]

6. 開始開發
```

### 情境 B: Backend 服務專案

```
1. [準備] 確保有 PRD

2. Architect Bot: /create-backend-architecture
   → 定義後端架構
   → Tech Stack 選擇（特別注意資料庫選型）
   → API 設計
   → Data Models

3. Architect Bot: /execute-checklist
   → 驗證架構（會跳過 Frontend 相關章節）

4. [修正問題]

5. PO Bot: /create-story
   → 根據架構建立實作 Stories

6. 開始開發
```

### 情境 C: Brownfield 專案增強

```
1. Architect Bot: /document-project
   → 分析現有專案
   → 建立 Brownfield Architecture 文件
   → 識別技術債和限制

2. PO Bot: /create-epic
   → 建立增強 Epic

3. Architect Bot: /create-brownfield-architecture
   → 更新架構文件
   → 說明增強對現有系統的影響

4. Architect Bot: /execute-checklist
   → 驗證增強計畫

5. PO Bot: /create-story
   → 建立具體的實作 Stories

6. 開始開發（小心處理 legacy code）
```

### 情境 D: 技術選型研究

```
1. [確認需求] 了解專案需求

2. Architect Bot: /research {topic}
   → 例如: /research react vs vue for enterprise
   → 產生深度研究 Prompt

3. [使用 Prompt 進行研究]
   → WebSearch 或其他研究工具

4. [基於研究結果]

5. Architect Bot: /create-backend-architecture
   → 或其他 architecture 指令
   → 在 Tech Stack 章節說明選擇理由
```

### 情境 E: 前端專案重構

```
1. [現況分析]
   Architect Bot: /document-project
   → 文件化現有前端架構

2. UX Bot: /create-front-end-spec
   → 重新定義 UI/UX 規格

3. Architect Bot: /create-front-end-architecture
   → 定義新的前端架構
   → 說明與舊架構的差異

4. Architect Bot: /execute-checklist
   → 驗證新架構

5. [制定遷移計畫]
   → 漸進式重構策略
```

---

## 指令優先級建議

### ⭐ 必學指令（核心功能）

#### 1. `/create-backend-architecture` 或 `/create-full-stack-architecture` - 最重要
**原因**: 架構文件是開發的基礎

**建議**:
- 先從小專案練習
- 特別關注 Tech Stack 章節（最關鍵）
- 理解每個架構模式的適用情境
- 學習如何使用 Mermaid 繪製架構圖

**學習重點**:
- Tech Stack 選擇和版本管理
- Data Models 設計
- API Design 原則
- Security 考量

#### 2. `/execute-checklist` - 品質保證
**原因**: 避免架構缺陷，減少後續返工

**建議**:
- 架構完成後一定要執行
- 認真對待 Must-fix items
- 理解每個驗證類別的意義
- 使用綜合模式節省時間

#### 3. `/document-project` - Brownfield 必備
**原因**: 為既有專案建立文件是常見任務

**建議**:
- 誠實記錄技術債
- 標示不可修改區域
- 如果有 PRD，專注於相關區域
- 建立後用 `/execute-checklist` 驗證

---

### 🔧 進階指令（提升品質）

#### 4. `/create-brownfield-architecture` - 既有系統增強
**原因**: 許多專案都是在既有系統上增強

**建議**:
- 記錄實際狀況而非理想狀況
- 明確標示技術債
- 說明 workarounds 的原因

#### 5. `/research` - 技術選型
**原因**: 深入研究幫助做出更好的技術決策

**建議**:
- 在 Tech Stack 選擇前使用
- 比較不同方案的 pros/cons
- 考慮團隊專長和專案需求

---

### 🛠️ 輔助指令（特定情境）

#### 6. `/create-front-end-architecture` - 前端專案
**原因**: 僅限前端專案或需要前後端分離時

**建議**:
- 與 UX Bot 協作
- 確保與 Backend Architecture 對齊

#### 7. `/shard-prd` - 文件管理
**原因**: 大型 Architecture 文件難以維護

**建議**:
- 文件超過 500 行時使用
- 優先使用自動化方式

#### 8. `/doc-out`, `/yolo`, `/clear` - 工具指令
**原因**: 按需使用的輔助工具

---

## 最佳實踐建議

### 1. 建立架構文件最佳實踐

✅ **DO（建議做）**:
- 先閱讀 PRD 理解需求
- Tech Stack 選擇要有明確理由
- 指定精確版本（不要用 "latest"）
- 使用 Mermaid 繪製架構圖
- 考慮 Security 從一開始就設計
- 記錄每個重要決策的 Rationale
- 與團隊討論技術選擇
- 考慮 Developer Experience

❌ **DON'T（避免）**:
- 不要跳過 Tech Stack 驗證
- 不要使用模糊的版本號（如 "^1.0.0"、"latest"）
- 不要忽略 Security 考量
- 不要過度設計（YAGNI 原則）
- 不要忘記考慮 Scaling 策略
- 不要在沒有 PRD 的情況下建立架構
- 不要選擇團隊不熟悉的技術（除非有充分理由）

### 2. Tech Stack 選擇最佳實踐

✅ **DO（建議做）**:
- 優先選擇成熟、穩定的技術（Boring Technology）
- 考慮團隊現有專長
- 檢查社群支援和生態系
- 驗證 License 相容性
- 考慮長期維護成本
- 使用 LTS 版本
- 記錄選擇理由（Rationale）
- 考慮 Cloud Provider 的原生服務

❌ **DON'T（避免）**:
- 不要追逐最新潮流技術
- 不要選擇沒有社群支援的工具
- 不要忽略 Licensing 問題
- 不要使用 Beta 或 RC 版本在 Production
- 不要過度依賴單一供應商
- 不要忽視效能需求

### 3. Brownfield Architecture 最佳實踐

✅ **DO（建議做）**:
- 誠實記錄技術債
- 明確標示不可修改區域（Legacy Code）
- 說明 Workarounds 的原因
- 記錄不一致的模式
- 如果有 PRD，專注於相關區域
- 包含 Gotchas 和陷阱
- 引用實際檔案而非重複內容
- 提供 Impact Analysis

❌ **DON'T（避免）**:
- 不要美化現況（要記錄真實狀態）
- 不要忽略技術債
- 不要假設所有程式碼都可以改
- 不要遺漏關鍵的 Workarounds
- 不要重複程式碼內容（應引用檔案）

### 4. 架構驗證最佳實踐

✅ **DO（建議做）**:
- 架構完成後一定要執行 `/execute-checklist`
- 認真對待 Must-fix items
- 優先修正 Security 相關問題
- 考慮 AI Agent 實作適用性
- Frontend 專案一定要檢查 Accessibility
- 記錄風險緩解計畫
- 與團隊討論驗證結果

❌ **DON'T（避免）**:
- 不要跳過驗證
- 不要忽略 Should-fix items
- 不要在有 Critical Issues 時開始開發
- 不要忽視 AI Implementation Readiness
- 不要省略 Security 檢查

### 5. API 設計最佳實踐

✅ **DO（建議做）**:
- 使用 RESTful 原則
- 版本化 API（`/api/v1/...`）
- 定義清楚的錯誤格式
- 使用標準 HTTP Status Codes
- 提供 API 文件（OpenAPI/Swagger）
- 實作 Rate Limiting
- 考慮 Pagination
- 使用 HTTPS

❌ **DON'T（避免）**:
- 不要在 URL 中使用動詞（用 HTTP Methods）
- 不要回傳不一致的錯誤格式
- 不要忽略 API 安全性
- 不要忘記版本管理
- 不要暴露內部實作細節

---

## 常見問題 (FAQ)

### Q1: 什麼時候用 Backend vs Full-Stack Architecture？
**A**: 視專案架構而定

**使用 Backend Architecture**:
- 純後端 API 服務
- 微服務架構中的單一服務
- Frontend 由其他團隊負責
- Frontend 使用不同技術堆疊

**使用 Full-Stack Architecture**:
- Monorepo 專案
- 前後端緊密整合
- 小型到中型全端應用
- 同一團隊負責前後端

### Q2: Tech Stack 如何選擇版本？
**A**: 遵循以下原則

**✅ 建議**:
- 使用 LTS（Long Term Support）版本
- 指定精確版本（如 `20.11.0`）
- 避免使用 `^` 或 `~`（在 Architecture 文件中）
- 檢查安全性更新

**範例**:
```
✅ Good: Node.js 20.11.0 (LTS)
❌ Bad: Node.js ^20.0.0
❌ Bad: Node.js latest
```

### Q3: 如何處理技術選型的爭議？
**A**: 使用 `/research` 和數據驅動決策

**流程**:
1. 使用 `/research` 深入研究兩個方案
2. 建立比較表（Pros/Cons）
3. 考慮：
   - 團隊專長
   - 專案需求
   - 長期維護
   - 社群支援
   - 效能需求
4. 在 Tech Stack 的 Rationale 欄位說明選擇理由
5. 與團隊討論並達成共識

### Q4: Brownfield 和 Greenfield Architecture 可以共存嗎？
**A**: 可以，但要明確區分

**情境**:
- Brownfield Architecture: 記錄現有系統
- Greenfield Architecture: 定義新增模組

**建議**:
- 分別建立兩份文件
- 在 Brownfield 文件中引用 Greenfield 計畫
- 明確標示新舊系統的邊界

### Q5: 架構驗證失敗怎麼辦？
**A**: 根據報告優先級修正

**步驟**:
1. 查看 Executive Summary 的就緒度
2. 優先修正 Must-fix items
3. 考慮 Should-fix items
4. Nice-to-have 可延後
5. 修正後重新執行 `/execute-checklist`
6. 確保至少達到 Medium 就緒度再開發

### Q6: 如何確保架構的 AI Agent 適用性？
**A**: 關注 Section 9 的驗證項目

**關鍵要素**:
- ✅ 元件大小適中（不要太大或太小）
- ✅ 依賴最小化
- ✅ 介面清楚定義
- ✅ 模式一致且可預測
- ✅ 避免過於聰明的寫法
- ✅ 提供範例
- ✅ 職責明確

### Q7: Monorepo 還是 Polyrepo？
**A**: 視專案規模和團隊結構

**Monorepo 適合**:
- 小型到中型專案
- 緊密整合的前後端
- 共享程式碼多
- 單一團隊

**Polyrepo 適合**:
- 大型專案
- 微服務架構
- 不同團隊負責不同服務
- 獨立部署需求

**在 Architecture 的 High Level Overview 章節說明選擇**

### Q8: 如何處理 Legacy Code？
**A**: 在 Brownfield Architecture 明確標示

**策略**:
1. **DO NOT MODIFY 區域**:
   - 在目錄結構中明確標示
   - 說明為何不能改
   - 提供替代方案

2. **Technical Debt 記錄**:
   - 列入 Technical Debt 章節
   - 說明影響範圍
   - 評估重構成本

3. **Workarounds**:
   - 記錄所有變通方法
   - 說明原因
   - 警告可能的陷阱

### Q9: 如何平衡理想架構和實際限制？
**A**: 務實主義

**原則**:
- **Start Simple**: 從簡單開始
- **YAGNI**: You Aren't Gonna Need It
- **Boring Technology**: 優先選擇成熟技術
- **Progressive Complexity**: 設計可擴展但初期簡單

**在 Architectural Patterns 章節說明權衡**

### Q10: 架構文件多久更新一次？
**A**: 視變更頻率而定

**建議**:
- **Major Changes**: 立即更新
- **Tech Stack 變更**: 立即更新 Tech Stack 章節
- **新增元件**: 更新 Components 章節
- **API 變更**: 更新 API Design 章節
- **定期審查**: 每季審查一次

**使用 Change Log 追蹤所有變更**

---

## 與其他 Bot 的協作

### 與 PO Bot 協作

| PO Bot | Architect Bot | 協作點 |
|--------|--------------|-------|
| `/create-story` | `/create-backend-architecture` | PO 建立 Story 前，Architect 定義技術架構 |
| `/validate-story` | `/execute-checklist` | 確保 Story 與架構對齊 |
| `/execute-checklist` (PO Master) | `/execute-checklist` (Architect) | 兩者互補，分別驗證需求和技術 |

**典型流程**:
```
1. PO: 建立 PRD
2. Architect: /create-backend-architecture（基於 PRD）
3. Architect: /execute-checklist（驗證架構）
4. PO: /create-story（基於架構）
5. PO: /validate-story（確保技術可行）
```

### 與 UX Bot 協作

| UX Bot | Architect Bot | 協作點 |
|--------|--------------|-------|
| `/create-front-end-spec` | `/create-front-end-architecture` | UX 定義介面，Architect 定義技術實作 |
| `/generate-ui-prompt` | Tech Stack 決策 | 確保 AI 工具與技術堆疊相容 |

**典型流程**:
```
1. UX: /create-front-end-spec（定義 UI/UX）
2. Architect: /create-front-end-architecture（定義技術實作）
3. Architect: 確保 Component 架構與 UX 規格對齊
4. UX: /generate-ui-prompt（基於 Architecture）
```

### 三個 Bot 的完整協作流程

```
1. PO Bot: /create-epic（定義功能範圍）

2. UX Bot: /create-front-end-spec（定義 UI/UX）

3. Architect Bot: /create-full-stack-architecture
   → 定義完整技術架構
   → Tech Stack 決策
   → 整合前後端

4. Architect Bot: /execute-checklist
   → 驗證架構完整性

5. PO Bot: /create-story
   → 基於架構建立 Stories

6. PO Bot: /validate-story
   → 確保 Stories 與架構對齊

7. UX Bot: /generate-ui-prompt
   → 為 AI 工具生成 Prompt

8. 開始開發
```

---

## 相關資源

- **PO Bot 指令指南**: `/PO-BOT-COMMANDS-GUIDE.md`
- **UX Bot 指令指南**: `/UX-BOT-COMMANDS-GUIDE.md`
- **專案 README**: `/README.md`
- **BMAD 方法論**: `/.bmad-core/`
- **Architect Agent 定義**: `/.bmad-core/agents/architect.md`

### 外部資源

**架構參考**:
- [The Twelve-Factor App](https://12factor.net/) - 現代應用架構原則
- [C4 Model](https://c4model.com/) - 軟體架構視覺化
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)

**技術選型參考**:
- [Stack Overflow Developer Survey](https://insights.stackoverflow.com/survey) - 技術趨勢
- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar) - 技術評估
- [State of JS](https://stateofjs.com/) - JavaScript 生態系

**架構模式**:
- [Microservices Patterns](https://microservices.io/patterns/) - 微服務模式
- [Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) - 雲端設計模式

---

**最後更新**: 2025-01-08
**維護者**: VibeHub Team
