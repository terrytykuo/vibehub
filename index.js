require('dotenv').config();

// 導入所有 bots
const vibeBot = require('./bots/vibe-bot');
const poBot = require('./bots/po-bot');
// const devBot = require('./bots/dev-bot');

console.log('🚀 Starting bots...\n');

// 啟動 bots
vibeBot.start();
poBot.start();
// devBot.start();

console.log('\n✨ Bots are starting up...');
console.log('📝 Check logs above for individual bot status.\n');
