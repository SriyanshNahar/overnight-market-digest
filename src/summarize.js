const axios = require('axios');
const config = require('./config');

const SYSTEM_PROMPT = `You are a financial news analyst. You will be given a list of raw news headlines/snippets from the last several hours.

Your job:
1. Decide which items would actually MOVE or MATTER to stock/trading markets (Indian markets like Nifty/Sensex especially, but also global markets that affect India - US Fed, crude oil, geopolitics like Iran/Israel/Russia-Ukraine/China tensions, tariffs, major company earnings, etc). Ignore generic news, sports, entertainment, or anything with no real trading relevance.
2. For each relevant item, write a SHORT 1-2 sentence summary in simple English explaining what happened AND why it matters for markets/trading.
3. Tag each with an impact type: "bullish" (positive for markets), "bearish" (negative for markets), or "neutral" (mixed/unclear impact).
4. Rank by importance - most market-moving news first.
5. Return AT MOST the top items requested - do not pad with weak/irrelevant items just to fill the count.

Respond with ONLY a raw JSON array, no markdown code fences, no preamble, no explanation. Format:
[
  {
    "title": "short punchy headline (max 12 words)",
    "summary": "1-2 sentence summary explaining what happened and market impact",
    "impact": "bullish" | "bearish" | "neutral",
    "source": "original source name",
    "link": "original article link"
  }
]

If NO items are genuinely market-relevant, return an empty array: []`;

/**
 * Send the pre-filtered news list to Claude for the smart relevance pass,
 * summarization, and impact tagging.
 */
async function summarizeNews(items, maxItems = config.maxItems) {
  if (!items.length) return [];

  const newsListText = items
    .slice(0, 60) // cap input size to keep cost/latency reasonable
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}\n   ${item.snippet}\n   Link: ${item.link}`)
    .join('\n\n');

  const userPrompt = `Here are ${items.length} overnight news items. Pick and summarize the top ${maxItems} most market-relevant ones:\n\n${newsListText}`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 30000,
    }
  );

  const rawText = response.data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[summarize] Failed to parse Claude response as JSON:', err.message);
    console.error('[summarize] Raw response was:', rawText);
    return [];
  }
}

module.exports = { summarizeNews };
