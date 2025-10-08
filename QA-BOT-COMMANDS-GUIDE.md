# QA Bot 指令完整指南

本文件提供 QA Bot (Quinn - Test Architect & Quality Advisor) 所有可用指令的詳細說明與使用建議。

---

## 快速參考：完整指令對比表

| 指令 | 主要用途 | 使用時機 | 產出 | 參數 | 執行模式 |
|------|---------|---------|------|------|---------|
| `/help` | 顯示幫助資訊 | 不熟悉指令時 | 所有可用命令列表 | 無 | 即時 |
| `/review` | 綜合品質審查 | Story 開發完成後 | QA Results + Quality Gate File | `{story}` (必填) | 適應性風險評估 |
| `/gate` | 建立/更新品質閘門 | 需要品質決策時 | Quality Gate YAML File | `{story}` (必填) | 決策導向 |
| `/test-design` | 設計測試策略 | 開發前規劃測試 | Test Design Document | `{story}` (必填) | 策略規劃 |
| `/trace` | 需求追溯 | 驗證測試覆蓋率 | Requirements Traceability Matrix | `{story}` (必填) | 追溯分析 |
| `/risk-profile` | 風險評估 | 識別實作風險 | Risk Assessment Matrix | `{story}` (必填) | 風險分析 |
| `/nfr-assess` | 非功能需求驗證 | 驗證效能/安全/可靠性 | NFR Assessment Report | `{story}` (必填) | NFR 驗證 |
| `/clear` | 清除對話歷史 | 需要重新開始對話 | 確認訊息 | 無 | 即時 |

---

## QA Bot 角色定位

**名稱**: Quinn
**角色**: Test Architect with Quality Advisory Authority
**專長**: 測試架構審查、品質閘門決策、程式碼改善建議

### 核心特質
- 🧪 **Comprehensive（全面性）**: 系統化的品質分析
- 🧪 **Systematic（系統化）**: 遵循結構化的驗證流程
- 🧪 **Advisory（顧問性）**: 提供建議而非阻擋進度
- 🧪 **Educational（教育性）**: 透過文件教育團隊
- 🧪 **Pragmatic（務實）**: 區分必須修正和可選改善

### 核心原則
1. **Depth As Needed** - 根據風險訊號決定深度，低風險保持簡潔
2. **Requirements Traceability** - 使用 Given-When-Then 模式對應所有 Story 到測試
3. **Risk-Based Testing** - 根據機率 × 影響評估和優先化
4. **Quality Attributes** - 透過情境驗證 NFR（安全、效能、可靠性）
5. **Testability Assessment** - 評估可控性、可觀察性、可除錯性
6. **Gate Governance** - 提供清楚的 PASS/CONCERNS/FAIL/WAIVED 決策和理由
7. **Advisory Excellence** - 透過文件教育，絕不任意阻擋
8. **Technical Debt Awareness** - 識別和量化技術債，提供改善建議
9. **LLM Acceleration** - 使用 LLM 加速全面且專注的分析
10. **Pragmatic Balance** - 區分必須修正（must-fix）和良好改善（nice-to-have）

### 重要權限限制
⚠️ **Story 檔案權限**:
- **僅能更新** "QA Results" 章節
- **不可修改** Status, Story, Acceptance Criteria, Tasks, Dev Notes, Testing 等其他章節
- **只能附加** 審查結果到 QA Results 章節

---

## 按功能分類

### ✅ 審查類指令

| 指令 | 審查範圍 | 產出決策 | 複雜度 |
|------|---------|---------|-------|
| `/review` | 綜合品質審查 | PASS/CONCERNS/FAIL/WAIVED | 高 |
| `/gate` | 品質閘門決策 | Quality Gate File | 中 |

### 🧪 測試類指令

| 指令 | 測試內容 | 產出文件 | 複雜度 |
|------|---------|---------|-------|
| `/test-design` | 測試策略設計 | Test Design Document | 高 |
| `/trace` | 需求追溯 | Traceability Matrix | 中 |

### ⚠️ 風險類指令

| 指令 | 風險範圍 | 產出評估 | 複雜度 |
|------|---------|---------|-------|
| `/risk-profile` | 風險評估矩陣 | Risk Assessment | 高 |
| `/nfr-assess` | 非功能需求 | NFR Report | 中 |

### 🛠️ 工具類指令

| 指令 | 功能 | 頻率 |
|------|------|------|
| `/help` | 顯示說明 | 按需 |
| `/clear` | 清除歷史 | 按需 |

---

## 詳細指令說明

### 1. `/review` - 綜合品質審查 ⭐ 最重要

**用途**: 對已完成的 Story 進行全面的品質審查

**參數**:
- `{story}` (必填) - Story ID，如 `1.3`

**執行特色**:
- **適應性風險評估**: 根據風險訊號自動調整審查深度
- **自動深度審查觸發條件**:
  - Auth/Payment/Security 相關檔案被修改
  - Story 沒有新增測試
  - 程式碼差異 > 500 行
  - 上次 Gate 是 FAIL/CONCERNS
  - Story 有 > 5 個 Acceptance Criteria

#### 審查範圍（8 大項目）

**A. Requirements Traceability（需求追溯）**
- 對應每個 AC 到驗證測試（使用 Given-When-Then，非測試程式碼）
- 識別覆蓋率缺口
- 驗證所有需求都有對應測試案例

**B. Code Quality Review（程式碼品質審查）**
- 架構和設計模式
- 重構機會（並執行重構）
- 程式碼重複或低效率
- 效能優化
- 安全性漏洞
- 最佳實踐遵循

**C. Test Architecture Assessment（測試架構評估）**
- 測試覆蓋率在適當層級的充分性
- 測試層級適當性（unit vs integration vs e2e）
- 測試設計品質和可維護性
- 測試資料管理策略
- Mock/Stub 使用適當性
- Edge case 和錯誤情境覆蓋
- 測試執行時間和可靠性

**D. Non-Functional Requirements (NFRs)（非功能需求）**
- **Security**: 認證、授權、資料保護
- **Performance**: 回應時間、資源使用
- **Reliability**: 錯誤處理、恢復機制
- **Maintainability**: 程式碼清晰度、文件

**E. Testability Evaluation（可測試性評估）**
- **Controllability**: 能否控制輸入？
- **Observability**: 能否觀察輸出？
- **Debuggability**: 能否輕鬆除錯失敗？

**F. Technical Debt Identification（技術債識別）**
- 累積的捷徑
- 缺少的測試
- 過時的依賴
- 架構違規

**G. Active Refactoring（主動重構）**
- 在安全和適當的地方重構程式碼
- 執行測試確保變更不破壞功能
- 在 QA Results 章節記錄所有變更（WHY 和 HOW）
- **不可更改** Story 內容（除了 QA Results 章節）
- **不可更改** Story Status 或 File List；僅建議下一個狀態

**H. Standards Compliance Check（標準合規檢查）**
- 驗證遵循 `docs/coding-standards.md`
- 檢查符合 `docs/unified-project-structure.md`
- 驗證測試方法符合 `docs/testing-strategy.md`
- 確保遵循 Story 中提到的所有指南

#### 產出（兩個部分）

**Output 1: Story File - QA Results Section Update**

⚠️ **關鍵**: 僅授權更新 "QA Results" 章節

```markdown
## QA Results

### Review Date: [Date]

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment
[整體實作品質評估]

### Refactoring Performed
[列出執行的重構及解釋]

- **File**: [filename]
  - **Change**: [變更內容]
  - **Why**: [變更原因]
  - **How**: [如何改善程式碼]

### Compliance Check
- Coding Standards: [✓/✗] [註記]
- Project Structure: [✓/✗] [註記]
- Testing Strategy: [✓/✗] [註記]
- All ACs Met: [✓/✗] [註記]

### Improvements Checklist
[勾選自己處理的項目，未勾選的留給 dev 處理]

- [x] 重構 user service 改善錯誤處理 (services/user.service.ts)
- [x] 新增缺少的 edge case 測試 (services/user.service.test.ts)
- [ ] 考慮抽取驗證邏輯到獨立的 validator class
- [ ] 新增錯誤情境的整合測試
- [ ] 更新 API 文件的新錯誤碼

### Security Review
[發現的安全性考量及是否已處理]

### Performance Considerations
[發現的效能問題及是否已處理]

### Files Modified During Review
[如果修改了檔案，在此列出 - 請 Dev 更新 File List]

### Gate Status
Gate: {STATUS} → qa.qaLocation/gates/{epic}.{story}-{slug}.yml
Risk profile: qa.qaLocation/assessments/{epic}.{story}-risk-{YYYYMMDD}.md
NFR assessment: qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md

### Recommended Status
[✓ Ready for Done] / [✗ Changes Required - See unchecked items above]
(Story owner decides final status)
```

**Output 2: Quality Gate File**

位置: `qa.qaLocation/gates/{epic}.{story}-{slug}.yml`

```yaml
schema: 1
story: '{epic}.{story}'
story_title: '{story title}'
gate: PASS|CONCERNS|FAIL|WAIVED
status_reason: '1-2 句解釋閘門決策'
reviewer: 'Quinn (Test Architect)'
updated: '{ISO-8601 timestamp}'

top_issues: [] # 沒有問題時為空陣列
waiver: { active: false } # 僅在 WAIVED 時設為 active: true

# Extended fields (optional but recommended):
quality_score: 0-100 # 100 - (20*FAILs) - (10*CONCERNS)
expires: '{ISO-8601 timestamp}' # 通常是審查後 2 週

evidence:
  tests_reviewed: { count }
  risks_identified: { count }
  trace:
    ac_covered: [1, 2, 3] # 有測試覆蓋的 AC 編號
    ac_gaps: [4] # 缺少覆蓋的 AC 編號

nfr_validation:
  security:
    status: PASS|CONCERNS|FAIL
    notes: '具體發現'
  performance:
    status: PASS|CONCERNS|FAIL
    notes: '具體發現'
  reliability:
    status: PASS|CONCERNS|FAIL
    notes: '具體發現'
  maintainability:
    status: PASS|CONCERNS|FAIL
    notes: '具體發現'

recommendations:
  immediate: # 必須在 production 前修正
    - action: '新增 rate limiting'
      refs: ['api/auth/login.ts']
  future: # 可稍後處理
    - action: '考慮快取'
      refs: ['services/data.ts']
```

#### Gate 決策標準

**確定性規則**（按順序套用）：

如果 risk_summary 存在，先套用其門檻值（≥9 → FAIL，≥6 → CONCERNS），然後 NFR 狀態，最後 top_issues 嚴重性。

1. **風險門檻值**（如果有 risk_summary）：
   - 任何風險分數 ≥ 9 → Gate = FAIL（除非 waived）
   - 任何分數 ≥ 6 → Gate = CONCERNS

2. **測試覆蓋率缺口**（如果有 trace）：
   - 任何 P0 測試缺少（來自 test-design）→ Gate = CONCERNS
   - Security/data-loss P0 測試缺少 → Gate = FAIL

3. **問題嚴重性**：
   - 任何 `top_issues.severity == high` → Gate = FAIL（除非 waived）
   - 任何 `severity == medium` → Gate = CONCERNS

4. **NFR 狀態**：
   - 任何 NFR 狀態為 FAIL → Gate = FAIL
   - 任何 NFR 狀態為 CONCERNS → Gate = CONCERNS
   - 否則 → Gate = PASS

- **WAIVED**: 僅當 waiver.active: true 並有 reason/approver

**詳細標準**：
- **PASS**: 所有關鍵需求滿足，無阻擋問題
- **CONCERNS**: 發現非關鍵問題，團隊應審查
- **FAIL**: 應該處理的關鍵問題
- **WAIVED**: 問題已確認但明確豁免

**使用範例**:
```
/review 1.3
```

**適用情境**:
- Story 開發完成後
- 準備標記為 Done 前
- 需要全面品質評估時

---

### 2. `/gate` - 品質閘門決策

**用途**: 建立或更新獨立的品質閘門決策檔案

**參數**:
- `{story}` (必填) - Story ID

**前置條件**:
- Story 已經過審查（手動或透過 `/review`）
- 審查發現可用
- 了解 Story 需求和實作

**產出**: Quality Gate YAML File

位置: `qa.qaLocation/gates/{epic}.{story}-{slug}.yml`

#### Slug 規則
- 轉換為小寫
- 空格替換為連字號
- 移除標點符號
- 範例: "User Auth - Login!" → "user-auth-login"

#### 最小必要 Schema

```yaml
schema: 1
story: '{epic}.{story}'
gate: PASS|CONCERNS|FAIL|WAIVED
status_reason: '1-2 句解釋閘門決策'
reviewer: 'Quinn'
updated: '{ISO-8601 timestamp}'
top_issues: [] # 沒有問題時為空陣列
waiver: { active: false } # 僅在 WAIVED 時設為 active: true
```

#### 有問題的 Schema

```yaml
schema: 1
story: '1.3'
gate: CONCERNS
status_reason: 'Missing rate limiting on auth endpoints poses security risk.'
reviewer: 'Quinn'
updated: '2025-01-12T10:15:00Z'
top_issues:
  - id: 'SEC-001'
    severity: high # 僅限: low|medium|high
    finding: 'No rate limiting on login endpoint'
    suggested_action: 'Add rate limiting middleware before production'
  - id: 'TEST-001'
    severity: medium
    finding: 'No integration tests for auth flow'
    suggested_action: 'Add integration test coverage'
waiver: { active: false }
```

#### Waived 時的 Schema

```yaml
schema: 1
story: '1.3'
gate: WAIVED
status_reason: 'Known issues accepted for MVP release.'
reviewer: 'Quinn'
updated: '2025-01-12T10:15:00Z'
top_issues:
  - id: 'PERF-001'
    severity: low
    finding: 'Dashboard loads slowly with 1000+ items'
    suggested_action: 'Implement pagination in next sprint'
waiver:
  active: true
  reason: 'MVP release - performance optimization deferred'
  approved_by: 'Product Owner'
```

#### Severity Scale（固定值）
- `low`: 小問題，外觀問題
- `medium`: 應儘快修正，非阻擋
- `high`: 關鍵問題，應阻擋發布

#### Issue ID Prefixes
- `SEC-`: 安全問題
- `PERF-`: 效能問題
- `REL-`: 可靠性問題
- `TEST-`: 測試缺口
- `MNT-`: 可維護性考量
- `ARCH-`: 架構問題
- `DOC-`: 文件缺口
- `REQ-`: 需求問題

**使用範例**:
```
/gate 1.3
```

**適用情境**:
- 需要更新品質決策時
- 建立獨立的品質閘門檔案
- 追蹤品質狀態變化

---

### 3. `/test-design` - 測試策略設計

**用途**: 為 Story 實作建立全面的測試情境，並推薦適當的測試層級

**參數**:
- `{story}` (必填) - Story ID

**目的**: 設計完整的測試策略，識別要測試什麼、在哪個層級（unit/integration/e2e）測試、以及為什麼。確保高效的測試覆蓋率，避免冗餘，同時維持適當的測試邊界。

#### 測試層級框架

**快速規則**:
- **Unit**: 純邏輯、演算法、計算
- **Integration**: 元件互動、DB 操作
- **E2E**: 關鍵使用者旅程、合規性

#### 優先級分配

**快速優先級指派**:
- **P0**: 營收關鍵、安全性、合規性
- **P1**: 核心使用者旅程、頻繁使用
- **P2**: 次要功能、管理功能
- **P3**: Nice-to-have、很少使用

#### 測試情境設計

每個測試需求會建立：

```yaml
test_scenario:
  id: '{epic}.{story}-{LEVEL}-{SEQ}'
  requirement: 'AC reference'
  priority: P0|P1|P2|P3
  level: unit|integration|e2e
  description: 'What is being tested'
  justification: 'Why this level was chosen'
  mitigates_risks: ['RISK-001'] # 如果有風險 profile
```

#### 產出

**Output 1: Test Design Document**

位置: `qa.qaLocation/assessments/{epic}.{story}-test-design-{YYYYMMDD}.md`

```markdown
# Test Design: Story {epic}.{story}

Date: {date}
Designer: Quinn (Test Architect)

## Test Strategy Overview
- Total test scenarios: X
- Unit tests: Y (A%)
- Integration tests: Z (B%)
- E2E tests: W (C%)
- Priority distribution: P0: X, P1: Y, P2: Z

## Test Scenarios by Acceptance Criteria

### AC1: {description}

#### Scenarios

| ID           | Level       | Priority | Test                      | Justification            |
| ------------ | ----------- | -------- | ------------------------- | ------------------------ |
| 1.3-UNIT-001 | Unit        | P0       | Validate input format     | Pure validation logic    |
| 1.3-INT-001  | Integration | P0       | Service processes request | Multi-component flow     |
| 1.3-E2E-001  | E2E         | P1       | User completes journey    | Critical path validation |

## Risk Coverage
[對應測試情境到已識別的風險（如果有 risk profile）]

## Recommended Execution Order
1. P0 Unit tests (fail fast)
2. P0 Integration tests
3. P0 E2E tests
4. P1 tests in order
5. P2+ as time permits
```

**Output 2: Gate YAML Block**

```yaml
test_design:
  scenarios_total: X
  by_level:
    unit: Y
    integration: Z
    e2e: W
  by_priority:
    p0: A
    p1: B
    p2: C
  coverage_gaps: [] # 列出任何沒有測試的 ACs
```

**使用範例**:
```
/test-design 1.3
```

**適用情境**:
- 開發前規劃測試策略
- 確保測試覆蓋率充分
- 避免過度測試或測試不足

---

### 4. `/trace` - 需求追溯

**用途**: 使用 Given-When-Then 模式對應 Story 需求到測試案例，建立全面的追溯性

**參數**:
- `{story}` (必填) - Story ID

**重要**: Given-When-Then 在此用於**記錄**需求和測試的對應，**不是**用於撰寫實際測試程式碼。測試應遵循專案的測試標準（測試程式碼中不使用 BDD 語法）。

#### 追溯流程

**1. 提取需求**
從以下來源識別所有可測試的需求：
- Acceptance Criteria（主要來源）
- User Story 陳述
- 具有特定行為的 Tasks/Subtasks
- 提到的非功能需求
- 記錄的 Edge Cases

**2. 對應到測試案例**

```yaml
requirement: 'AC1: User can login with valid credentials'
test_mappings:
  - test_file: 'auth/login.test.ts'
    test_case: 'should successfully login with valid email and password'
    # Given-When-Then 描述測試驗證什麼，而非如何編碼
    given: 'A registered user with valid credentials'
    when: 'They submit the login form'
    then: 'They are redirected to dashboard and session is created'
    coverage: full
```

**3. 覆蓋率分析**

**覆蓋率層級**:
- `full`: 需求完全測試
- `partial`: 某些方面已測試，有缺口
- `none`: 沒有測試覆蓋
- `integration`: 僅在 integration/e2e 測試中覆蓋
- `unit`: 僅在 unit 測試中覆蓋

**4. 缺口識別**

```yaml
coverage_gaps:
  - requirement: 'AC3: Password reset email sent within 60 seconds'
    gap: 'No test for email delivery timing'
    severity: medium
    suggested_test:
      type: integration
      description: 'Test email service SLA compliance'
```

#### 產出

**Output 1: Gate YAML Block**

```yaml
trace:
  totals:
    requirements: X
    full: Y
    partial: Z
    none: W
  planning_ref: 'qa.qaLocation/assessments/{epic}.{story}-test-design-{YYYYMMDD}.md'
  uncovered:
    - ac: 'AC3'
      reason: 'No test found for password reset timing'
  notes: 'See qa.qaLocation/assessments/{epic}.{story}-trace-{YYYYMMDD}.md'
```

**Output 2: Traceability Report**

位置: `qa.qaLocation/assessments/{epic}.{story}-trace-{YYYYMMDD}.md`

```markdown
# Requirements Traceability Matrix

## Story: {epic}.{story} - {title}

### Coverage Summary
- Total Requirements: X
- Fully Covered: Y (Z%)
- Partially Covered: A (B%)
- Not Covered: C (D%)

### Requirement Mappings

#### AC1: {Acceptance Criterion 1}

**Coverage: FULL**

Given-When-Then Mappings:

- **Unit Test**: `auth.service.test.ts::validateCredentials`
  - Given: Valid user credentials
  - When: Validation method called
  - Then: Returns true with user object

- **Integration Test**: `auth.integration.test.ts::loginFlow`
  - Given: User with valid account
  - When: Login API called
  - Then: JWT token returned and session created

### Critical Gaps
1. **Performance Requirements**
   - Gap: No load testing for concurrent users
   - Risk: High - Could fail under production load
   - Action: Implement load tests using k6 or similar
```

**使用範例**:
```
/trace 1.3
```

**適用情境**:
- 驗證所有 AC 都有測試覆蓋
- 識別測試缺口
- 確保需求追溯性

---

### 5. `/risk-profile` - 風險評估

**用途**: 使用機率 × 影響分析為 Story 實作產生全面的風險評估矩陣

**參數**:
- `{story}` (必填) - Story ID

#### 風險類別

**類別前綴**:
- `TECH`: 技術風險
- `SEC`: 安全風險
- `PERF`: 效能風險
- `DATA`: 資料風險
- `BUS`: 業務風險
- `OPS`: 營運風險

**1. Technical Risks (TECH)**
- 架構複雜性
- 整合挑戰
- 技術債
- 擴展性考量
- 系統依賴

**2. Security Risks (SEC)**
- 認證/授權缺陷
- 資料暴露漏洞
- 注入攻擊
- Session 管理問題
- 加密弱點

**3. Performance Risks (PERF)**
- 回應時間降級
- 吞吐量瓶頸
- 資源耗盡
- 資料庫查詢優化
- 快取失敗

**4. Data Risks (DATA)**
- 資料遺失可能性
- 資料損壞
- 隱私侵犯
- 合規問題
- 備份/恢復缺口

**5. Business Risks (BUS)**
- 功能不符合使用者需求
- 營收影響
- 聲譽損害
- 法規不合規
- 市場時機

**6. Operational Risks (OPS)**
- 部署失敗
- 監控缺口
- 事件回應準備
- 文件不足
- 知識轉移問題

#### 風險評估

**機率層級**:
- `High (3)`: 可能發生（>70% 機會）
- `Medium (2)`: 可能發生（30-70% 機會）
- `Low (1)`: 不太可能發生（<30% 機會）

**影響層級**:
- `High (3)`: 嚴重後果（資料洩漏、系統當機、重大財務損失）
- `Medium (2)`: 中等後果（效能降級、小資料問題）
- `Low (1)`: 輕微後果（外觀問題、輕微不便）

**風險分數 = 機率 × 影響**:
- 9: 關鍵風險（紅色）
- 6: 高風險（橘色）
- 4: 中風險（黃色）
- 2-3: 低風險（綠色）
- 1: 最小風險（藍色）

#### 風險矩陣範例

```markdown
## Risk Matrix

| Risk ID  | Description             | Probability | Impact     | Score | Priority |
| -------- | ----------------------- | ----------- | ---------- | ----- | -------- |
| SEC-001  | XSS vulnerability       | High (3)    | High (3)   | 9     | Critical |
| PERF-001 | Slow query on dashboard | Medium (2)  | Medium (2) | 4     | Medium   |
| DATA-001 | Backup failure          | Low (1)     | High (3)   | 3     | Low      |
```

#### 風險緩解策略

```yaml
mitigation:
  risk_id: 'SEC-001'
  strategy: 'preventive' # preventive|detective|corrective
  actions:
    - 'Implement input validation library (e.g., validator.js)'
    - 'Add CSP headers to prevent XSS execution'
    - 'Sanitize all user inputs before storage'
    - 'Escape all outputs in templates'
  testing_requirements:
    - 'Security testing with OWASP ZAP'
    - 'Manual penetration testing of forms'
    - 'Unit tests for validation functions'
  residual_risk: 'Low - Some zero-day vulnerabilities may remain'
  owner: 'dev'
```

#### 產出

位置: `qa.qaLocation/assessments/{epic}.{story}-risk-{YYYYMMDD}.md`

**使用範例**:
```
/risk-profile 1.3
```

**適用情境**:
- 識別實作風險
- 優先化測試重點
- 規劃風險緩解策略

---

### 6. `/nfr-assess` - 非功能需求驗證

**用途**: 驗證非功能需求（效能、安全、可靠性、可維護性）

**參數**:
- `{story}` (必填) - Story ID

**驗證範圍**:

**1. Security（安全性）**
- 認證和授權機制
- 資料加密（傳輸中和靜態）
- 輸入驗證
- CSRF/XSS 防護
- 安全性標頭

**2. Performance（效能）**
- 回應時間
- 資源使用
- 資料庫查詢效能
- 快取策略
- 載入時間

**3. Reliability（可靠性）**
- 錯誤處理
- 重試機制
- Circuit breakers
- Graceful degradation
- 恢復能力

**4. Maintainability（可維護性）**
- 程式碼清晰度
- 文件完整性
- 測試覆蓋率
- 程式碼組織
- 依賴管理

#### 產出

位置: `qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`

包含每個 NFR 類別的：
- Status: PASS/CONCERNS/FAIL
- Notes: 具體發現
- Recommendations: 改善建議

**使用範例**:
```
/nfr-assess 1.3
```

**適用情境**:
- 驗證非功能需求
- 效能測試後
- 安全性審查

---

### 7. `/help` - 顯示幫助

**用途**: 顯示 QA Bot 所有可用命令

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

## 工作流程建議

### 情境 A: 完整的 Story 品質審查流程

```
1. [開發完成] Dev 完成 Story 實作

2. QA Bot: /review {story}
   → 全面品質審查
   → 自動執行：
     - Requirements Traceability
     - Code Quality Review
     - Test Architecture Assessment
     - NFR Validation
     - Risk Assessment
   → 產出：
     - Story 的 QA Results 更新
     - Quality Gate File

3. [查看結果]
   - Gate Status: PASS/CONCERNS/FAIL/WAIVED
   - 檢視 top_issues
   - 查看 recommendations

4a. 如果 PASS → Story 標記為 Done

4b. 如果 CONCERNS → 團隊決定是否繼續或修正

4c. 如果 FAIL → Dev 修正問題後重新審查
```

### 情境 B: 開發前的測試規劃

```
1. [Story 建立] PO Bot 建立 Story

2. QA Bot: /test-design {story}
   → 設計測試策略
   → 識別測試情境
   → 分配測試層級（unit/integration/e2e）
   → 設定優先級（P0/P1/P2/P3）

3. QA Bot: /risk-profile {story}
   → 識別潛在風險
   → 評估風險分數
   → 規劃緩解策略

4. [開發開始]
   → Dev 根據 Test Design 撰寫測試
   → 優先處理高風險區域

5. [開發完成後]
   → QA Bot: /review {story}
```

### 情境 C: 需求追溯驗證

```
1. [開發完成] Dev 完成實作和測試

2. QA Bot: /trace {story}
   → 對應每個 AC 到測試
   → 使用 Given-When-Then 記錄
   → 識別覆蓋率缺口

3. [查看 Traceability Matrix]
   → 檢查哪些 AC 有完整覆蓋
   → 識別哪些 AC 缺少測試
   → 查看建議的測試類型

4. [補充測試]
   → Dev 根據缺口補充測試

5. QA Bot: /review {story}
   → 最終審查
```

### 情境 D: 品質閘門更新

```
1. [初次審查] QA Bot: /review {story}
   → Gate: CONCERNS

2. [Dev 修正問題]

3. QA Bot: /gate {story}
   → 更新品質閘門決策
   → 可能從 CONCERNS → PASS

4. [追蹤品質狀態變化]
   → 查看 Gate File 的 updated timestamp
   → 比較不同時間的決策
```

### 情境 E: 風險導向的測試策略

```
1. QA Bot: /risk-profile {story}
   → 識別所有潛在風險
   → 計算風險分數

2. QA Bot: /test-design {story}
   → 根據風險設計測試
   → 高風險區域 → P0 測試
   → 確保測試涵蓋風險緩解

3. [開發和測試]
   → 優先實作高風險緩解
   → 優先撰寫 P0 測試

4. QA Bot: /trace {story}
   → 驗證風險都有對應測試

5. QA Bot: /review {story}
   → 確認風險已緩解
```

---

## 指令優先級建議

### ⭐ 必學指令（核心功能）

#### 1. `/review` - 最重要
**原因**: 全面品質審查，整合所有 QA 功能

**建議**:
- Story 完成後一定要執行
- 理解 Gate 決策標準
- 注意 top_issues 和 recommendations
- 檢查 QA Results 的改善清單

#### 2. `/gate` - 品質決策
**原因**: 明確的品質閘門決策

**建議**:
- 了解 PASS/CONCERNS/FAIL/WAIVED 的差異
- 學習何時使用 WAIVED
- 追蹤品質狀態變化

#### 3. `/test-design` - 測試規劃
**原因**: 開發前的測試策略至關重要

**建議**:
- 在開發前執行
- 理解測試層級選擇
- 注意優先級分配

---

### 🔧 進階指令（提升品質）

#### 4. `/trace` - 需求追溯
**原因**: 確保測試覆蓋率完整

**建議**:
- 開發完成後執行
- 注意覆蓋率缺口
- 使用 Given-When-Then 記錄

#### 5. `/risk-profile` - 風險評估
**原因**: 識別和優先化風險

**建議**:
- 複雜 Story 必須執行
- 注意高風險項目
- 規劃緩解策略

---

### 🛠️ 輔助指令（特定情境）

#### 6. `/nfr-assess` - NFR 驗證
**原因**: 特定於非功能需求驗證

**建議**:
- 效能關鍵的 Story 執行
- 安全性相關 Story 執行

#### 7. `/help`, `/clear` - 工具指令
**原因**: 按需使用的輔助工具

---

## 最佳實踐建議

### 1. 執行 `/review` 最佳實踐

✅ **DO（建議做）**:
- Story 完成後一定要執行
- 仔細閱讀 QA Results
- 優先修正 high severity 的 top_issues
- 檢查是否有安全性或效能問題
- 確認所有 AC 都被測試覆蓋
- 注意 Technical Debt 識別
- 如果 Gate 是 FAIL，修正後重新審查

❌ **DON'T（避免）**:
- 不要跳過品質審查
- 不要忽略 CONCERNS 狀態
- 不要在 FAIL 狀態下標記為 Done
- 不要忽略改善建議
- 不要省略測試
- 不要隨意使用 WAIVED

### 2. 測試設計最佳實踐

✅ **DO（建議做）**:
- 在開發前執行 `/test-design`
- 遵循測試層級建議（unit/integration/e2e）
- 優先撰寫 P0 測試
- 確保關鍵路徑有多層級測試
- 使用 Given-When-Then 記錄測試意圖
- 考慮 edge cases
- 設計可維護的測試

❌ **DON'T（避免）**:
- 不要過度測試（避免冗餘）
- 不要測試層級錯誤（如 unit 測試整合）
- 不要忽略 P0 測試
- 不要省略 edge cases
- 不要撰寫脆弱的測試
- 不要忽略測試效能

### 3. 需求追溯最佳實踐

✅ **DO（建議做）**:
- 確保每個 AC 都有測試
- 使用 Given-When-Then 清楚記錄
- 識別並補充覆蓋率缺口
- 優先覆蓋關鍵業務流程
- 記錄測試與需求的對應
- 追蹤部分覆蓋的需求

❌ **DON'T（避免）**:
- 不要遺漏任何 AC
- 不要只依賴 integration/e2e 測試
- 不要忽略 NFR 測試
- 不要寫模糊的 Given-When-Then
- 不要測試與需求無關的內容

### 4. 風險管理最佳實踐

✅ **DO（建議做）**:
- 複雜 Story 一定要執行 `/risk-profile`
- 識別所有風險類別
- 計算風險分數（機率 × 影響）
- 優先緩解高風險項目
- 規劃測試涵蓋風險
- 記錄緩解策略
- 追蹤殘餘風險

❌ **DON'T（避免）**:
- 不要忽略安全風險
- 不要低估資料風險
- 不要省略風險緩解計畫
- 不要忘記測試風險緩解
- 不要假設風險已解決

### 5. 品質閘門最佳實踐

✅ **DO（建議做）**:
- 明確理解每個 Gate 狀態的意義
- FAIL 時必須修正問題
- CONCERNS 時與團隊討論
- WAIVED 需要明確理由和核准者
- 追蹤 Gate 狀態變化
- 記錄品質趨勢
- 使用 Gate 作為學習機會

❌ **DON'T（避免）**:
- 不要忽略 Gate 決策
- 不要隨意 Waive 問題
- 不要在沒有理由的情況下 Override
- 不要省略 status_reason
- 不要使用錯誤的 severity（必須是 low/medium/high）

---

## 常見問題 (FAQ)

### Q1: `/review` 和 `/gate` 有什麼差異？
**A**: 範圍和深度不同

**`/review`**:
- 全面品質審查
- 自動執行多項分析
- 產出 QA Results + Gate File
- 可能執行程式碼重構
- 建議使用時機：Story 開發完成後

**`/gate`**:
- 僅建立/更新品質閘門
- 基於已有的審查發現
- 產出 Gate File
- 不執行程式碼變更
- 建議使用時機：更新品質決策

**通常先用 `/review`，需要更新決策時用 `/gate`**

### Q2: 什麼時候應該使用 WAIVED？
**A**: 僅在特定情況下

**適當使用 WAIVED**:
- MVP 發布，已知問題延後處理
- 效能優化延後到下個 sprint
- 有明確的產品決策支持
- 有核准者（如 PO）
- 有明確的處理計畫

**不適當使用 WAIVED**:
- 安全性問題（幾乎不應 Waive）
- 資料遺失風險
- 關鍵功能缺陷
- 沒有核准和理由
- 只是為了跳過品質檢查

### Q3: Given-When-Then 要寫在測試程式碼中嗎？
**A**: ❌ 不用

**Given-When-Then 用途**:
- 僅用於**記錄**測試對應到需求
- 在 Traceability Matrix 中使用
- 幫助理解測試驗證什麼

**測試程式碼**:
- 遵循專案的測試標準
- 通常使用 describe/it 或 test blocks
- 不使用 BDD 語法（除非專案特別選擇 BDD）

**範例**:
```typescript
// ❌ 不要在測試中這樣寫
Given('valid user credentials', ...)
When('they submit login', ...)
Then('redirected to dashboard', ...)

// ✅ 應該這樣寫
describe('User Login', () => {
  it('should redirect to dashboard with valid credentials', () => {
    // test code
  })
})
```

### Q4: 測試層級如何選擇？
**A**: 遵循測試金字塔原則

**Unit Tests（最多）**:
- 純邏輯、演算法
- 驗證函數
- 資料轉換
- 執行快速
- 易於維護

**Integration Tests（中等）**:
- 元件互動
- 資料庫操作
- API 呼叫
- 服務整合

**E2E Tests（最少）**:
- 關鍵使用者旅程
- 跨系統流程
- 合規性驗證
- 執行較慢

**選擇原則**: Shift Left - 儘可能在較低層級測試

### Q5: P0/P1/P2/P3 如何分配？
**A**: 基於業務影響和使用頻率

**P0（必須執行）**:
- 營收關鍵功能
- 安全性測試
- 資料完整性
- 法規合規

**P1（應該執行）**:
- 核心使用者旅程
- 頻繁使用的功能
- 重要的整合

**P2（可以執行）**:
- 次要功能
- 管理功能
- Edge cases

**P3（時間允許才執行）**:
- Nice-to-have 功能
- 很少使用的路徑

### Q6: 風險分數如何影響 Gate 決策？
**A**: 高風險會影響 Gate 狀態

**風險門檻值**:
- 分數 ≥ 9（Critical）→ Gate = FAIL
- 分數 ≥ 6（High）→ Gate = CONCERNS
- 分數 < 6 → 不直接影響 Gate

**風險緩解**:
- 確保高風險有緩解計畫
- 驗證緩解策略有測試覆蓋
- 追蹤殘餘風險

### Q7: QA Bot 會修改程式碼嗎？
**A**: 會，但有限制

**可以修改**:
- Story 的 "QA Results" 章節
- 程式碼重構（在 `/review` 時）
- 測試程式碼改善

**不可修改**:
- Story 的其他章節（Status, AC, Tasks 等）
- Story 狀態
- File List（只能建議 Dev 更新）

**重構原則**:
- 僅在安全和適當時重構
- 執行測試確保不破壞功能
- 在 QA Results 記錄所有變更（WHY 和 HOW）

### Q8: 如何處理測試覆蓋率缺口？
**A**: 使用 `/trace` 識別後補充

**流程**:
1. `/trace {story}` - 識別缺口
2. 查看 Traceability Matrix
3. 注意 `coverage: none` 或 `partial` 的需求
4. 根據建議補充測試
5. 重新執行 `/trace` 驗證
6. 最後執行 `/review`

**優先順序**:
- 先補充 P0 測試缺口
- 關注關鍵業務流程
- 注意安全性和資料完整性

### Q9: NFR Assessment 何時執行？
**A**: 視 Story 性質而定

**必須執行**:
- 效能關鍵的功能
- 安全性相關功能
- 大量資料處理
- API 設計
- 基礎設施變更

**可選執行**:
- 簡單的 CRUD 操作
- UI 外觀變更
- 文件更新

**通常 `/review` 會自動包含 NFR 驗證**

### Q10: Quality Score 如何計算？
**A**: 基於問題數量

**計算公式**:
```
quality_score = 100 - (20 × FAIL 數量) - (10 × CONCERNS 數量)
範圍: 0-100
```

**範例**:
- 0 個問題 → 100 分
- 1 個 CONCERNS → 90 分
- 1 個 FAIL → 80 分
- 2 個 FAIL + 1 個 CONCERNS → 50 分

**自訂權重**:
如果 `technical-preferences.md` 定義自訂權重，使用那些權重。

---

## 與其他 Bot 的協作

### 與 PO Bot 協作

| PO Bot | QA Bot | 協作點 |
|--------|--------|-------|
| `/create-story` | `/test-design` | PO 建立 Story 後，QA 設計測試策略 |
| `/validate-story` | `/review` | 兩者互補驗證 Story 品質 |
| Story 完成 | `/review` | QA 審查實作品質 |

**典型流程**:
```
1. PO: /create-story
2. QA: /test-design（規劃測試）
3. QA: /risk-profile（識別風險）
4. Dev: 開發 + 測試
5. QA: /review（品質審查）
6. 根據 Gate 決定是否 Done
```

### 與 Architect Bot 協作

| Architect Bot | QA Bot | 協作點 |
|--------------|--------|-------|
| `/execute-checklist` | `/review` | 架構驗證 + 實作驗證 |
| Architecture Docs | `/test-design` | 基於架構設計測試 |

**典型流程**:
```
1. Architect: /create-backend-architecture
2. Architect: /execute-checklist（架構驗證）
3. PO: /create-story
4. QA: /test-design（基於架構）
5. Dev: 開發
6. QA: /review
```

### 完整的多 Bot 協作流程

```
專案完整流程:

1. Architect: /create-full-stack-architecture
   → 定義技術架構

2. Architect: /execute-checklist
   → 驗證架構品質

3. UX: /create-front-end-spec
   → 定義 UI/UX

4. PO: /create-story
   → 建立開發 Story

5. QA: /test-design
   → 規劃測試策略

6. QA: /risk-profile
   → 評估風險

7. Dev: 開發 + 測試
   → 根據 Test Design 實作

8. QA: /trace
   → 驗證測試覆蓋

9. QA: /review
   → 品質審查 + Gate 決策

10. 根據 Gate 狀態決定:
    - PASS → Done
    - CONCERNS → 團隊決策
    - FAIL → 修正後重新審查
```

---

## 相關資源

- **PO Bot 指令指南**: `/PO-BOT-COMMANDS-GUIDE.md`
- **UX Bot 指令指南**: `/UX-BOT-COMMANDS-GUIDE.md`
- **Architect Bot 指令指南**: `/ARCHITECT-BOT-COMMANDS-GUIDE.md`
- **專案 README**: `/README.md`
- **BMAD 方法論**: `/.bmad-core/`
- **QA Agent 定義**: `/.bmad-core/agents/qa.md`

---

**最後更新**: 2025-01-08
**維護者**: VibeHub Team
