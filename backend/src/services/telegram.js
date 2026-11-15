const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

let bot = null;

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

async function sendBriefing(markdown, chatId = process.env.TELEGRAM_CHAT_ID) {
  const telegram = getBot();
  if (!telegram) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  if (!chatId) {
    throw new Error('TELEGRAM_CHAT_ID is not configured');
  }

  // Telegram has a 4096 character limit per message
  const chunks = splitMessage(markdown, 4000);

  for (const chunk of chunks) {
    await telegram.sendMessage(chatId, chunk, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
  }

  return { ok: true, messages: chunks.length };
}

function splitMessage(text, maxLength) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let current = '';

  for (const line of text.split('\n')) {
    if ((current + line + '\n').length > maxLength) {
      if (current) chunks.push(current.trim());
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

module.exports = { sendBriefing, getBot };
