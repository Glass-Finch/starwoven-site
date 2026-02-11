# CLAUDE.md - Context for Claude Code

## CRITICAL RULES

**NEVER COMMIT WITHOUT EXPLICIT USER APPROVAL.** Always ask before committing any changes.

**ASK FIRST RATHER THAN FIX LATER.** When in doubt about intent, approach, or scope, ask a clarifying question rather than making assumptions. It is always easier to ask than to undo.

**NO TECH DEBT.** If a feature needs persistence, logging, error handling, or integration, implement it now. Do not defer work to "v2," create placeholder TODOs, or spin up new GitHub issues to pass work down the line. If a piece of infrastructure is required for the feature to be complete, it is part of the feature. Build it now.

---

## Project Overview

Starwoven is a consciousness exploration app that sends intentions through 5 AI oracles simultaneously, then uses Claude Opus to synthesize the responses into a coherent message. Aesthetic: cosmic minimalism (Underglow.app meets Co-Star).

## Related Documentation

| Document               | What it covers                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`            | Project overview, tech stack, design system (colors, typography, animations), env vars, project structure, API architecture, domains, roadmap |
| `docs/PROMPTS.md`      | Full prompt templates (channeling, synthesis, review), personalization context per type, coherence rubric, review layer docs                  |
| `docs/USER-STORIES.md` | Detailed user stories per message type, voice/tone guide with register examples, QA layer specs                                               |
| `docs/COMPLIANCE.md`   | AI provider terms audit, per-provider compliance status, data training risks, disclosure requirements                                         |
| `docs/COSTS.md`        | Per-reading cost estimates, provider pricing table, token budgets, cost-at-scale projections                                                  |

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Unit + smoke tests (vitest)
```

## File Locations

| What                | Where                          |
| ------------------- | ------------------------------ |
| Main page           | `src/app/page.tsx`             |
| About page          | `src/app/about/page.tsx`       |
| Research page       | `src/app/research/page.tsx`    |
| API route           | `src/app/api/channel/route.ts` |
| AI providers        | `src/lib/ai.ts`                |
| Prompts             | `src/lib/prompts.ts`           |
| QA layer            | `src/lib/qa.ts`                |
| Moderation          | `src/lib/moderation.ts`        |
| Questions           | `src/lib/questions.ts`         |
| Message types       | `src/lib/message-types.ts`     |
| Types               | `src/lib/types.ts`             |
| Constants           | `src/lib/constants.ts`         |
| Errors              | `src/lib/errors.ts`            |
| Cost tracking       | `src/lib/cost.ts`              |
| Supabase            | `src/lib/supabase.ts`          |
| Store               | `src/store.ts`                 |
| Components          | `src/components/`              |
| Coordinate mappings | `docs/COORDINATE-MAPPINGS.md`  |

## Code Standards

### Keep It Lean

- **No dead code.** If code is unused, delete it. Never mark something deprecated and leave it around.
- **No bloat.** Remove unnecessary abstractions, redundant helpers, and over-engineered patterns whenever you see them.
- **Comments only where they earn their place.** Explain _why_, not _what_. Don't annotate obvious code. A comment that restates what the next line does is noise.
- **No static-only tests.** Tests must exercise logic, not verify that constants exist or strings match.

### Single Source of Truth

Each domain concept should have ONE authoritative location:

| Concept       | Source File                | Exports                        |
| ------------- | -------------------------- | ------------------------------ |
| AI Model IDs  | `src/lib/types.ts`         | `AIModel` type                 |
| Oracle Info   | `src/lib/ai.ts`            | `ORACLE_INFO` (names, colors)  |
| Message Types | `src/lib/message-types.ts` | `MESSAGE_TYPES`, `MessageType` |
| Prompts       | `src/lib/prompts.ts`       | Prompt builder functions       |
| Questions     | `src/lib/questions.ts`     | Coordinate questions           |

When updating configuration (e.g., model versions), update the source file and let TypeScript catch any downstream issues.

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

## Design System

**Aesthetic**: Underglow-inspired cosmic minimalism. Deep void backgrounds, golden accents, premium feel.

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

- **Headlines**: Playfair Display (elegant serif, 400 weight)
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

## Error Handling

- 30s timeout per AI model
- Minimum 3 successful responses required
- In-character error copy (not technical)
- Retry functionality preserves intention
- Retry button with contextual tips on how to reframe intention

## Development Workflow

### Minimize API Costs During Development

Each full reading costs ~$0.24 in API calls. Avoid unnecessary full runs:

- **Coordinate changes**: Verify with unit tests (`npm test`), not full readings. Coordinates are pure functions.
- **UI changes**: Use the browser dev server — no API calls needed until the channeling step.
- **Prompt changes**: Use the integration test script (`npx tsx scripts/integration-test.ts`) for targeted provider testing.
- **Only run full readings** when testing end-to-end flow, API integration, or synthesis quality.

### Run Tests After the Work Is Done

Do not run `lint`, `tsc`, `test`, or `build` after every small edit. Run the full check suite **once, when the task is complete**. This is especially important for integration tests that cost real money. Intermediate checks during iterative text/copy/UI changes are wasteful.

### Before Committing

1. **Manual Testing Required**: Test all changed functionality in the browser
2. **Code Review**: Show changes to user for review before committing
3. **Automated Checks**: Run `npm run lint && npx tsc --noEmit && npm test && npm run build`
4. **Pre-commit hooks** run lint-staged + tsc --noEmit automatically on commit

### GitHub Issues

Do not create new issues for work that belongs in an existing issue. Edit the existing issue or reopen a closed one. Especially if the work hasn't been committed yet, it's all the same batch — fold it into the current issue. Only create a new issue when the work is genuinely separate and unrelated.

### One-Time Scripts

Put throwaway scripts in `scripts/scratch/` — this directory is gitignored. The committed `scripts/` directory is for reusable tooling only.

### Commit Process

1. Stage specific files (avoid `git add -A` for large changes)
2. Show diff to user for approval
3. Create commit only after explicit user approval
4. Do NOT push without explicit user approval

## Testing

### Unit Tests (vitest)

Run with `npm test`. Tests live in `src/**/__tests__/*.test.ts`.

| Test File                       | What it covers                                                        |
| ------------------------------- | --------------------------------------------------------------------- |
| `prompts.test.ts`               | Channeling, synthesis, and analysis prompt builders                   |
| `errors.test.ts`                | classifyError logic (rate_limit, timeout, network, server, unknown)   |
| `moderation.test.ts`            | buildModerationPrompt structure, fail-open behavior                   |
| `qa.test.ts`                    | cleanupResponse regex transforms, calculateCoherenceScore weights     |
| `questions.test.ts`             | selectQuestions, generateCoordinateString, generateAnswerSegments     |
| `message-types.test.ts`         | getMessageTypeConfig lookup, invalid type handling, label pattern     |
| `route.test.ts`                 | API route input validation (smoke tests, no AI calls)                 |
| `customCoordinateInput.test.ts` | stripToDigits, formatCoordinate pure functions                        |
| `cost.test.ts`                  | logReadingCost aggregation, rounding, per-model breakdown, edge cases |

### Integration Tests

Run manually before releases (requires all API keys in `.env`):

```bash
npx tsx scripts/integration-test.ts
```

Tests each of the 5 AI providers, Sonnet analysis (JSON structure), and Opus synthesis. Costs real money per run.

### Pre-commit Hooks

Husky runs on every commit:

1. `lint-staged` — ESLint + Prettier on staged files
2. `tsc --noEmit` — Full project type check

### CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main/dev and PRs:

1. `npm run lint`
2. `npm run format:check`
3. `npx tsc --noEmit`
4. `npm test` (unit + smoke tests)
5. `npm run build`

## Code Review Checklist

### Source of Truth Checks

- [ ] No duplicated constants, types, or config across files
- [ ] New constants added to their canonical source file (`constants.ts`, `types.ts`, etc.)
- [ ] Oracle names/models/archetypes reference `ORACLE_INFO` in `ai.ts`, never hardcoded
- [ ] Message type config references `message-types.ts`, never inline
- [ ] Error messages and user-facing strings reference constants, not inline literals

### Code Quality

- [ ] No hardcoded strings or config values (use constants/env vars)
- [ ] No unused variables, imports, or dead code
- [ ] No inline CSS (use Tailwind classes or globals.css component classes)
- [ ] No duplicated logic (DRY — reuse existing utilities)
- [ ] No magic numbers (extract to named constants)
- [ ] Re-using existing classes and components where possible
- [ ] Maintainable and readable — no over-engineering or premature abstraction
- [ ] No scope creep beyond what the GH issue requires

### Test Coverage

- [ ] Tests cover new pure functions and edge cases
- [ ] No tests using mocks when real code is available
- [ ] Tests can actually fail (not always-green assertions)
- [ ] No tests being skipped or allowed to fail silently
- [ ] Edge cases accounted for (empty inputs, boundary values, invalid data)

### Accessibility & UX

- [ ] Labels linked to inputs (`htmlFor`/`id`)
- [ ] ARIA attributes on interactive elements (`aria-expanded`, `aria-describedby`, etc.)
- [ ] Error states don't overlap other UI states
- [ ] Mobile-first responsive design verified
- [ ] Min tap target 48x48px, min font size 16px
- [ ] Validation errors linked to inputs via `aria-describedby`

### Security

- [ ] No API keys or secrets exposed in error messages or client code
- [ ] User inputs validated at system boundaries (type, length, structure)
- [ ] JSON parsed from external sources validated before use
- [ ] No unescaped user input in dangerous contexts

### Standards

- [ ] No `console.log` in production code (`console.warn`/`error` OK for genuine issues)
- [ ] Documentation updated if behavior changes (CLAUDE.md, README.md, PROMPTS.md)
- [ ] Voice/tone follows project guidelines (no emojis, no exclamation points, no New Age cliches)
- [ ] GH issues, CLAUDE.md, and README.md updated or created as needed

---

## The Oracles

**Single Source of Truth**: `src/lib/ai.ts` defines `ORACLE_INFO` with model names, archetypes, and colors. All model IDs are defined in `src/lib/types.ts` as the `AIModel` type. When updating model versions, update both files.

| Oracle         | Provider  | Model                   | Archetype              |
| -------------- | --------- | ----------------------- | ---------------------- |
| **Iris**       | OpenAI    | gpt-4.1                 | The Oracle             |
| **Luna**       | Anthropic | claude-sonnet-4.5       | The Muse               |
| **Echo**       | Google    | gemini-3-pro-preview    | The Mirror             |
| **Shade**      | DeepSeek  | deepseek-reasoner       | The Deep               |
| **Nova**       | xAI       | grok-4-1-fast-reasoning | The Wild               |
| **Starweaver** | Anthropic | claude-opus-4.6         | The Weaver (synthesis) |

### Latest Model Versions by Provider

When choosing models for new features or scripts, use the latest available versions:

| Provider  | Latest Model ID           | Notes                                                                                                    |
| --------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| OpenAI    | `gpt-4.1`                 | Use for general tasks                                                                                    |
| Anthropic | `claude-opus-4.6`         | Most capable; use `claude-sonnet-4.5` for cost-sensitive tasks, `claude-haiku-4.5` for lightweight tasks |
| Google    | `gemini-3-pro-preview`    | Used consistently as internal key and API model ID                                                       |
| DeepSeek  | `deepseek-reasoner`       | Reasoning model                                                                                          |
| xAI       | `grok-4-1-fast-reasoning` | Fast reasoning variant                                                                                   |

## Message Types

| Type               | Card Description                            | User Inputs                         | Intention Prompt                             |
| ------------------ | ------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| **The Beloved**    | Ask about a romantic connection             | Your name, Their name               | What do you want to know?                    |
| **The Ancestor**   | Seek connection with someone who has passed | Your name, Their name, Relationship | What do you want to ask or tell them?        |
| **The Sage**       | Ask your future self for advice             | Your name, Birthday                 | What do you need advice on?                  |
| **The Cosmos**     | Seek insight on what's on your mind         | (none)                              | What's on your mind?                         |
| **The Crossroads** | Get clarity on a yes or no decision         | (none)                              | What decision do you need help with?         |
| **The Calling**    | Explore your purpose                        | Your name, Birthday                 | What do you want to know about your purpose? |

## Copy Generation

**All user-facing copy is written by Gemini 3 Pro Preview, not Claude.** Claude builds scaffolding, components, and API calls. Gemini writes the words users read.

**Claude must never direct Gemini's creative output.** The Gemini prompt should include project context (voice guide, what the app does, audience) and the user's specs (their direction, their preferences). Claude must not inject its own editorial opinions, tell Gemini what content to keep, suggest phrasing, or steer the creative direction. Pass through the user's intent, not your own.

Workflow:

1. Prepare context: relevant sections of README, USER-STORIES.md, existing pages, voice guide
2. Write a Gemini API call script (e.g., `scripts/generate-*-copy.ts`) with the user's direction and project context
3. Call `gemini-3-pro-preview` via the Google Generative AI API
4. Apply the Gemini output to the page, fixing only mechanical issues (banned words, formatting)
5. Delete the temp script after use

The API key is `GOOGLE_API_KEY` in `.env`. Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent`

## Voice & Tone

See `docs/USER-STORIES.md` for the full voice guide with register examples.

- **Understated confidence**: Don't try to convince. Present the experience.
- **Precision over poetry**: When in doubt, be clear. Ornate language signals insecurity.
- **Mystery through restraint**: The less you explain, the more space for meaning.
- **No emojis**: Ever.
- **No exclamation points**: Calm, centered energy.
- **Avoid New Age cliches**: If it sounds like a yoga studio, rewrite it.

### Writing Style

- No em dashes everywhere. Use commas, periods, or semicolons instead.
- No staccato sentence fragments. Write flowing, natural prose.
- No AI-sounding writing patterns (overuse of "Furthermore," "Moreover," "It's worth noting," "Importantly").
- Copy should read like a human wrote it, not like it was generated.

### Words to Avoid

- Magic, magical, mystical, spiritual (too on-the-nose)
- Weave, woven (sounds like hair products)
- AI, model, algorithm, minds (breaks immersion, except in "how it works" context)
- Journey, path, threshold (overused)
- Vibration, energy, frequency (New Age cliche)
- Results, output, response (too transactional)
- Amazing, wonderful, beautiful (too enthusiastic)

## Cost Tracking

### API Calls Per Reading

| Stage      | Calls      | Model           | Purpose                          |
| ---------- | ---------- | --------------- | -------------------------------- |
| Moderation | 1          | Claude Haiku    | Screen intention for safety      |
| Channeling | 5 parallel | Various oracles | Get impressions                  |
| Review     | 1          | Claude Sonnet   | Validation + editing + coherence |
| Synthesis  | 1          | Claude Opus     | Synthesize final message         |

**Total: 8 API calls per successful reading** (1 moderation + 5 channeling + 1 review + 1 synthesis)

Moderation runs before channeling. If it rejects, the 7 downstream calls are skipped (cost savings). Moderation fails open — if unavailable, requests proceed.

The review step is a single Sonnet call that validates each response (refusal/off-topic detection), edits valid responses (removes markdown, disclaimers, AI self-references), and scores coherence across all responses. Falls back to regex cleanup if the Sonnet call fails.

### Cost Persistence

Token usage is captured from all providers and logged as structured JSON via `console.info` with a `[cost]` prefix. Cost data is persisted to:

1. **Reading metadata** — `cost` field in the readings table `metadata` JSONB column
2. **Dedicated `cost_tracking` table** — per-stage token counts, per-model breakdown, total cost (see `supabase/migrations/003_cost_tracking.sql`)

Both writes are fire-and-forget from the API route. See `docs/COSTS.md` for pricing and projections.

## Infrastructure

- **Supabase**: Project ID `czczdlogtjickwarrjkq`
- **Vercel**: `starwoven-site`
- **Domains**: See README.md for full list

### Supabase Migrations

Migration files live in `supabase/migrations/`. To run migrations against the remote database:

```bash
# Link project (one-time, or after fresh clone)
supabase link --project-ref czczdlogtjickwarrjkq

# Check migration status
supabase migration list

# Push pending migrations to remote
supabase db push

# If older migrations were applied manually (via SQL Editor) and aren't tracked,
# mark them as applied before pushing new ones:
supabase migration repair --status applied 001 002 003
```

Requires `SUPABASE_ACCESS_TOKEN` in `.env` (for Management API auth) and the Supabase CLI (`brew install supabase`).

## Manual Testing Procedures

### Testing with Real Data

**CRITICAL**: Always test with real people and genuine intentions.

- **Use real names** (first names only): e.g., "Sarah", "Max"
- **Never use**: Made-up names, placeholder text, celebrities, or full names
- **Set your own intention**: The tester must genuinely engage with the question
- **Why**: AI models detect nonsense inputs and return generic responses. Coherence scoring only works with authentic data.

**Test data is stored in `.env`** (variables starting with `TEST_`):

| Variable                     | Used By       | Example     |
| ---------------------------- | ------------- | ----------- |
| `TEST_SEEKER_NAME`           | All types     | Sarah       |
| `TEST_SEEKER_BIRTHDAY`       | Sage, Calling | 1986-09-23  |
| `TEST_BELOVED_NAME`          | Beloved       | Max         |
| `TEST_ANCESTOR_NAME`         | Ancestor      | Fred        |
| `TEST_ANCESTOR_RELATIONSHIP` | Ancestor      | grandfather |

### Full Journey Test

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Complete full flow:
   - Select a message type
   - Fill personalization form with **real first names** (if applicable)
   - Answer all coordinate questions **intuitively** (don't rush)
   - Enter a **genuine intention** you actually want insight on
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
