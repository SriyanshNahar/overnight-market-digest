const Parser = require('rss-parser');
const axios = require('axios');
const { RSS_FEEDS } = require('./sources');
const config = require('./config');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (overnight-market-digest bot)' },
});

/**
 * Fetch a single RSS feed. Returns [] on failure (never throws) so one
 * dead feed doesn't take down the whole run.
 */
async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items || []).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || null,
      snippet: (item.contentSnippet || item.content || '').slice(0, 400),
      source: feed.name,
    }));
  } catch (err) {
    console.warn(`[fetchNews] Skipping feed "${feed.name}" - ${err.message}`);
    return [];
  }
}

/**
 * Optional: fetch from NewsAPI.org if a key is configured. Adds extra
 * coverage beyond RSS feeds.
 */
async function fetchNewsApi() {
  if (!config.newsApiKey) return [];
  try {
    const query = encodeURIComponent(
      'stock market OR trading OR Nifty OR Sensex OR Fed OR RBI OR crude oil OR war OR Iran OR sanctions'
    );
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${config.newsApiKey}`;
    const { data } = await axios.get(url, { timeout: 10000 });
    return (data.articles || []).map((a) => ({
      title: a.title || '',
      link: a.url || '',
      pubDate: a.publishedAt || null,
      snippet: (a.description || '').slice(0, 400),
      source: a.source?.name || 'NewsAPI',
    }));
  } catch (err) {
    console.warn(`[fetchNews] NewsAPI fetch failed - ${err.message}`);
    return [];
  }
}

/**
 * Fetch everything from all sources in parallel and combine.
 */
async function fetchAllNews() {
  const results = await Promise.all([
    ...RSS_FEEDS.map(fetchFeed),
    fetchNewsApi(),
  ]);
  const combined = results.flat();
  console.log(`[fetchNews] Fetched ${combined.length} total items from ${RSS_FEEDS.length} RSS feeds${config.newsApiKey ? ' + NewsAPI' : ''}`);
  return combined;
}

module.exports = { fetchAllNews };
