require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');

// 儲存對話歷史
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
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_VIBE);

    try {
      console.log('[Vibe Bot] Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      console.log('[Vibe Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Vibe Bot] Error registering commands:', error);
    }
  }

  // Bot 準備好時
  client.once('ready', async () => {
    console.log(`✅ [Vibe Bot] Logged in as ${client.user.tag}`);
    await registerCommands();
  });

  // 處理 slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channelId } = interaction;

    if (commandName === 'ask') {
      const question = interaction.options.getString('question');

      await interaction.deferReply();

      try {
        if (!conversationHistory.has(channelId)) {
          conversationHistory.set(channelId, []);
        }

        const history = conversationHistory.get(channelId);

        history.push({
          role: 'user',
          content: question,
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: history,
          max_tokens: 2000,
          temperature: 0.7,
        });

        const gptResponse = response.choices[0].message.content;

        history.push({
          role: 'assistant',
          content: gptResponse,
        });

        if (gptResponse.length > 2000) {
          await interaction.editReply(gptResponse.substring(0, 2000));

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
        console.error('[Vibe Bot] Error calling OpenAI API:', error);
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
    if (message.author.bot) return;
    if (!message.channel.isThread()) return;

    const starterMessage = await message.channel.fetchStarterMessage();
    if (starterMessage?.author.id !== client.user.id) return;

    try {
      await message.channel.sendTyping();

      const threadId = message.channel.id;

      if (!conversationHistory.has(threadId)) {
        conversationHistory.set(threadId, []);
      }

      const history = conversationHistory.get(threadId);

      history.push({
        role: 'user',
        content: message.content,
      });

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: history,
        max_tokens: 2000,
        temperature: 0.7,
      });

      const gptResponse = response.choices[0].message.content;

      history.push({
        role: 'assistant',
        content: gptResponse,
      });

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
      console.error('[Vibe Bot] Error in thread conversation:', error);
      await message.reply('❌ Sorry, there was an error processing your message.');
    }
  });

  // 登入 Discord
  client.login(process.env.DISCORD_TOKEN_VIBE);
}

module.exports = { start };
