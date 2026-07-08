const axios = require('axios');
const config = require('./config');
const { splitForTelegram } = require('./formatDigest');

async function sendTelegramMessage(text) {
  if (!config.telegramBotToken || !config.telegramChatId) {
    console.warn('[sendTelegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID - skipping Telegram send.');
    return;
  }

  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  const chunks = splitForTelegram(text);

  for (const chunk of chunks) {
    try {
      await axios.post(url, {
        chat_id: config.telegramChatId,
        text: chunk,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
    } catch (err) {
      console.error('[sendTelegram] Failed to send message:', err.response?.data || err.message);
      throw err;
    }
  }
  console.log(`[sendTelegram] Sent digest (${chunks.length} message${chunks.length > 1 ? 's' : ''})`);
}

module.exports = { sendTelegramMessage };
