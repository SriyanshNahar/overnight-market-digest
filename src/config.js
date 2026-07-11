require('dotenv').config();

module.exports = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatIds: (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  sendgridToEmail: process.env.SENDGRID_TO_EMAIL,
  whatsappPhones: (process.env.WHATSAPP_PHONE || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
  callmebotApiKey: process.env.CALLMEBOT_APIKEY,
  newsApiKey: process.env.NEWSAPI_KEY || null,
  lookbackHours: parseInt(process.env.LOOKBACK_HOURS || '13', 10),
  maxItems: parseInt(process.env.MAX_ITEMS || '10', 10),
};
