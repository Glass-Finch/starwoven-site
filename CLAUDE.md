# CLAUDE.md - Context for Claude Code

## CRITICAL RULES

**NEVER COMMIT WITHOUT EXPLICIT USER APPROVAL.** Always ask before committing any changes.

---

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

| Oracle         | Provider  | Model             | Archetype              |
| -------------- | --------- | ----------------- | ---------------------- |
| **Iris**       | OpenAI    | gpt-4.1           | The Oracle             |
| **Luna**       | Anthropic | claude-sonnet-4.5 | The Muse               |
| **Echo**       | Google    | gemini-3.0-pro    | The Mirror             |
| **Shade**      | DeepSeek  | deepseek-reasoner | The Deep               |
| **Nova**       | xAI       | grok-4            | The Wild               |
| **Starweaver** | Anthropic | claude-opus-4.6   | The Weaver (synthesis) |

## Message Types

Think of this as a sophisticated, working magic 8-ball.

| Type               | Card Description                            | User Inputs                         | Intention Prompt                             |
| ------------------ | ------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| **The Beloved**    | Ask about a romantic connection             | Your name, Their name               | What do you want to know?                    |
| **The Ancestor**   | Seek connection with someone who has passed | Your name, Their name, Relationship | What do you want to ask or tell them?        |
| **The Sage**       | Ask your future self for advice             | Your name, Birthday                 | What do you need advice on?                  |
| **The Cosmos**     | Seek insight on what's on your mind         | (none)                              | What's on your mind?                         |
| **The Crossroads** | Get clarity on a yes or no decision         | (none)                              | What decision do you need help with?         |
| **The Calling**    | Explore your purpose                        | Your name, Birthday                 | What do you want to know about your purpose? |

See `docs/USER-STORIES.md` for full user stories per message type.
See GitHub issue #18 for implementation details.

## Design System

### Colors

```css
--void: #030308; /* Deepest background */
--cosmic-black: #070711; /* Primary background */
--cosmic-deep: #0c0c1a; /* Card backgrounds */
--cream: #e8e4dc; /* Primary text */
--cream-soft: #d4d0c8; /* Secondary text */
--cream-muted: #9a9488; /* Tertiary text */
--gold: #c8a84e; /* Accent */
--gold-bright: #ddc06a; /* Hover states */
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

| What          | Where                          |
| ------------- | ------------------------------ |
| Main page     | `src/app/page.tsx`             |
| API route     | `src/app/api/channel/route.ts` |
| AI providers  | `src/lib/ai.ts`                |
| Prompts       | `src/lib/prompts.ts`           |
| Questions     | `src/lib/questions.ts`         |
| Message types | `src/lib/message-types.ts`     |
| Types         | `src/lib/types.ts`             |
| Store         | `src/store.ts`                 |
| Components    | `src/components/`              |
| User Stories  | `docs/USER-STORIES.md`         |
| Prompt Docs   | `docs/PROMPTS.md`              |

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

- **Understated confidence**: Don't try to convince. Present the experience.
- **Precision over poetry**: When in doubt, be clear. Ornate language signals insecurity.
- **Mystery through restraint**: The less you explain, the more space for meaning.
- **No emojis**: Ever.
- **No exclamation points**: Calm, centered energy.
- **Avoid New Age clichés**: If it sounds like a yoga studio, rewrite it.

### Words to Avoid

- Magic, magical, mystical, spiritual (too on-the-nose)
- Weave, woven (sounds like hair products)
- AI, model, algorithm, minds (breaks immersion)
- Journey, path, threshold (overused)
- Vibration, energy, frequency (New Age cliché)
- Results, output, response (too transactional)
- Amazing, wonderful, beautiful (too enthusiastic)

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

## Naming Conventions

### Message Type IDs

Use the short archetypal names as IDs:

- `beloved` (not `love_interest`)
- `ancestor` (not `deceased_loved_one`)
- `sage` (not `future_self`)
- `cosmos` (not `universe_general`)
- `crossroads` (not `life_decision`)
- `calling` (not `purpose_world`)

### Variable Naming

- **TypeScript**: `camelCase` for variables/functions, `PascalCase` for types/interfaces
- **CSS/Tailwind**: `kebab-case` for custom classes
- **Files**: `PascalCase` for components, `camelCase` for utilities
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants

### Display Names vs IDs

- ID: `beloved` (used in code, URLs, database)
- Label: "The Beloved" (used in UI)
- Description: "Ask about a romantic connection" (card subtitle)

## Error Handling

- 30s timeout per AI model
- Minimum 3 successful responses required
- Mystical error copy (not technical)
- Retry functionality preserves intention

## Development Workflow

### Before Committing

1. **Manual Testing Required**: Test all changed functionality in the browser
2. **Code Review**: Show changes to user for review before committing
3. **Automated Checks**: Run `npm run lint && npm run build && npm test`

### Commit Process

1. Stage specific files (avoid `git add -A` for large changes)
2. Show diff to user for approval
3. Create commit only after explicit user approval
4. Do NOT push without explicit user approval

### Manual Testing Checklist

Before any commit affecting user-facing features:

- [ ] Start dev server: `npm run dev`
- [ ] Test the changed feature end-to-end in browser
- [ ] Test on mobile viewport (use browser dev tools)
- [ ] Check browser console for errors
- [ ] Verify API calls work (Network tab)
- [ ] Test error states if applicable

## Manual Testing Procedures

### Full Journey Test

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Complete full flow:
   - Select a message type
   - Fill personalization form (if applicable)
   - Answer all coordinate questions
   - Enter an intention
   - Wait for channeling to complete
   - View synthesized message
   - Expand threads accordion
   - Expand coordinates reveal
   - Click "Begin anew"

### API Testing

1. Check Network tab during channeling
2. Verify POST to /api/channel
3. Confirm all 5 model responses in response
4. Confirm synthesis is present
5. Check for validation results

### Error State Testing

1. Disconnect network during channeling
2. Verify error UI appears
3. Verify "Try again" works
4. Verify "Begin anew" resets state

### Mobile Testing

1. Use browser dev tools responsive mode
2. Test at 375px width (iPhone SE)
3. Verify single-column layout
4. Verify touch interactions work
5. Verify keyboard doesn't obscure inputs
