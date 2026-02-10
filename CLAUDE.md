# CLAUDE.md - Context for Claude Code

## CRITICAL RULES

**NEVER COMMIT WITHOUT EXPLICIT USER APPROVAL.** Always ask before committing any changes.

**ASK FIRST RATHER THAN FIX LATER.** When in doubt about intent, approach, or scope, ask a clarifying question rather than making assumptions. It is always easier to ask than to undo.

---

## Project Overview

Starwoven is a consciousness exploration app that sends intentions through 5 AI oracles simultaneously, then uses Claude Opus to synthesize the responses into a coherent message. Aesthetic: cosmic minimalism (Underglow.app meets Co-Star).

## Related Documentation

| Document               | What it covers                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`            | Project overview, tech stack, design system (colors, typography, animations), env vars, project structure, API architecture, domains, roadmap |
| `docs/PROMPTS.md`      | Full prompt templates (channeling, synthesis, analysis), personalization context per type, coherence rubric, analysis layer docs              |
| `docs/USER-STORIES.md` | Detailed user stories per message type, voice/tone guide with register examples, QA layer specs                                               |

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Unit + smoke tests (vitest)
```

## File Locations

| What          | Where                          |
| ------------- | ------------------------------ |
| Main page     | `src/app/page.tsx`             |
| API route     | `src/app/api/channel/route.ts` |
| AI providers  | `src/lib/ai.ts`                |
| Prompts       | `src/lib/prompts.ts`           |
| QA layer      | `src/lib/qa.ts`                |
| Questions     | `src/lib/questions.ts`         |
| Message types | `src/lib/message-types.ts`     |
| Types         | `src/lib/types.ts`             |
| Constants     | `src/lib/constants.ts`         |
| Errors        | `src/lib/errors.ts`            |
| Store         | `src/store.ts`                 |
| Components    | `src/components/`              |

## Code Standards

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

### Before Committing

1. **Manual Testing Required**: Test all changed functionality in the browser
2. **Code Review**: Show changes to user for review before committing
3. **Automated Checks**: Run `npm run lint && npx tsc --noEmit && npm test && npm run build`
4. **Pre-commit hooks** run lint-staged + tsc --noEmit automatically on commit

### Commit Process

1. Stage specific files (avoid `git add -A` for large changes)
2. Show diff to user for approval
3. Create commit only after explicit user approval
4. Do NOT push without explicit user approval

## Testing

### Unit Tests (vitest)

Run with `npm test`. Tests live in `src/**/__tests__/*.test.ts`.

| Test File               | What it covers                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| `prompts.test.ts`       | Channeling, synthesis, and analysis prompt builders                 |
| `errors.test.ts`        | classifyError, ERROR_MESSAGES, ERROR_TIPS                           |
| `qa.test.ts`            | cleanupResponse, getOracleErrorMessage, calculateCoherenceScore     |
| `questions.test.ts`     | selectQuestions, generateCoordinateString                           |
| `message-types.test.ts` | getMessageTypeConfig for all 6 types, field counts, required fields |
| `route.test.ts`         | API route input validation (smoke tests, no AI calls)               |

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

### Single Source of Truth

- [ ] No duplicated constants, types, or config across files
- [ ] New constants added to their canonical source file
- [ ] Oracle names/models/archetypes reference `ORACLE_INFO` in `ai.ts`, never hardcoded
- [ ] Message type config references `message-types.ts`, never inline

### Code Quality

- [ ] No hardcoded strings or config values (use constants/env vars)
- [ ] No unused variables or imports
- [ ] No inline CSS (use Tailwind classes or globals.css component classes)
- [ ] No duplicated logic (DRY - reuse existing utilities)
- [ ] No magic numbers (extract to named constants)

### Testing

- [ ] Tests cover new pure functions and edge cases
- [ ] No tests using mocks when real code is available
- [ ] Tests can actually fail (not always-green assertions)

### Accessibility & UX

- [ ] Labels linked to inputs (`htmlFor`/`id`)
- [ ] ARIA attributes on interactive elements (`aria-expanded`, etc.)
- [ ] Error states don't overlap other UI states
- [ ] Mobile-first responsive design verified

### Standards

- [ ] No `console.log` in production code (`console.warn`/`error` OK for genuine issues)
- [ ] API inputs validated (type, length, structure)
- [ ] Documentation updated if behavior changes (CLAUDE.md, README.md, PROMPTS.md)
- [ ] Voice/tone follows project guidelines (no emojis, no exclamation points, no New Age cliches)

---

## The Oracles

**Single Source of Truth**: `src/lib/ai.ts` defines `ORACLE_INFO` with model names, archetypes, and colors. All model IDs are defined in `src/lib/types.ts` as the `AIModel` type. When updating model versions, update both files.

| Oracle         | Provider  | Model                   | Archetype              |
| -------------- | --------- | ----------------------- | ---------------------- |
| **Iris**       | OpenAI    | gpt-4.1                 | The Oracle             |
| **Luna**       | Anthropic | claude-sonnet-4.5       | The Muse               |
| **Echo**       | Google    | gemini-3.0-pro          | The Mirror             |
| **Shade**      | DeepSeek  | deepseek-reasoner       | The Deep               |
| **Nova**       | xAI       | grok-4-1-fast-reasoning | The Wild               |
| **Starweaver** | Anthropic | claude-opus-4.6         | The Weaver (synthesis) |

## Message Types

| Type               | Card Description                            | User Inputs                         | Intention Prompt                             |
| ------------------ | ------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| **The Beloved**    | Ask about a romantic connection             | Your name, Their name               | What do you want to know?                    |
| **The Ancestor**   | Seek connection with someone who has passed | Your name, Their name, Relationship | What do you want to ask or tell them?        |
| **The Sage**       | Ask your future self for advice             | Your name, Birthday                 | What do you need advice on?                  |
| **The Cosmos**     | Seek insight on what's on your mind         | (none)                              | What's on your mind?                         |
| **The Crossroads** | Get clarity on a yes or no decision         | (none)                              | What decision do you need help with?         |
| **The Calling**    | Explore your purpose                        | Your name, Birthday                 | What do you want to know about your purpose? |

## Voice & Tone

See `docs/USER-STORIES.md` for the full voice guide with register examples.

- **Understated confidence**: Don't try to convince. Present the experience.
- **Precision over poetry**: When in doubt, be clear. Ornate language signals insecurity.
- **Mystery through restraint**: The less you explain, the more space for meaning.
- **No emojis**: Ever.
- **No exclamation points**: Calm, centered energy.
- **Avoid New Age cliches**: If it sounds like a yoga studio, rewrite it.

### Words to Avoid

- Magic, magical, mystical, spiritual (too on-the-nose)
- Weave, woven (sounds like hair products)
- AI, model, algorithm, minds (breaks immersion)
- Journey, path, threshold (overused)
- Vibration, energy, frequency (New Age cliche)
- Results, output, response (too transactional)
- Amazing, wonderful, beautiful (too enthusiastic)

## Cost Tracking

### API Calls Per Reading

| Stage      | Calls      | Model           | Purpose                          |
| ---------- | ---------- | --------------- | -------------------------------- |
| Channeling | 5 parallel | Various oracles | Get impressions                  |
| Analysis   | 1          | Claude Sonnet   | Validation + editing + coherence |
| Synthesis  | 1          | Claude Opus     | Weave final message              |

**Total: 7 API calls per successful reading** (5 channeling + 1 analysis + 1 synthesis)

The analysis step is a single Sonnet call that validates each response (refusal/off-topic detection), edits valid responses (removes markdown, disclaimers, AI self-references), and scores coherence across all responses. Falls back to regex cleanup if the Sonnet call fails.

### Cost Logging (v1)

Token logging not yet implemented. Currently logging coherence scores to console. Future versions will add:

- v1 (GH#40): Token usage logging per API call
- v2: Backend dashboard with admin endpoint
- v3: User-visible credits for monetization

## Infrastructure

- **Supabase**: Project ID `czczdlogtjickwarrjkq`
- **Vercel**: `starwoven-site`
- **Domains**: See README.md for full list

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
2. Open http://localhost:3000
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
