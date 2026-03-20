# Cost Tracking

Starwoven uses 8 API calls per successful reading. This document tracks per-reading cost estimates and pricing.

## Cost Per Reading (Estimate)

Based on typical token usage (~1,500 input / ~800 output per channeling call, ~3,000 input / ~200 output for moderation, ~6,000 input / ~4,000 output for review, ~8,000 input / ~3,000 output for synthesis):

| Stage      | Model                | Input Tokens | Output Tokens | Est. Cost  |
| ---------- | -------------------- | ------------ | ------------- | ---------- |
| Moderation | Claude Haiku 4.5     | ~3,000       | ~200          | $0.004     |
| Iris       | GPT-4.1              | ~1,500       | ~800          | $0.009     |
| Luna       | Claude Sonnet 4.5    | ~1,500       | ~800          | $0.017     |
| Echo       | Gemini 3 Pro Preview | ~1,500       | ~800          | $0.013     |
| Shade      | DeepSeek Reasoner    | ~1,500       | ~800          | $0.001     |
| Nova       | Grok 4.1 Fast        | ~1,500       | ~800          | $0.001     |
| Review     | Claude Sonnet 4.5    | ~6,000       | ~4,000        | $0.078     |
| Synthesis  | Claude Opus 4.6      | ~8,000       | ~3,000        | $0.115     |
| **Total**  |                      |              |               | **~$0.24** |

**Estimated cost per reading: $0.20 - $0.30 USD**

The dominant cost is synthesis (Opus 4.6) at roughly half the total, followed by review (Sonnet 4.5). The 5 channeling calls together cost less than either.

## Per-Provider Pricing (per 1M tokens)

Verified 2026-02-10.

| Provider  | Model                | Input | Output | Role                       |
| --------- | -------------------- | ----- | ------ | -------------------------- |
| OpenAI    | GPT-4.1              | $2.00 | $8.00  | Iris (channeling)          |
| Anthropic | Claude Sonnet 4.5    | $3.00 | $15.00 | Luna (channeling) + Review |
| Google    | Gemini 3 Pro Preview | $2.00 | $12.00 | Echo (channeling)          |
| DeepSeek  | DeepSeek Reasoner    | $0.28 | $0.42  | Shade (channeling)         |
| xAI       | Grok 4.1 Fast        | $0.20 | $0.50  | Nova (channeling)          |
| Anthropic | Claude Haiku 4.5     | $1.00 | $5.00  | Moderation                 |
| Anthropic | Claude Opus 4.6      | $5.00 | $25.00 | Synthesis                  |

## Token Budgets

Configured in `src/lib/constants.ts`:

| Stage             | Max Output Tokens | Timeout |
| ----------------- | ----------------- | ------- |
| Moderation        | 256               | 3s      |
| Channeling (each) | 3,000             | 30s     |
| Review            | 4,096             | 15s     |
| Synthesis         | 4,000             | 60s     |

## Cost at Scale

| Readings/day | Daily Cost | Monthly Cost |
| ------------ | ---------- | ------------ |
| 10           | $2.40      | $72          |
| 50           | $12        | $360         |
| 100          | $24        | $720         |
| 500          | $120       | $3,600       |

## Moderation Short-Circuit

If moderation rejects an intention, the 7 downstream calls are skipped — saving ~$0.23 per rejected reading. Moderation itself costs ~$0.004.

## Cost Persistence

Token usage is captured from all providers and logged as structured JSON via `console.info` with a `[cost]` prefix. Cost data is persisted to:

1. **Reading metadata** — `cost` field in the readings table `metadata` JSONB column
2. **Dedicated `cost_tracking` table** — per-stage token counts, per-model breakdown, total cost (see `supabase/migrations/003_cost_tracking.sql`)

Both writes are fire-and-forget from the API route. The `cost_tracking` row is linked to its reading via `reading_id` FK.

Example log output:

```json
{
  "sessionId": "abc123",
  "moderation": { "inputTokens": 2800, "outputTokens": 150, "costUSD": 0.004 },
  "channeling": { "inputTokens": 7500, "outputTokens": 4000, "costUSD": 0.04 },
  "review": { "inputTokens": 6000, "outputTokens": 4000, "costUSD": 0.078 },
  "synthesis": { "inputTokens": 8000, "outputTokens": 3000, "costUSD": 0.115 },
  "perModel": {
    "gpt-4.1": { "inputTokens": 1500, "outputTokens": 800, "costUSD": 0.009 },
    "claude-sonnet-4.5": { "inputTokens": 1500, "outputTokens": 800, "costUSD": 0.017 },
    "gemini-3-pro-preview": { "inputTokens": 1500, "outputTokens": 800, "costUSD": 0.013 },
    "deepseek-reasoner": { "inputTokens": 1500, "outputTokens": 800, "costUSD": 0.001 },
    "grok-4-1-fast-reasoning": { "inputTokens": 1500, "outputTokens": 800, "costUSD": 0.001 }
  },
  "totalTokens": 35700,
  "estimatedCostUSD": 0.237
}
```

## Roadmap

- **v2:** Admin dashboard with daily/weekly/monthly aggregates
- **v3:** User-facing credits for monetization

## Sources

- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [xAI Pricing](https://docs.x.ai/developers/models)
