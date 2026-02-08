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

## Key Design Decisions

1. **Mobile-first design** - Base styles target mobile, scale up with min-width breakpoints
2. **Flat file structure** - Components in `/components`, libs in `/lib`, single Zustand store
3. **Single API route** - `/api/channel` handles both channeling and synthesis
4. **Static question pool** - Questions defined in code, not database
5. **Anonymous sessions** - UUID in localStorage, linked to Supabase readings
6. **JSONB storage** - Single `readings` table with flexible JSONB columns

## Message Types

6 presets, each with themed questions and a specific "voice":
1. Love Interest
2. Deceased Loved One
3. Future Self
4. Universe/General
5. Life Decision
6. Purpose in World

## Infrastructure

- **Supabase**: Project ID `czczdlogtjickwarrjkq`
- **Vercel**: `starwoven-site` with all 6 domains
- **Domains**: starwoven.app (primary), .academy, .institute, .observer, .org, getstarwoven.com

## Mobile-First Guidelines

- Base styles = mobile, use `sm:`, `md:`, `lg:` for larger screens
- Min tap target: 44x44px
- Min font size: 16px (prevents iOS zoom)
- Use `clamp()` for fluid typography
- Stack layouts vertically on mobile
- Reduce Starfield stars on mobile for performance

## UI/UX Standards

- **iOS-like clean design** - Minimal, elegant, native-feeling
- **NO EMOJIS** - Never use emojis in UI, copy, or code comments
- San Francisco-inspired spacing and typography rhythm
- Subtle animations, not flashy
- High contrast for accessibility
- Generous whitespace
- Clear visual hierarchy

## Code Review Standards

Before merging any code, verify:

### TypeScript
- No `any` types - use proper interfaces
- All functions have return types
- No unused variables or imports
- Consistent naming (camelCase for vars, PascalCase for components)

### React/Next.js
- Components are in separate files
- Props have TypeScript interfaces
- No inline styles (use Tailwind)
- Keys on list items
- No console.log in production code

### Security
- No secrets in code (use env vars)
- API keys only accessed server-side
- User input validated before use
- No SQL injection risks (use parameterized queries)

### Performance
- Images optimized (use next/image)
- No unnecessary re-renders
- Large dependencies imported dynamically
- Animations use transform/opacity (GPU accelerated)

### Accessibility
- Semantic HTML elements
- Alt text on images
- Keyboard navigable
- Color contrast meets WCAG AA

### Style
- No emojis anywhere
- Consistent formatting (Prettier)
- Meaningful commit messages
- Comments explain "why" not "what"

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
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

## Error Handling

- 30s timeout per AI model
- Minimum 3 successful responses required
- If synthesis fails, return longest response as fallback
- Show user which models responded
