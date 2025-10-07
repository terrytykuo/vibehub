const fs = require('fs');
const path = require('path');

/**
 * BMAD Core 依賴檔案載入系統
 * 用於載入 .bmad-core 下的 agents, tasks, templates, checklists
 */

const BMAD_CORE_PATH = path.join(__dirname, '..', '.bmad-core');

/**
 * 讀取單一檔案內容
 * @param {string} filePath - 檔案路徑
 * @returns {string} 檔案內容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[BMAD Loader] Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 載入 agent 定義檔案
 * @param {string} agentName - agent 名稱 (po, dev 等)
 * @returns {string} agent 定義內容
 */
function loadAgent(agentName) {
  const agentPath = path.join(BMAD_CORE_PATH, 'agents', `${agentName}.md`);
  return readFile(agentPath);
}

/**
 * 載入 task 檔案
 * @param {string} taskName - task 檔案名稱 (不含 .md)
 * @returns {string} task 內容
 */
function loadTask(taskName) {
  const taskPath = path.join(BMAD_CORE_PATH, 'tasks', `${taskName}.md`);
  return readFile(taskPath);
}

/**
 * 載入 template 檔案
 * @param {string} templateName - template 檔案名稱
 * @returns {string} template 內容
 */
function loadTemplate(templateName) {
  const templatePath = path.join(BMAD_CORE_PATH, 'templates', templateName);
  return readFile(templatePath);
}

/**
 * 載入 checklist 檔案
 * @param {string} checklistName - checklist 檔案名稱 (不含 .md)
 * @returns {string} checklist 內容
 */
function loadChecklist(checklistName) {
  const checklistPath = path.join(BMAD_CORE_PATH, 'checklists', `${checklistName}.md`);
  return readFile(checklistPath);
}

/**
 * 載入 core-config.yaml
 * @returns {string} core config 內容
 */
function loadCoreConfig() {
  const configPath = path.join(BMAD_CORE_PATH, 'core-config.yaml');
  return readFile(configPath);
}

/**
 * 解析 agent 定義並提取 persona 和 commands
 * @param {string} agentContent - agent 檔案內容
 * @returns {object} { persona, commands, dependencies }
 */
function parseAgent(agentContent) {
  if (!agentContent) return null;

  // 提取 YAML block
  const yamlMatch = agentContent.match(/```yaml\n([\s\S]*?)\n```/);
  if (!yamlMatch) {
    console.error('[BMAD Loader] No YAML block found in agent definition');
    return null;
  }

  // 這裡簡化處理，實際上可以用 yaml parser
  // 但為了快速實作，我們直接返回完整內容讓 LLM 解析
  return {
    fullContent: agentContent,
    yamlBlock: yamlMatch[1]
  };
}

/**
 * 根據 agent 的 dependencies 批次載入所有依賴檔案
 * @param {string} agentName - agent 名稱
 * @returns {object} { agent, tasks: {}, templates: {}, checklists: {} }
 */
function loadAgentWithDependencies(agentName) {
  const agentContent = loadAgent(agentName);
  if (!agentContent) {
    return null;
  }

  const parsed = parseAgent(agentContent);
  if (!parsed) {
    return null;
  }

  // 從 YAML 中提取 dependencies (簡化版本，手動定義)
  const dependencies = {
    po: {
      checklists: ['change-checklist', 'po-master-checklist'],
      tasks: ['correct-course', 'execute-checklist', 'shard-doc', 'validate-next-story'],
      templates: ['story-tmpl.yaml']
    },
    dev: {
      checklists: ['story-dod-checklist'],
      tasks: ['apply-qa-fixes', 'execute-checklist', 'validate-next-story'],
      templates: []
    }
  };

  const agentDeps = dependencies[agentName] || { checklists: [], tasks: [], templates: [] };

  // 載入所有依賴
  const loadedDeps = {
    agent: parsed,
    coreConfig: loadCoreConfig(),
    tasks: {},
    templates: {},
    checklists: {}
  };

  // 載入 tasks
  agentDeps.tasks.forEach(taskName => {
    const content = loadTask(taskName);
    if (content) {
      loadedDeps.tasks[taskName] = content;
    }
  });

  // 載入 templates
  agentDeps.templates.forEach(templateName => {
    const content = loadTemplate(templateName);
    if (content) {
      loadedDeps.templates[templateName] = content;
    }
  });

  // 載入 checklists
  agentDeps.checklists.forEach(checklistName => {
    const content = loadChecklist(checklistName);
    if (content) {
      loadedDeps.checklists[checklistName] = content;
    }
  });

  return loadedDeps;
}

module.exports = {
  loadAgent,
  loadTask,
  loadTemplate,
  loadChecklist,
  loadCoreConfig,
  parseAgent,
  loadAgentWithDependencies
};
