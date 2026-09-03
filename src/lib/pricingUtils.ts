/**
 * Utility functions for pricing and subscription packages.
 * Conversion standard: ~333.56 AI Tokens per conversational message.
 * Normalizes complex token counts into client-friendly message estimates.
 */

export const TOKENS_PER_MESSAGE = 333.56;

/**
 * Calculates client-friendly estimated message count from AI tokens.
 * Rounds cleanly for business display (e.g., 500k tokens -> 1,500 messages).
 */
export function calculateEstimatedMessages(tokens: number): number {
  if (!tokens || tokens <= 0) return 0;
  const raw = tokens / TOKENS_PER_MESSAGE;
  if (raw >= 500) {
    return Math.round(raw / 50) * 50;
  }
  return Math.round(raw);
}

/**
 * Formats message estimate string, e.g. "~1,500 Messages"
 */
export function formatEstimatedMessages(tokens: number): string {
  const count = calculateEstimatedMessages(tokens);
  return `~${count.toLocaleString()} Messages`;
}

/**
 * Formats tokens as a compact string, e.g. "500k" or "2.5M"
 */
export function formatCompactTokens(tokens: number): string {
  if (!tokens || tokens <= 0) return "0";
  if (tokens >= 1000000) {
    const m = tokens / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M Tokens`;
  }
  const k = tokens / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k Tokens`;
}

/**
 * Returns a dual highlight badge text, e.g.:
 * "~1,500 Messages / mo (~500k Tokens)"
 */
export function formatMessageWithTokens(tokens: number): string {
  const msgCount = calculateEstimatedMessages(tokens);
  const tokenStr = formatCompactTokens(tokens);
  return `~${msgCount.toLocaleString()} Messages (${tokenStr})`;
}

/**
 * Enhances a feature bullet string.
 * If the string mentions "X AI Tokens", it transforms it to highlight messages first.
 */
export function enhanceFeatureWithMessages(feature: string, planTokenLimit?: number): string {
  // Check if string matches patterns like "500,000 AI Tokens / month" or "2.5M Tokens"
  const tokenRegex = /([0-9.,]+)\s*(?:M|k|K)?\s*(?:AI\s*)?Tokens(?:\s*\/\s*(?:month|mo))?/i;
  const match = feature.match(tokenRegex);

  if (match) {
    let tokens = planTokenLimit;
    if (!tokens) {
      const numStr = match[1].replace(/,/g, "");
      if (feature.toLowerCase().includes("m") && !numStr.includes(".")) {
        tokens = parseFloat(numStr) * 1000000;
      } else if (feature.toLowerCase().includes("k")) {
        tokens = parseFloat(numStr) * 1000;
      } else {
        tokens = parseFloat(numStr);
      }
    }

    if (tokens && tokens > 0) {
      const msgCount = calculateEstimatedMessages(tokens);
      const tokenStr = formatCompactTokens(tokens);
      return `~${msgCount.toLocaleString()} AI Messages / month (${tokenStr})`;
    }
  }

  return feature;
}
