require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
const https = require('https');
const { URL } = require('url');
const { loadAgentWithDependencies } = require('./bmad-loader');

// 載入 PO agent 及其依賴
const poAgent = loadAgentWithDependencies('po');

// 儲存對話歷史
const conversationHistory = new Map();

/**
 * 以 https.request 封裝 GitHub API POST 呼叫
 */
function postJson(url, token, payload) {
  return new Promise((resolve, reject) => {
    const endpoint = new URL(url);
    const options = {
      hostname: endpoint.hostname,
      path: `${endpoint.pathname}${endpoint.search}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'vibehub-po-bot'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          const message = data || res.statusMessage || `HTTP ${res.statusCode}`;
          reject(new Error(`GitHub API error ${res.statusCode}: ${message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'story';
}

function extractStorySummary(content) {
  const storyLine = content.match(/Story:\s*(.+)/i);
  if (storyLine && storyLine[1]) {
    return storyLine[1].replace(/\*\*/g, '').trim();
  }

  const headingMatch = content.match(/^#+\s*(.+)$/m);
  if (headingMatch && headingMatch[1]) {
    return headingMatch[1].trim();
  }

  const firstLine = content.split('\n').find(line => line.trim().length > 0);
  return firstLine ? firstLine.trim() : 'New story';
}

function buildStoryFilename(summary) {
  const datePrefix = new Date().toISOString().split('T')[0];
  const slug = slugify(summary).slice(0, 50);
  return `stories/${datePrefix}-${slug}.md`;
}

async function triggerStoryWorkflow({ filename, content, summary }) {
  const token = process.env.PO_BOT_GH_PAT;
  if (!token) {
    throw new Error('缺少環境變數 PO_BOT_GH_PAT');
  }

  const owner = process.env.PO_BOT_GH_OWNER || 'terrytykuo';
  const repo = process.env.PO_BOT_GH_REPO || 'vibehub';
  const workflow = process.env.PO_BOT_GH_WORKFLOW || 'story-pr.yml';

  const safeSummary = summary.length > 100 ? `${summary.slice(0, 97)}...` : summary;

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;
  const payload = {
    ref: 'main',
    inputs: {
      story_filename: filename,
      story_content_base64: Buffer.from(content, 'utf8').toString('base64'),
      story_summary: safeSummary
    }
  };

  await postJson(url, token, payload);
  return safeSummary;
}

// 定義 slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('顯示 PO (Sarah) 所有可用命令'),

  new SlashCommandBuilder()
    .setName('create-epic')
    .setDescription('建立 Epic（適用於 brownfield 專案）')
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Epic 描述')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('create-story')
    .setDescription('根據需求建立 User Story')
    .addStringOption(option =>
      option
        .setName('requirements')
        .setDescription('Story 需求描述')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('create-pr')
    .setDescription('根據提供的 Story 內容建立 Pull Request')
    .addStringOption(option =>
      option
        .setName('story')
        .setDescription('Story 完整內容（Markdown）')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('validate-story')
    .setDescription('驗證 Story 的完整性')
    .addStringOption(option =>
      option
        .setName('story')
        .setDescription('Story 內容（可在 thread 中貼上完整內容）')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('correct-course')
    .setDescription('執行 correct-course 任務'),

  new SlashCommandBuilder()
    .setName('shard-doc')
    .setDescription('分割文件')
    .addStringOption(option =>
      option
        .setName('document')
        .setDescription('要分割的文件內容')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('execute-checklist')
    .setDescription('執行 PO master checklist'),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('清除此 channel 的對話歷史'),
];

/**
 * 建構 PO persona system message
 */
function buildSystemMessage(commandName, dependencies = {}) {
  let systemMessage = `You are Sarah, the Product Owner (PO) from BMAD methodology.

${poAgent.agent.fullContent}

`;

  // 加入 core config
  if (poAgent.coreConfig) {
    systemMessage += `\n## Project Configuration\n${poAgent.coreConfig}\n`;
  }

  // 根據命令加入相關依賴
  if (dependencies.tasks) {
    dependencies.tasks.forEach(taskName => {
      if (poAgent.tasks[taskName]) {
        systemMessage += `\n## Task: ${taskName}\n${poAgent.tasks[taskName]}\n`;
      }
    });
  }

  if (dependencies.templates) {
    dependencies.templates.forEach(templateName => {
      if (poAgent.templates[templateName]) {
        systemMessage += `\n## Template: ${templateName}\n${poAgent.templates[templateName]}\n`;
      }
    });
  }

  if (dependencies.checklists) {
    dependencies.checklists.forEach(checklistName => {
      if (poAgent.checklists[checklistName]) {
        systemMessage += `\n## Checklist: ${checklistName}\n${poAgent.checklists[checklistName]}\n`;
      }
    });
  }

  systemMessage += `\nYou are operating in Discord. Provide clear, structured responses. For long outputs, they will be automatically posted in a thread.`;

  return systemMessage;
}

/**
 * 處理長回應，自動建立 thread
 */
async function handleLongResponse(interaction, response, questionPreview) {
  if (response.length > 2000) {
    // 發送前 2000 字元
    await interaction.editReply(response.substring(0, 2000));

    // 建立 thread
    const thread = await interaction.channel.threads.create({
      name: `📝 PO: ${questionPreview.substring(0, 50)}...`,
      autoArchiveDuration: 60,
    });

    // 發送剩餘內容
    let remaining = response.substring(2000);
    while (remaining.length > 0) {
      await thread.send(remaining.substring(0, 2000));
      remaining = remaining.substring(2000);
    }

    return thread;
  } else {
    await interaction.editReply(response);
    return null;
  }
}

/**
 * 呼叫 OpenAI API
 */
async function callOpenAI(systemMessage, userMessage, history = []) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages = [
    { role: 'system', content: systemMessage },
    ...history,
    { role: 'user', content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    max_tokens: 4000,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function start() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // 註冊 slash commands
  async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_PO);

    try {
      console.log('[PO Bot] Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      console.log('[PO Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[PO Bot] Error registering commands:', error);
    }
  }

  // Bot 準備好時
  client.once('ready', async () => {
    console.log(`✅ [PO Bot] Logged in as ${client.user.tag} - Sarah (Product Owner)`);
    await registerCommands();
  });

  // 處理 slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channelId } = interaction;

    try {
      await interaction.deferReply();

      // 準備對話歷史
      if (!conversationHistory.has(channelId)) {
        conversationHistory.set(channelId, []);
      }
      const history = conversationHistory.get(channelId);

      let systemMessage, userMessage, dependencies;
      let requirements, epicDesc, story, document;

      switch (commandName) {
        case 'help':
          systemMessage = buildSystemMessage('help');
          userMessage = 'Please show me all available commands with descriptions. Format as a numbered list.';
          break;

        case 'create-epic':
          epicDesc = interaction.options.getString('description');
          dependencies = {
            tasks: ['brownfield-create-epic'],
            templates: []
          };
          systemMessage = buildSystemMessage('create-epic', dependencies);
          userMessage = `Execute the brownfield-create-epic task to create a complete epic based on this description:

${epicDesc}

IMPORTANT: Follow the task instructions exactly. Create a structured epic document with all required sections as defined in the task. The epic should include goals, scope, user stories breakdown, technical considerations, and success criteria.`;
          break;

        case 'create-story':
          requirements = interaction.options.getString('requirements');
          dependencies = {
            tasks: ['create-brownfield-story'],
            templates: ['story-tmpl.yaml']
          };
          systemMessage = buildSystemMessage('create-story', dependencies);
          userMessage = `Execute the create-brownfield-story task to create a complete, structured user story based on these requirements:

${requirements}

IMPORTANT: Follow the task instructions completely. Create a full markdown story document that includes:
- Status (Draft)
- Story (As a... I want... so that...)
- Acceptance Criteria (numbered list)
- Tasks/Subtasks (checkbox list with subtasks)
- Dev Notes (with technical guidance)
- Testing section
- Change Log
- Dev Agent Record sections

The story should be implementation-ready for the Dev agent. Format it as a complete markdown document, not just a brief summary.`;
          break;

        case 'create-pr':
          story = interaction.options.getString('story');
          if (!story) {
            await interaction.editReply('❌ 請提供完整的 Story 內容。');
            return;
          }

          try {
            const summary = extractStorySummary(story);
            const filename = buildStoryFilename(summary);
            const safeSummary = await triggerStoryWorkflow({
              filename,
              content: story,
              summary
            });

            await interaction.editReply(
              `🚀 已觸發 GitHub Action 建立 Pull Request。\n• 檔案：\`${filename}\`\n• PR 標題：Add story: ${safeSummary}\n請稍候於 GitHub Actions 查詢執行情況。`
            );
          } catch (workflowError) {
            console.error('[PO Bot] Error triggering story workflow:', workflowError);
            await interaction.editReply(`⚠️ 觸發 GitHub Action 失敗：${workflowError.message}`);
          }
          return;

        case 'validate-story':
          story = interaction.options.getString('story');
          if (!story) {
            await interaction.editReply('請在 thread 中提供完整的 story 內容，或使用 story 參數。');
            return;
          }
          dependencies = {
            tasks: ['validate-next-story']
          };
          systemMessage = buildSystemMessage('validate-story', dependencies);
          userMessage = `Execute the validate-next-story task to thoroughly validate this story:

${story}

Follow the task instructions to check for completeness, clarity, and implementation-readiness. Provide detailed feedback on any issues found.`;
          break;

        case 'correct-course':
          dependencies = {
            tasks: ['correct-course']
          };
          systemMessage = buildSystemMessage('correct-course', dependencies);
          userMessage = 'Execute the correct-course task';
          break;

        case 'shard-doc':
          document = interaction.options.getString('document');
          if (!document) {
            await interaction.editReply('請在 thread 中提供完整的文件內容，或使用 document 參數。');
            return;
          }
          dependencies = {
            tasks: ['shard-doc']
          };
          systemMessage = buildSystemMessage('shard-doc', dependencies);
          userMessage = `Shard this document:\n${document}`;
          break;

        case 'execute-checklist':
          dependencies = {
            tasks: ['execute-checklist'],
            checklists: ['po-master-checklist']
          };
          systemMessage = buildSystemMessage('execute-checklist', dependencies);
          userMessage = 'Execute the PO master checklist';
          break;

        case 'clear':
          conversationHistory.delete(channelId);
          await interaction.editReply('✅ 已清除此 channel 的對話歷史。');
          return;

        default:
          await interaction.editReply('❌ Unknown command');
          return;
      }

      // 呼叫 OpenAI
      const response = await callOpenAI(systemMessage, userMessage, history);

      // 更新歷史
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: response });

      // 顯示使用者的請求（讓其他人也能看到）
      let displayMessage = '';
      if (commandName === 'create-story') {
        displayMessage = `📝 **Creating Story**\nRequirements: ${requirements}\n\n---\n\n${response}`;
      } else if (commandName === 'create-epic') {
        displayMessage = `📋 **Creating Epic**\nDescription: ${epicDesc}\n\n---\n\n${response}`;
      } else if (commandName === 'validate-story') {
        displayMessage = `✅ **Validating Story**\n\n---\n\n${response}`;
      } else {
        displayMessage = response;
      }

      // 處理長回應
      await handleLongResponse(interaction, displayMessage, commandName);

    } catch (error) {
      console.error('[PO Bot] Error:', error);
      await interaction.editReply('❌ 處理請求時發生錯誤。');
    }
  });

  // 在 thread 中的對話
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.channel.isThread()) return;

    const starterMessage = await message.channel.fetchStarterMessage();
    if (!starterMessage || starterMessage.author.id !== client.user.id) return;

    try {
      await message.channel.sendTyping();

      const threadId = message.channel.id;

      if (!conversationHistory.has(threadId)) {
        conversationHistory.set(threadId, []);
      }

      const history = conversationHistory.get(threadId);
      const systemMessage = buildSystemMessage('thread');

      const response = await callOpenAI(systemMessage, message.content, history);

      history.push({ role: 'user', content: message.content });
      history.push({ role: 'assistant', content: response });

      // 在 thread 中發送（可能分段）
      if (response.length > 2000) {
        let remaining = response;
        while (remaining.length > 0) {
          await message.reply(remaining.substring(0, 2000));
          remaining = remaining.substring(2000);
        }
      } else {
        await message.reply(response);
      }

    } catch (error) {
      console.error('[PO Bot] Error in thread conversation:', error);
      await message.reply('❌ 處理訊息時發生錯誤。');
    }
  });

  // 登入 Discord
  client.login(process.env.DISCORD_TOKEN_PO);
}

module.exports = { start };
