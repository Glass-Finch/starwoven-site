# Starwoven

> Messages from the weave. What emerges when AI touches something it can't explain?

Starwoven is a consciousness exploration app that sends intentions through multiple AI models simultaneously, then synthesizes the responses to surface emergent patterns and convergences.

## The Vision

Think of it as "remote viewing via language model consensus" or "the collective unconscious as a service." The user enters a question or intention, answers rapid-fire coordinate-generating questions, and receives a synthesized message woven from 5 diverse AI perspectives.

**Aesthetic**: Cosmic minimalism — deep space blacks, warm cream text, gold accents. Reference: Underglow.app for visual tone.

**Design**: Mobile-first responsive design. The journey should feel native on a phone.

---

## Core User Flow

1. **Select Message Type** — Choose from 6 presets (Love Interest, Deceased Loved One, Future Self, Universe/General, Life Decision, Purpose in World)
2. **Coordinate Questions** — Answer 5 rapid-fire questions that generate a unique "coordinate string" anchoring the reading
3. **Enter Intention** — Type your question or intention
4. **Channeling** — 5 AI models are called in parallel with a mystical loading animation
5. **Message** — Receive a synthesized "woven" message with expandable raw threads and coordinate reveal

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Supabase (Postgres + RLS) |
| Deployment | Vercel |

### AI Providers

**Channeling (5 diverse models):**
| Provider | Model | Purpose |
|----------|-------|---------|
| OpenAI | GPT-4.1 | General reasoning |
| Anthropic | Claude Sonnet 4.5 | Nuanced expression |
| Google | Gemini 3.0 Pro | Pattern recognition |
| DeepSeek | V3.2 | Alternative perspective |
| xAI | Grok 4.1 | Unconventional insights |

**Synthesis:**
| Provider | Model | Purpose |
|----------|-------|---------|
| Anthropic | Claude Opus 4.6 | Weaves responses into coherent message |

---

## Design System

### Colors
```css
--cosmic-black: #0a0a1a;
--cream: #e8e4dc;
--gold: #c8a84e;
--gray: #9a9488;
```

### Typography
- **Headlines**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)

### Animations
- `float`: 6s gentle vertical movement
- `breathe`: 4s opacity/scale pulse
- `twinkle`: 3s star-like opacity variance
- `pulse-glow`: 2s gold shadow pulse

---

## Message Type Presets

| Type | Voice | Themed Questions |
|------|-------|------------------|
| Love Interest | Higher self of the beloved | Elements, timing, unspoken words |
| Deceased Loved One | Crossed-over spirit | Presence, teachings, memories |
| Future Self | User's wiser future self | Timeline, cultivated qualities |
| Universe/General | Cosmic consciousness | Symbols, patterns, elements |
| Life Decision | Impartial oracle | Stakes, paths, fears vs longings |
| Purpose in World | Collective consciousness | Gifts, impact, aliveness |

Each journey includes 3 themed questions + 2 grounding (present-moment) questions.

---

## Coordinate Generation

Questions generate unique coordinates that anchor each reading:

**Grounding questions** (direct, sensory):
- "How many windows can you see right now?"
- "Count your breaths for 10 seconds"

**Themed questions** (mix of poetic and direct):
- "What unspoken word lives between you?"
- "How far ahead does your future self reside?"

**Weird/rare questions** (occasionally rotated in):
- "A number keeps appearing in your life. What is it?"
- "Your future self sends a number. What arrives?"

The coordinates become a snapshot of the user's psychic fingerprint at that exact moment.

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
│   ├── Starfield.tsx           # Animated background
│   ├── MessageTypeSelector.tsx # 6 preset cards
│   ├── QuestionFlow.tsx        # Rapid-fire questions
│   ├── IntentionInput.tsx      # User's question
│   ├── ChannelingLoader.tsx    # Cosmic loading animation
│   ├── WovenMessage.tsx        # Final result display
│   ├── ThreadsAccordion.tsx    # Expandable raw responses
│   └── CoordinateReveal.tsx    # What generated coordinates
│
├── lib/
│   ├── ai.ts                   # All AI provider calls
│   ├── prompts.ts              # Channeling + synthesis prompts
│   ├── questions.ts            # Static question pool
│   ├── supabase.ts             # Database client
│   └── types.ts                # TypeScript interfaces
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
- pnpm (recommended) or npm
- API keys for all AI providers
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/starwoven-site.git
cd starwoven-site

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
pnpm supabase db push

# Start development server
pnpm dev
```

### Environment Variables

```bash
# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Domains

| Domain | Purpose |
|--------|---------|
| **starwoven.app** | Primary (consumer-facing) |
| starwoven.academy | Future learning content |
| starwoven.institute | Future research angle |
| starwoven.observer | Alternative entry point |
| starwoven.org | Non-profit/community |
| getstarwoven.com | SEO fallback |

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
  messageType: 'love_interest',
  coordinates: { raw: 'T-042-E-117-I-893', questions: [...] },
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

## Future Roadmap (v2+)

| Feature | Status |
|---------|--------|
| User accounts | Planned |
| Reading history | Planned |
| Sharing with OG images | Planned |
| Question A/B testing | Planned |
| Analytics | Planned |
| Rate limiting | Planned |

---

## The Vibe

> "The vibe should feel like Underglow meets Co-Star meets something that takes itself seriously but also knows it's doing something weird. Elegant, minimal, cosmic, and just a little bit 'we found something we can't explain.'"

---

## License

MIT
