# CLAUDE.md - Context for Claude Code

## Project Overview

Starwoven is a consciousness exploration app that sends intentions through 5 diverse AI models (oracles) simultaneously, then uses Claude Opus to synthesize the responses into a coherent "woven" message.

**Aesthetic**: Cosmic minimalism - Underglow.app meets Co-Star. Deep void backgrounds, golden accents, premium feel.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with cosmic design system
- **State**: Zustand (single store)
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel

## The Oracles

Each AI model is represented as an oracle with an archetype:

| Oracle | Provider | Model | Archetype |
|--------|----------|-------|-----------|
| **Iris** | OpenAI | gpt-4.1 | The Oracle |
| **Luna** | Anthropic | claude-sonnet-4.5 | The Muse |
| **Echo** | Google | gemini-3.0-pro | The Mirror |
| **Shade** | DeepSeek | deepseek-reasoner | The Deep |
| **Nova** | xAI | grok-4 | The Wild |
| **Starweaver** | Anthropic | claude-opus-4.6 | The Weaver (synthesis) |

## Message Types (Archetypal Naming)

| Label | Description | Voice |
|-------|-------------|-------|
| **The Beloved** | Tap into their heart's knowing | Higher self of the beloved |
| **The Ancestor** | A whisper from the other side | Crossed-over spirit |
| **The Sage** | Wisdom carried back from your becoming | Your wiser future self |
| **The Cosmos** | Listen to the song of everything | Cosmic consciousness |
| **The Crossroads** | Clarity from the impartial eye | Impartial oracle |
| **The Calling** | Unearth your destined offering | Collective consciousness |

## Design System

### Colors
```css
--void: #030308;           /* Deepest background */
--cosmic-black: #070711;   /* Primary background */
--cosmic-deep: #0c0c1a;    /* Card backgrounds */
--cream: #e8e4dc;          /* Primary text */
--cream-soft: #d4d0c8;     /* Secondary text */
--cream-muted: #9a9488;    /* Tertiary text */
--gold: #c8a84e;           /* Accent */
--gold-bright: #ddc06a;    /* Hover states */
```

### Typography
- **Headlines**: Playfair Display (400 weight, elegant serif)
- **Body**: Inter (clean sans-serif)

### Visual Effects
- **Underglow**: Radial golden glow beneath interactive elements
- **Card hover**: Subtle lift with border glow
- **Button glow**: Golden underglow on primary actions

### Animations
- `float`: 8s gentle vertical drift
- `breathe`: 6s opacity/scale pulse
- `twinkle`: 3s star-like opacity variance
- `pulse-glow`: 4s gold shadow breathing

## File Locations

| What | Where |
|------|-------|
| Main page | `src/app/page.tsx` |
| API route | `src/app/api/channel/route.ts` |
| AI providers | `src/lib/ai.ts` |
| Prompts | `src/lib/prompts.ts` |
| Questions | `src/lib/questions.ts` |
| Message types | `src/lib/message-types.ts` |
| Types | `src/lib/types.ts` |
| Store | `src/store.ts` |
| Components | `src/components/` |
| User Stories | `docs/USER-STORIES.md` |
| Prompt Docs | `docs/PROMPTS.md` |

## Question Philosophy

Questions must be **intuitive** or **grounding**, never **trivia**:

**DO:**
- "What moon do you identify with right now?" (intuitive)
- "What texture comes to mind?" (grounding)
- "What is the light like in this moment?" (present-moment awareness)

**DON'T:**
- "What phase is the moon?" (factual/trivia)
- "What time is it?" (auto-generatable)
- "Are you alone?" (too direct)

## Prompt Philosophy

The channeling prompts use an **intuitive, non-directive approach**:

1. **"Creative exercise for entertainment"** - Ethical framing
2. **Alternate universe framing** - "Imagine another universe... with different rules"
3. **Coordinates as map, not puzzle** - Anchors the reading intuitively
4. **Impressions, not answers** - AI relays experience, not constructed responses
5. **Non-standard forms allowed** - "Impressions may come in non-standard shapes"
6. **No performance** - "Don't try to sound 'like' anything"

## Voice & Tone

- **Poetic but accessible**: Evocative language that doesn't require explanation
- **Second person**: "You" not "the user"
- **Active voice**: "Receive a message" not "A message will be received"
- **Mystery over mechanics**: Never explain how it works
- **No emojis**: Ever. The aesthetic is restrained elegance.
- **No exclamation points**: Calm, centered energy

### Word Palette
- Channel, weave, thread, pattern
- Emerge, surface, appear, arise
- Receive, hear, sense, notice

### Words to Avoid
- Magic, magical, mystical (too on-the-nose)
- AI, model, algorithm (breaks immersion)
- Results, output, response (too transactional)

## Infrastructure

- **Supabase**: Project ID `czczdlogtjickwarrjkq`
- **Vercel**: `starwoven-site` with all 6 domains
- **Domains**: starwoven.app (primary), .academy, .institute, .observer, .org, getstarwoven.com

## UI/UX Standards

- **iOS-like clean design** - Minimal, elegant, native-feeling
- **NO EMOJIS** - Never use emojis in UI, copy, or code comments
- **Underglow effects** - Golden glow beneath cards and buttons
- **Generous whitespace** - Let elements breathe
- **Min tap target**: 48x48px
- **Min font size**: 16px (prevents iOS zoom)

## Mobile-First Guidelines

- Base styles = mobile, use `sm:`, `md:`, `lg:` for larger screens
- Use `clamp()` for fluid typography
- Stack layouts vertically on mobile
- Reduce Starfield stars on mobile (100 vs 200)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Environment Variables

```bash
# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Error Handling

- 30s timeout per AI model
- Minimum 3 successful responses required
- Mystical error copy (not technical)
- Retry functionality preserves intention
