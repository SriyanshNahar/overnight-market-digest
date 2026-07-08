const { fetchAllNews } = require('./fetchNews');
const { filterNews } = require('./filterNews');
const { summarizeNews } = require('./summarize');
const { formatTelegramMessage, formatEmailHtml } = require('./formatDigest');
const { sendTelegramMessage } = require('./sendTelegram');
const { sendEmailDigest } = require('./sendEmail');
const config = require('./config');

async function run() {
  console.log('=== Overnight Market Digest — starting run ===');
  console.log(`Time: ${new Date().toISOString()}`);

  // 1. Fetch raw news from all sources
  const rawNews = await fetchAllNews();

  // 2. Filter by time window + trading keywords
  const filtered = filterNews(rawNews);

  // 3. Send to Claude for relevance check, summary, and impact tag
  let summaries = [];
  if (filtered.length > 0) {
    console.log(`[summarize] Sending ${Math.min(filtered.length, 60)} items to Claude...`);
    summaries = await summarizeNews(filtered, config.maxItems);
    console.log(`[summarize] Claude returned ${summaries.length} relevant, summarized items.`);
  } else {
    console.log('[summarize] No keyword-filtered items to summarize.');
  }

  // 4. Format digest for both channels
  const telegramText = formatTelegramMessage(summaries);
  const emailHtml = formatEmailHtml(summaries);

  // 5. Send via both channels (don't let one failure block the other)
  const results = await Promise.allSettled([
    sendTelegramMessage(telegramText),
    sendEmailDigest(emailHtml, summaries.length),
  ]);

  results.forEach((r, i) => {
    const channel = i === 0 ? 'Telegram' : 'Email';
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
