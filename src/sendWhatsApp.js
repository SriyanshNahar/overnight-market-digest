const axios = require('axios');
const config = require('./config');

async function sendWhatsAppMessage(text) {
  if (!config.whatsappPhones.length || !config.callmebotApiKey) {
    console.warn('[sendWhatsApp] Missing WHATSAPP_PHONE or CALLMEBOT_APIKEY - skipping WhatsApp send.');
    return;
  }

  const url = 'https://api.callmebot.com/whatsapp.php';

  for (const phone of config.whatsappPhones) {
    try {
      await axios.get(url, {
        params: {
          phone,
          text,
          apikey: config.callmebotApiKey,
        },
        timeout: 15000,
      });
      console.log(`[sendWhatsApp] Digest sent successfully to ${phone}.`);
    } catch (err) {
      console.error(`[sendWhatsApp] Failed to send message to ${phone}:`, err.response?.data || err.message);
    }
  }
}

module.exports = { sendWhatsAppMessage };
