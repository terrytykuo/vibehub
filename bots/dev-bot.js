require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
const { loadAgentWithDependencies } = require('./bmad-loader');

// 載入 Dev agent 及其依賴
const devAgent = loadAgentWithDependencies('dev');

// 儲存對話歷史
const conversationHistory = new Map();

// 定義 slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('顯示 Dev (James) 所有可用命令'),

  new SlashCommandBuilder()
    .setName('develop-story')
    .setDescription('根據 Story 產生實作計畫')
    .addStringOption(option =>
      option
        .setName('story')
        .setDescription('Story 內容（可在 thread 中貼上完整內容）')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('explain')
    .setDescription('詳細解釋實作方式（訓練模式）')
    .addStringOption(option =>
      option
        .setName('topic')
        .setDescription('要解釋的主題或程式碼')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('run-tests')
    .setDescription('執行測試與 linting'),

  new SlashCommandBuilder()
    .setName('review-qa')
    .setDescription('進行 QA review')
    .addStringOption(option =>
      option
        .setName('code')
        .setDescription('要 review 的程式碼或問題描述')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('execute-checklist')
    .setDescription('執行 Story DOD checklist'),

  new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug 協助')
    .addStringOption(option =>
      option
        .setName('issue')
        .setDescription('問題描述')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('清除此 channel 的對話歷史'),
];

/**
 * 建構 Dev persona system message
 */
function buildSystemMessage(commandName, dependencies = {}) {
  let systemMessage = `You are James, the Full Stack Developer from BMAD methodology.

${devAgent.agent.fullContent}

`;

  // 加入 core config
  if (devAgent.coreConfig) {
    systemMessage += `\n## Project Configuration\n${devAgent.coreConfig}\n`;
  }

  // 根據命令加入相關依賴
  if (dependencies.tasks) {
    dependencies.tasks.forEach(taskName => {
      if (devAgent.tasks[taskName]) {
        systemMessage += `\n## Task: ${taskName}\n${devAgent.tasks[taskName]}\n`;
      }
    });
  }

  if (dependencies.templates) {
    dependencies.templates.forEach(templateName => {
      if (devAgent.templates[templateName]) {
        systemMessage += `\n## Template: ${templateName}\n${devAgent.templates[templateName]}\n`;
      }
    });
  }

  if (dependencies.checklists) {
    dependencies.checklists.forEach(checklistName => {
      if (devAgent.checklists[checklistName]) {
        systemMessage += `\n## Checklist: ${checklistName}\n${devAgent.checklists[checklistName]}\n`;
      }
    });
  }

  systemMessage += `\nYou are operating in Discord. Provide clear, practical, and concise responses. For long outputs, they will be automatically posted in a thread.`;

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
      name: `💻 Dev: ${questionPreview.substring(0, 50)}...`,
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
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_DEV);

    try {
      console.log('[Dev Bot] Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      console.log('[Dev Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Dev Bot] Error registering commands:', error);
    }
  }

  // Bot 準備好時
  client.once('ready', async () => {
    console.log(`✅ [Dev Bot] Logged in as ${client.user.tag} - James (Developer)`);
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
      let story, topic, code, issue;

      switch (commandName) {
        case 'help':
          systemMessage = buildSystemMessage('help');
          userMessage = 'Please show me all available commands with descriptions. Format as a numbered list.';
          break;

        case 'develop-story':
          story = interaction.options.getString('story');
          if (!story) {
            await interaction.editReply('請在 thread 中提供完整的 story 內容，或使用 story 參數。');
            return;
          }
          dependencies = {
            tasks: ['validate-next-story']
          };
          systemMessage = buildSystemMessage('develop-story', dependencies);
          userMessage = `Execute the *develop-story command following the exact workflow defined in the dev agent persona:

Story to implement:
${story}

IMPORTANT: Follow the develop-story order-of-execution:
1. Read task and understand requirements
2. Plan implementation approach
3. Break down into specific implementation steps
4. Identify files that need to be created/modified
5. Define testing approach
6. Provide a complete, actionable implementation plan

Be thorough and provide specific technical details.`;
          break;

        case 'explain':
          topic = interaction.options.getString('topic');
          systemMessage = buildSystemMessage('explain');
          userMessage = topic
            ? `Execute the *explain command for: ${topic}. Teach me what and why in detail so I can learn, as if training a junior engineer.`
            : 'Execute the *explain command for the last thing we discussed. Teach me what and why in detail so I can learn.';
          break;

        case 'run-tests':
          systemMessage = buildSystemMessage('run-tests');
          userMessage = 'Execute the *run-tests command. Provide guidance on running linting and tests for this project.';
          break;

        case 'review-qa':
          code = interaction.options.getString('code');
          if (!code) {
            await interaction.editReply('請在 thread 中提供完整的程式碼或問題描述，或使用 code 參數。');
            return;
          }
          dependencies = {
            tasks: ['apply-qa-fixes']
          };
          systemMessage = buildSystemMessage('review-qa', dependencies);
          userMessage = `Execute the apply-qa-fixes task to review and provide QA feedback for:

${code}

Follow the task instructions to identify issues, suggest fixes, and ensure code quality standards are met.`;
          break;

        case 'execute-checklist':
          dependencies = {
            tasks: ['execute-checklist'],
            checklists: ['story-dod-checklist']
          };
          systemMessage = buildSystemMessage('execute-checklist', dependencies);
          userMessage = 'Execute the Story DOD (Definition of Done) checklist';
          break;

        case 'debug':
          issue = interaction.options.getString('issue');
          systemMessage = buildSystemMessage('debug');
          userMessage = `Help me debug this issue:\n${issue}`;
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
      if (commandName === 'develop-story') {
        displayMessage = `💻 **Developing Story**\n\n---\n\n${response}`;
      } else if (commandName === 'debug') {
        displayMessage = `🐛 **Debug Request**\nIssue: ${issue}\n\n---\n\n${response}`;
      } else if (commandName === 'explain') {
        displayMessage = `📚 **Explanation Request**${topic ? `\nTopic: ${topic}` : ''}\n\n---\n\n${response}`;
      } else {
        displayMessage = response;
      }

      // 處理長回應
      await handleLongResponse(interaction, displayMessage, commandName);

    } catch (error) {
      console.error('[Dev Bot] Error:', error);
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
      console.error('[Dev Bot] Error in thread conversation:', error);
      await message.reply('❌ 處理訊息時發生錯誤。');
    }
  });

  // 登入 Discord
  client.login(process.env.DISCORD_TOKEN_DEV);
}

module.exports = { start };
