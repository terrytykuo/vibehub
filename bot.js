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