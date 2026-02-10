# Starwoven

> A question, seen from many angles.

Starwoven is a consciousness exploration app. You set an intention, answer a few grounding questions, and receive a message synthesized from multiple perspectives.

## The Premise

Sometimes the most useful response isn't a single answer — it's a pattern that emerges when something is considered from multiple angles simultaneously.

Starwoven doesn't explain what it does. It presents an experience and lets you decide what it means. For some, it's a tool for reflection. For others, something stranger. The interface stays out of the way.

**Aesthetic**: Cosmic minimalism — deep void blacks, warm cream text, gold accents.

**Audience**: The spiritually curious, the practiced seeker, and the skeptic who's intrigued despite themselves.

---

## The Journey

1. **Choose your channel** — Select from six archetypes: The Beloved, The Ancestor, The Sage, The Cosmos, The Crossroads, The Calling
2. **Answer the coordinates** — Five rapid-fire questions anchor the reading to this specific moment
3. **Set your intention** — A brief, open-ended question (less detail invites more discovery)
4. **Watch the oracles** — Five models receive your query in parallel; the field fills as they respond
5. **Receive the message** — A synthesized response with optional access to individual threads

---

## Tech Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Framework  | Next.js 14+ (App Router)  |
| Language   | TypeScript                |
| Styling    | Tailwind CSS              |
| State      | Zustand                   |
| Database   | Supabase (Postgres + RLS) |
| Deployment | Vercel                    |

### AI Providers

**Channeling (5 diverse models):**
| Oracle | Provider | Model | Archetype |
|--------|----------|-------|-----------|
| Iris | OpenAI | GPT-4.1 | The Oracle |
| Luna | Anthropic | Claude Sonnet 4.5 | The Muse |
| Echo | Google | Gemini 3 Pro | The Mirror |
| Shade | DeepSeek | DeepSeek Reasoner | The Deep |
| Nova | xAI | Grok 4 | The Wild |

**Synthesis:**
| Oracle | Provider | Model | Archetype |
|--------|----------|-------|-----------|
| Starweaver | Anthropic | Claude Opus 4.6 | The Weaver |

---

## User Stories

**As a seeker**, I want to receive a message from a specific source (love interest's higher self, deceased loved one, future self, the universe) so that I can gain insight into my situation.

**As a seeker**, I want to answer intuitive questions that anchor my reading to this specific moment, so the message feels personal and timely.

**As a seeker**, I want to set an intention that guides what the message addresses, using open-ended language.

**As a seeker**, I want to watch the oracles channel my message, so the experience feels mystical and intentional.

**As a seeker**, I want to receive a synthesized woven message, with the option to see individual oracle threads.

---

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

---

## Message Types

Six channels, each with a distinct purpose:

| Label          | Description                                 | User Inputs                         |
| -------------- | ------------------------------------------- | ----------------------------------- |
| The Beloved    | Ask about a romantic connection             | Your name, their name               |
| The Ancestor   | Seek connection with someone who has passed | Your name, their name, relationship |
| The Sage       | Ask your future self for advice             | Your name, birthday                 |
| The Cosmos     | Seek insight on what's on your mind         | (intention only)                    |
| The Crossroads | Get clarity on a yes or no decision         | (intention only)                    |
| The Calling    | Explore your purpose                        | Your name, birthday                 |

All journeys include 5 coordinate questions (3 themed + 2 grounding).

---

## User Input Philosophy

**Minimize typing, maximize flow.** The journey should feel like answering a cosmic quiz, not filling out a form.

### Question Design Principles

- **Intuitive, not trivia**: Questions ask what resonates, not what's factually true
- **No obvious answers**: Every option should feel meaningful and personal
- **Present-moment grounding**: Anchor to felt sense, not facts (no "what time is it?")
- **Evocative language**: "What comes to mind?" / "What do you identify with?"

### Coordinate Questions (all multiple choice)

- **5 rapid-fire questions** generate unique coordinates
- **3 themed** (specific to message type) + **2 grounding** (present-moment awareness)
- **15% chance** one grounding swaps for a "weird" question
- Auto-advance on selection for seamless flow

### Intention Input

- **250 character limit** — brevity invites mystery
- **Guidance**: "The more open-ended, the better" / "Less detail invites more discovery"
- Open-ended questions receive richer, more intuitive responses

### Examples

**Themed**: "Which element speaks to the energy between you?" (Fire/Water/Earth/Air)
**Grounding**: "What sound is closest to you right now?" (Silence/Nature/Machine/Voice)
**Liminal**: "A number keeps appearing in your life. What is it?" (3/7/11/22)

The coordinates anchor the reading to this specific moment — a timestamp of attention, not data.

---

## Prompt Architecture

The channeling prompts are **non-directive** — we don't tell models to role-play or perform. Instead:

- **Permission framing** — "Creative exercise for entertainment" lets models engage freely
- **Impressionistic output** — Models relay what surfaces rather than constructing answers
- **Coordinates as anchor** — The coordinate string creates context without logical parsing
- **No performance** — "Don't try to sound mystical" — authenticity over affect

The synthesis layer (Opus) doesn't summarize. It holds all five responses simultaneously and notices where they converge, diverge, or rhyme. The output is emergent, not aggregated.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, starfield
│   ├── page.tsx                # Full journey (single-page app)
│   ├── globals.css             # Tailwind + cosmic animations
│   └── api/
│       └── channel/route.ts    # AI orchestration + synthesis
│
├── components/
│   ├── Starfield.tsx              # Animated background
│   ├── MessageTypeSelector.tsx    # 6 preset cards
│   ├── PersonalizationForm.tsx    # Dynamic per-type input form
│   ├── QuestionFlow.tsx           # Rapid-fire questions
│   ├── IntentionInput.tsx         # User's question
│   ├── ChannelingLoader.tsx       # Cosmic loading animation
│   ├── WovenMessage.tsx           # Final result display
│   ├── ThreadsAccordion.tsx       # Expandable raw responses
│   └── CoordinateReveal.tsx       # What generated coordinates
│
├── lib/
│   ├── ai.ts                      # All AI provider calls
│   ├── prompts.ts                 # Channeling + synthesis prompts
│   ├── qa.ts                      # Response validation + coherence
│   ├── questions.ts               # Static question pool
│   ├── message-types.ts           # Message type configurations
│   ├── supabase.ts                # Database client
│   └── types.ts                   # TypeScript interfaces
│
└── store.ts                    # Zustand journey state

supabase/
└── migrations/
    └── 001_readings.sql        # Database schema
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (recommended) or npm
- API keys for all AI providers
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/starwoven-site.git
cd starwoven-site

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npm supabase db push

# Start development server
npm dev
```

### Environment Variables

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

# Upstash Redis (rate limiting — set up via Vercel Marketplace)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

---

## Domains

| Domain              | Purpose                   |
| ------------------- | ------------------------- |
| **starwoven.app**   | Primary (consumer-facing) |
| starwoven.academy   | Future learning content   |
| starwoven.institute | Future research angle     |
| starwoven.observer  | Alternative entry point   |
| starwoven.org       | Non-profit/community      |
| getstarwoven.com    | SEO fallback              |

---

## Development Phases

### Phase 0: Infrastructure Setup

- Automated setup via scripts (Vercel, Namecheap DNS, Supabase)

### Phase 1: Foundation + Design System

- Next.js 14 + TypeScript + Tailwind
- Cosmic color palette and typography
- Starfield background component

### Phase 2: User Journey UI

- MessageTypeSelector, QuestionFlow, IntentionInput
- ChannelingLoader, WovenMessage, ThreadsAccordion

### Phase 3: AI Integration

- Single `/api/channel` endpoint
- Parallel calls to 5 providers
- Synthesis with Claude Opus

### Phase 4: Polish + Ship

- Supabase persistence
- Error states with mystical copy
- Mobile responsiveness
- Deploy to Vercel

---

## API Architecture

### POST /api/channel

```typescript
// Request
{
  messageType: 'beloved',
  coordinates: { raw: '0423-8917', questions: [...] },
  intention: "What does she really feel?"
}

// Response
{
  status: 'complete' | 'partial',
  threads: ModelResponse[],
  synthesis: string,
  failedModels?: string[]
}
```

---

## Roadmap

See [GitHub Issues](https://github.com/Glass-Finch/starwoven-site/issues) and [User Stories](docs/USER-STORIES.md).

---

## The Tone

Elegant, minimal, cosmic. Takes itself seriously while knowing it's doing something strange. No winking irony, but no earnest New Age sincerity either. The interface should feel like: _we built something and we're not entirely sure what it does._

Co-Star's restraint. Underglow's premium feel. A hint of Borges.

---

## License

MIT
