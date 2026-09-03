/**
 * Utility functions for pricing and subscription packages.
 * Conversion standard: Dynamic tokens per conversational message (default: ~333.56).
 * Configurable dynamically by SuperAdmin via Pricing Engine settings.
 */

export const DEFAULT_TOKENS_PER_MESSAGE = 333.56;

let currentTokensPerMessage = DEFAULT_TOKENS_PER_MESSAGE;

// Try to hydrate from localStorage on client side
if (typeof window !== "undefined") {
  try {
    const cached = localStorage.getItem("jobab_tokens_per_msg");
    if (cached) {
      const parsed = parseFloat(cached);
      if (!isNaN(parsed) && parsed > 0) {
        currentTokensPerMessage = parsed;
      }
    }
  } catch (_) {}
}

/**
 * Updates the global tokens-per-message conversion standard in real-time.
 */
export function setGlobalTokensPerMessage(rate: number) {
  if (rate && typeof rate === "number" && rate > 0) {
    currentTokensPerMessage = rate;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jobab_tokens_per_msg", rate.toString());
      } catch (_) {}
    }
  }
}

/**
 * Retrieves the currently active tokens-per-message conversion standard.
 */
export function getGlobalTokensPerMessage(): number {
  return currentTokensPerMessage;
}

/**
 * Calculates client-friendly estimated message count from AI tokens.
 * Rounds cleanly for business display (e.g., 500k tokens at 333.56 -> 1,500 messages).
 */
export function calculateEstimatedMessages(tokens: number, customTokensPerMessage?: number): number {
  if (!tokens || tokens <= 0) return 0;
  const rate = customTokensPerMessage && customTokensPerMessage > 0 
    ? customTokensPerMessage 
    : currentTokensPerMessage;
  const raw = tokens / rate;
  if (raw >= 500) {
    return Math.round(raw / 50) * 50;
  }
  return Math.round(raw);
}

/**
 * Formats message estimate string, e.g. "~1,500 Messages"
 */
export function formatEstimatedMessages(tokens: number, customTokensPerMessage?: number): string {
  const count = calculateEstimatedMessages(tokens, customTokensPerMessage);
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
export function formatMessageWithTokens(tokens: number, customTokensPerMessage?: number): string {
  const msgCount = calculateEstimatedMessages(tokens, customTokensPerMessage);
  const tokenStr = formatCompactTokens(tokens);
  return `~${msgCount.toLocaleString()} Messages (${tokenStr})`;
}

/**
 * Enhances a feature bullet string.
 * If the string mentions "X AI Tokens", it transforms it to highlight messages first.
 */
export function enhanceFeatureWithMessages(
  feature: string,
  planTokenLimit?: number,
  customTokensPerMessage?: number
): string {
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
      const msgCount = calculateEstimatedMessages(tokens, customTokensPerMessage);
      const tokenStr = formatCompactTokens(tokens);
      return `~${msgCount.toLocaleString()} AI Messages / month (${tokenStr})`;
    }
  }

  return feature;
}
