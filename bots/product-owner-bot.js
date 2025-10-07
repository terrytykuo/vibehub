require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');

// 儲存每個 channel 最後一次使用 /make-stories 的訊息 ID
const lastStoriesCommandMessage = new Map();

// 定義 slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('make-stories')
    .setDescription('將頻道對話拆解成 user stories'),
];

async function start() {
  // 初始化 Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // 初始化 OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 註冊 slash commands
  async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_PO);

    try {
      console.log('[Product Owner Bot] Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      console.log('[Product Owner Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Product Owner Bot] Error registering commands:', error);
    }
  }

  // Bot 準備好時
  client.once('ready', async () => {
    console.log(`✅ [Product Owner Bot] Logged in as ${client.user.tag}`);
    await registerCommands();
  });

  // 處理 slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channelId, channel } = interaction;

    if (commandName === 'make-stories') {
      await interaction.deferReply();

      try {
        let messages = [];
        let fetchOptions = { limit: 100 };

        if (lastStoriesCommandMessage.has(channelId)) {
          fetchOptions.after = lastStoriesCommandMessage.get(channelId);
        }

        const fetchedMessages = await channel.messages.fetch(fetchOptions);

        messages = Array.from(fetchedMessages.values())
          .reverse()
          .filter(msg => !msg.author.bot)
          .map(msg => `${msg.author.username}: ${msg.content}`);

        if (messages.length === 0) {
          await interaction.editReply('📝 沒有找到新的對話內容來生成 stories。');
          return;
        }

        const conversationContext = messages.join('\n');

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `你是一個敏捷開發專家，擅長將對話需求拆解成結構化的 user stories。

請分析以下對話，提取出所有的需求，並將它們轉換成標準的 user stories 格式：

**User Story 格式：**
### Story [編號]: [簡短標題]
**As a** [角色]
**I want** [功能/需求]
**So that** [價值/目的]

**Acceptance Criteria:**
- [ ] [驗收條件1]
- [ ] [驗收條件2]
- [ ] [驗收條件3]

**Technical Notes:**
- [技術考量或實作提示]

---

請確保：
1. 每個 story 都是獨立且可測試的
2. 包含清楚的驗收條件
3. 按優先級或邏輯順序排列
4. 如果需求模糊，在 Technical Notes 中註明需要澄清的地方`
            },
            {
              role: 'user',
              content: `請分析以下對話並生成 user stories：\n\n${conversationContext}`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        const storiesContent = response.choices[0].message.content;

        const replyMessage = await interaction.fetchReply();
        lastStoriesCommandMessage.set(channelId, replyMessage.id);

        if (storiesContent.length > 2000) {
          await interaction.editReply('📚 **User Stories 生成完成！**\n\n內容較長，已建立 thread 顯示完整結果...');

          const thread = await channel.threads.create({
            name: `User Stories - ${new Date().toLocaleDateString()}`,
            autoArchiveDuration: 1440,
          });

          let remaining = storiesContent;
          while (remaining.length > 0) {
            await thread.send(remaining.substring(0, 2000));
            remaining = remaining.substring(2000);
          }

          await thread.send('\n---\n💡 **提示**: 使用 `/make-stories` 可以繼續分析新的對話內容。');
        } else {
          await interaction.editReply(`📚 **User Stories 生成完成！**\n\n${storiesContent}\n\n---\n💡 **提示**: 使用 \`/make-stories\` 可以繼續分析新的對話內容。`);
        }

      } catch (error) {
        console.error('[Product Owner Bot] Error generating stories:', error);
        await interaction.editReply('❌ 抱歉，生成 stories 時發生錯誤。');
      }
    }
  });

  // 登入 Discord
  client.login(process.env.DISCORD_TOKEN_PO);
}

module.exports = { start };
