// RSS feeds - mix of Indian + global market/business/world news.
// NOTE: RSS feed URLs occasionally change or go down. If a feed stops
// working, just replace/remove the URL below - the fetcher skips dead
// feeds gracefully and continues with the rest.
const RSS_FEEDS = [
  { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { name: 'Moneycontrol Business', url: 'https://www.moneycontrol.com/rss/business.xml' },
  { name: 'Moneycontrol Markets', url: 'https://www.moneycontrol.com/rss/marketreports.xml' },
  { name: 'Business Standard Markets', url: 'https://www.business-standard.com/rss/markets-106.rss' },
  { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' },
  { name: 'CNBC World Markets', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
  { name: 'Reuters World News', url: 'https://feeds.reuters.com/Reuters/worldNews' },
  { name: 'Al Jazeera (Geopolitics)', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
];

// Keyword pre-filter - a news item must match at least one of these
// (case-insensitive) to be considered "possibly market-relevant" before
// it's even sent to Claude for the smarter relevance + summary pass.
// This keeps API costs low by not summarizing irrelevant news.
const TRADING_KEYWORDS = [
  // Geopolitical / war / conflict
  'war', 'attack', 'strike', 'missile', 'sanction', 'ceasefire', 'conflict',
  'tension', 'iran', 'israel', 'russia', 'ukraine', 'china', 'taiwan',
  'military', 'border', 'terror',

  // Macro / policy
  'fed', 'federal reserve', 'rbi', 'interest rate', 'rate cut', 'rate hike',
  'inflation', 'gdp', 'recession', 'unemployment', 'budget', 'tariff',
  'trade deal', 'trade war', 'export', 'import ban',

  // Commodities / currency
  'crude oil', 'oil price', 'opec', 'gold price', 'dollar', 'rupee',
  'currency', 'forex',

  // Markets
  'nifty', 'sensex', 'dow jones', 'nasdaq', 's&p 500', 'stock market',
  'share market', 'ipo', 'crash', 'rally', 'bull market', 'bear market',
  'selloff', 'sell-off', 'volatility',

  // Corporate / earnings
  'earnings', 'quarterly results', 'merger', 'acquisition', 'bankruptcy',
  'default', 'layoffs', 'sec probe', 'regulatory action',
];

module.exports = { RSS_FEEDS, TRADING_KEYWORDS };
