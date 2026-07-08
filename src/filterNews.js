const { TRADING_KEYWORDS } = require('./sources');
const config = require('./config');

/**
 * Keep only items published within the lookback window (default 13hrs,
 * covering the 9PM-9AM overnight period).
 */
function filterByTime(items) {
  const cutoff = Date.now() - config.lookbackHours * 60 * 60 * 1000;
  return items.filter((item) => {
    if (!item.pubDate) return true; // keep if no date info, let AI decide relevance
    const t = new Date(item.pubDate).getTime();
    if (Number.isNaN(t)) return true;
    return t >= cutoff;
  });
}

/**
 * Keep only items that mention at least one trading/market keyword.
 * This is a cheap pre-filter to avoid sending irrelevant news (sports,
 * entertainment, etc.) to the Claude API for summarization.
 */
function filterByKeyword(items) {
  return items.filter((item) => {
    const text = `${item.title} ${item.snippet}`.toLowerCase();
    return TRADING_KEYWORDS.some((kw) => text.includes(kw));
  });
}

/**
 * Remove duplicate stories (same title appearing across multiple feeds).
 */
function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterNews(items) {
  const timeFiltered = filterByTime(items);
  const keywordFiltered = filterByKeyword(timeFiltered);
  const deduped = dedupe(keywordFiltered);
  console.log(`[filterNews] ${items.length} -> ${timeFiltered.length} (time) -> ${keywordFiltered.length} (keyword) -> ${deduped.length} (deduped)`);
  return deduped;
}

module.exports = { filterNews };
