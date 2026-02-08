# CLAUDE.md - Context for Claude Code

## Project Overview

Starwoven is a consciousness exploration app that sends intentions through 5 diverse AI models simultaneously, then uses Claude Opus to synthesize the responses into a coherent "woven" message.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with cosmic design system
- **State**: Zustand (single store)
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel

## AI Architecture

**Channeling (parallel, 5 models):**
- OpenAI GPT-4.1
- Anthropic Claude Sonnet 4.5
- Google Gemini 3.0 Pro
- DeepSeek V3.2
- xAI Grok 4.1

**Synthesis (single model):**
- Anthropic Claude Opus 4.6

## Key Design Decisions

1. **Flat file structure** - Components in `/components`, libs in `/lib`, single Zustand store
2. **Single API route** - `/api/channel` handles both channeling and synthesis
3. **Static question pool** - Questions defined in code, not database
4. **Anonymous sessions** - UUID in localStorage, linked to Supabase readings
5. **JSONB storage** - Single `readings` table with flexible JSONB columns

## Design System

```css
--cosmic-black: #0a0a1a
--cream: #e8e4dc
--gold: #c8a84e
--gray: #9a9488
```

**Fonts:**
- Headlines: Playfair Display
- Body: Inter

**Animations:**
- `float`, `breathe`, `twinkle`, `pulse-glow`

## File Locations

| What | Where |
|------|-------|
| Main page | `src/app/page.tsx` |
| API route | `src/app/api/channel/route.ts` |
| AI providers | `src/lib/ai.ts` |
| Prompts | `src/lib/prompts.ts` |
| Questions | `src/lib/questions.ts` |
| Types | `src/lib/types.ts` |
| Store | `src/store.ts` |
| Components | `src/components/` |

## Message Types

6 presets, each with themed questions and a specific "voice":
1. Love Interest
2. Deceased Loved One
3. Future Self
4. Universe/General
5. Life Decision
6. Purpose in World

## Domains

Primary: starwoven.app
All domains mirror to same Vercel deployment.

## Implementation Phases & GitHub Issues

| Phase | GitHub Issue | Status |
|-------|--------------|--------|
| Phase 0 | [#1 Infrastructure](https://github.com/Glass-Finch/starwoven-site/issues/1) | ✅ Complete |
| Phase 1 | [#2 Foundation + Design](https://github.com/Glass-Finch/starwoven-site/issues/2) | Pending |
| Phase 2 | [#3 UI Components](https://github.com/Glass-Finch/starwoven-site/issues/3) | Pending |
| Phase 3 | [#4 AI Integration](https://github.com/Glass-Finch/starwoven-site/issues/4) | Pending |
| Phase 4 | [#5 Polish + Ship](https://github.com/Glass-Finch/starwoven-site/issues/5) | Pending |
| Standards | [#6 Code Standards](https://github.com/Glass-Finch/starwoven-site/issues/6) | Pending |
| QA | [#7 AI Response QA](https://github.com/Glass-Finch/starwoven-site/issues/7) | Pending |
| Auth | [#8 OAuth + Accounts](https://github.com/Glass-Finch/starwoven-site/issues/8) | Future |

## Infrastructure (Complete)

- **Supabase**: `czczdlogtjickwarrjkq` - https://czczdlogtjickwarrjkq.supabase.co
- **Vercel**: `starwoven-site` with all 6 domains
- **Domains**: starwoven.app (primary), .academy, .institute, .observer, .org, getstarwoven.com

## Key Design Decisions (Updated)

1. **Mobile-first design** - Base styles target mobile, scale up with min-width breakpoints
2. **Flat file structure** - Components in `/components`, libs in `/lib`, single Zustand store
3. **Single API route** - `/api/channel` handles both channeling and synthesis
4. **Static question pool** - Questions defined in code, not database
5. **Anonymous sessions** - UUID in localStorage, linked to Supabase readings
6. **JSONB storage** - Single `readings` table with flexible JSONB columns
7. **AI Response QA** - Sonnet validates responses before Opus synthesis (GH#7)
8. **OAuth-ready** - Schema designed for future user accounts (GH#8)

## Mobile-First Guidelines

- Base styles = mobile, use `sm:`, `md:`, `lg:` for larger screens
- Min tap target: 44x44px
- Min font size: 16px (prevents iOS zoom)
- Use `clamp()` for fluid typography
- Stack layouts vertically on mobile
- Reduce Starfield stars on mobile for performance

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm supabase db push  # Push migrations
```

## Environment Variables

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Prompt Templates

See `src/lib/prompts.ts` for:
- `buildChannelingPrompt()` - Per-model channeling prompt with message type voice
- `buildSynthesisPrompt()` - Opus synthesis prompt that weaves responses

## Error Handling

- 30s timeout per AI model
- Minimum 3 successful responses required
- If synthesis fails, return longest response as fallback
- Show user which models responded
