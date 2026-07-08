const IMPACT_EMOJI = {
  bullish: '📈',
  bearish: '📉',
  neutral: '⚖️',
};

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Build the Telegram message (Markdown formatted).
 */
function formatTelegramMessage(summaries) {
  const date = todayLabel();

  if (!summaries.length) {
    return `🌙 *Overnight Market Digest — ${date}*\n\nNo significant market-moving news found in the last window. Quiet night! ✅`;
  }

  let msg = `🌙 *Overnight Market Digest — ${date}*\n_News from 9 PM–9 AM that could impact trading_\n\n`;

  summaries.forEach((item, i) => {
    const emoji = IMPACT_EMOJI[item.impact] || '⚖️';
    msg += `${i + 1}. ${emoji} *${escapeMd(item.title)}*\n`;
    msg += `${escapeMd(item.summary)}\n`;
    if (item.link) msg += `🔗 [Read more](${item.link})\n`;
    msg += `\n`;
  });

  msg += `_Source: ${summaries.length} market-relevant stories overnight_`;
  return msg;
}

// Telegram Markdown needs a few characters escaped
function escapeMd(text = '') {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

/**
 * Build the HTML email version.
 */
function formatEmailHtml(summaries) {
  const date = todayLabel();

  if (!summaries.length) {
    return `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>🌙 Overnight Market Digest — ${date}</h2>
        <p>No significant market-moving news found in the last window. Quiet night! ✅</p>
      </div>`;
  }

  const rows = summaries
    .map((item, i) => {
      const emoji = IMPACT_EMOJI[item.impact] || '⚖️';
      const color = item.impact === 'bullish' ? '#16a34a' : item.impact === 'bearish' ? '#dc2626' : '#6b7280';
      return `
        <div style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; font-size: 15px; color: #111827;">
            ${i + 1}. ${emoji} ${item.title}
          </div>
          <div style="font-size: 14px; color: #374151; margin-top: 4px;">
            ${item.summary}
          </div>
          <div style="margin-top: 6px; font-size: 12px;">
            <span style="color: ${color}; font-weight: 600; text-transform: uppercase;">${item.impact}</span>
            ${item.link ? ` &middot; <a href="${item.link}" style="color: #2563eb;">Read more</a>` : ''}
            ${item.source ? ` &middot; <span style="color: #9ca3af;">${item.source}</span>` : ''}
          </div>
        </div>`;
    })
    .join('');

  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="margin-bottom: 0;">🌙 Overnight Market Digest</h2>
      <p style="color: #6b7280; margin-top: 4px;">${date} &middot; News from 9 PM–9 AM that could impact trading</p>
      ${rows}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
        Auto-generated overnight digest &middot; ${summaries.length} stories
      </p>
    </div>`;
}

/**
 * Telegram messages have a 4096 char limit. Split into chunks if needed.
 */
function splitForTelegram(text, limit = 4000) {
  if (text.length <= limit) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > limit) {
    let splitAt = remaining.lastIndexOf('\n\n', limit);
    if (splitAt === -1) splitAt = limit;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining.length) chunks.push(remaining);
  return chunks;
}

module.exports = { formatTelegramMessage, formatEmailHtml, splitForTelegram };
