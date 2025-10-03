require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');

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

// 儲存對話歷史 (簡單版本,實際應該用資料庫)
const conversationHistory = new Map();

// 儲存每個 channel 最後一次使用 /make-stories 的訊息 ID
const lastStoriesCommandMessage = new Map();

// 定義 slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask ChatGPT a question')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('Your question for ChatGPT')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear conversation history in this channel'),
  new SlashCommandBuilder()
    .setName('make-stories')
    .setDescription('將頻道對話拆解成 user stories'),
];

// 註冊 slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Bot 準備好時
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  await registerCommands();
});

// 處理 slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, channelId } = interaction;

  if (commandName === 'ask') {
    const question = interaction.options.getString('question');
    
    // 延遲回應,因為 OpenAI API 可能需要時間
    await interaction.deferReply();

    try {
      // 取得或建立對話歷史
      if (!conversationHistory.has(channelId)) {
        conversationHistory.set(channelId, []);
      }
      
      const history = conversationHistory.get(channelId);
      
      // 加入使用者的問題
      history.push({
        role: 'user',
        content: question,
      });

      // 呼叫 OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // 或使用 'gpt-3.5-turbo' 來節省成本
        messages: history,
        max_tokens: 2000,
        temperature: 0.7,
      });

      const gptResponse = response.choices[0].message.content;

      // 儲存 GPT 的回應到歷史
      history.push({
        role: 'assistant',
        content: gptResponse,
      });

      // 如果回應太長,分段發送
      if (gptResponse.length > 2000) {
        await interaction.editReply(gptResponse.substring(0, 2000));
        
        // 在 thread 中繼續回應
        const thread = await interaction.channel.threads.create({
          name: `Response to: ${question.substring(0, 50)}...`,
          autoArchiveDuration: 60,
        });
        
        let remaining = gptResponse.substring(2000);
        while (remaining.length > 0) {
          await thread.send(remaining.substring(0, 2000));
          remaining = remaining.substring(2000);
        }
      } else {
        await interaction.editReply(gptResponse);
      }

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      await interaction.editReply('❌ Sorry, there was an error processing your request.');
    }
  }

  if (commandName === 'clear') {
    conversationHistory.delete(channelId);
    await interaction.reply('✅ Conversation history cleared for this channel.');
  }

  if (commandName === 'make-stories') {
    // 延遲回應
    await interaction.deferReply();

    try {
      // 取得頻道訊息
      let messages = [];
      let fetchOptions = { limit: 100 };

      // 如果有上次的 /make-stories 指令記錄，只讀取之後的訊息
      if (lastStoriesCommandMessage.has(channelId)) {
        fetchOptions.after = lastStoriesCommandMessage.get(channelId);
      }

      const fetchedMessages = await interaction.channel.messages.fetch(fetchOptions);

      // 將訊息轉換為陣列並反轉順序（從舊到新）
      messages = Array.from(fetchedMessages.values())
        .reverse()
        .filter(msg => !msg.author.bot) // 排除 bot 訊息
        .map(msg => `${msg.author.username}: ${msg.content}`);

      if (messages.length === 0) {
        await interaction.editReply('📝 沒有找到新的對話內容來生成 stories。');
        return;
      }

      // 組合對話內容
      const conversationContext = messages.join('\n');

      // 呼叫 OpenAI API 生成 stories
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

      // 儲存這次指令的訊息 ID（用於下次讀取）
      const replyMessage = await interaction.fetchReply();
      lastStoriesCommandMessage.set(channelId, replyMessage.id);

      // 如果回應太長，分段發送或建立 thread
      if (storiesContent.length > 2000) {
        // 先發送摘要
        await interaction.editReply('📚 **User Stories 生成完成！**\n\n內容較長，已建立 thread 顯示完整結果...');

        // 建立 thread
        const thread = await interaction.channel.threads.create({
          name: `User Stories - ${new Date().toLocaleDateString()}`,
          autoArchiveDuration: 1440, // 24小時
        });

        // 在 thread 中分段發送
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
      console.error('Error generating stories:', error);
      await interaction.editReply('❌ 抱歉，生成 stories 時發生錯誤。');
    }
  }
});

// 在 thread 中的對話
client.on('messageCreate', async (message) => {
  // 忽略 bot 自己的訊息
  if (message.author.bot) return;
  
  // 只處理 thread 中的訊息
  if (!message.channel.isThread()) return;
  
  // 檢查 thread 是否由 vibebot 建立
  const starterMessage = await message.channel.fetchStarterMessage();
  if (starterMessage?.author.id !== client.user.id) return;

  try {
    // 顯示正在輸入...
    await message.channel.sendTyping();

    const threadId = message.channel.id;
    
    // 取得或建立對話歷史
    if (!conversationHistory.has(threadId)) {
      conversationHistory.set(threadId, []);
    }
    
    const history = conversationHistory.get(threadId);
    
    // 加入使用者的訊息
    history.push({
      role: 'user',
      content: message.content,
    });

    // 呼叫 OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // 或使用 'gpt-3.5-turbo'
      messages: history,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const gptResponse = response.choices[0].message.content;

    // 儲存回應
    history.push({
      role: 'assistant',
      content: gptResponse,
    });

    // 發送回應
    if (gptResponse.length > 2000) {
      let remaining = gptResponse;
      while (remaining.length > 0) {
        await message.reply(remaining.substring(0, 2000));
        remaining = remaining.substring(2000);
      }
    } else {
      await message.reply(gptResponse);
    }

  } catch (error) {
    console.error('Error in thread conversation:', error);
    await message.reply('❌ Sorry, there was an error processing your message.');
  }
});

// 登入 Discord
client.login(process.env.DISCORD_TOKEN);