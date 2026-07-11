const { fetchAllNews } = require('./fetchNews');
const { filterNews } = require('./filterNews');
const { summarizeNews } = require('./summarize');
const { formatTelegramMessage, formatEmailHtml, formatWhatsAppMessage } = require('./formatDigest');
const { sendTelegramMessage } = require('./sendTelegram');
const { sendEmailDigest } = require('./sendEmail');
const { sendWhatsAppMessage } = require('./sendWhatsApp');
const config = require('./config');

async function run() {
  console.log('=== Overnight Market Digest — starting run ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const rawNews = await fetchAllNews();
  const filtered = filterNews(rawNews);

  let summaries = [];
  if (filtered.length > 0) {
    console.log(`[summarize] Sending ${Math.min(filtered.length, 60)} items to Claude...`);
    summaries = await summarizeNews(filtered, config.maxItems);
    console.log(`[summarize] Claude returned ${summaries.length} relevant, summarized items.`);
  } else {
    console.log('[summarize] No keyword-filtered items to summarize.');
  }

  const telegramText = formatTelegramMessage(summaries);
  const emailHtml = formatEmailHtml(summaries);
  const whatsappText = formatWhatsAppMessage(summaries);

  const results = await Promise.allSettled([
    sendTelegramMessage(telegramText),
    sendEmailDigest(emailHtml, summaries.length),
    sendWhatsAppMessage(whatsappText),
  ]);

  results.forEach((r, i) => {
    const channel = ['Telegram', 'Email', 'WhatsApp'][i];
    if (r.status === 'rejected') {
      console.error(`[index] ${channel} delivery failed:`, r.reason?.message || r.reason);
    }
  });

  console.log('=== Run complete ===');
}

run().catch((err) => {
  console.error('[index] Fatal error:', err);
  process.exit(1);
});
