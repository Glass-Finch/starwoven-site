# Starwoven User Stories

## The User

Three archetypes, one experience:

**The Curious** — Spiritually open, exploring. Drawn to tarot, astrology, therapy. Wants an experience that feels intentional without requiring belief.

**The Practiced** — Already familiar with readings, oracle cards, intuitive practices. Expects sophistication. Will notice if the copy is cheesy.

**The Skeptic** — Intellectually intrigued despite themselves. Needs plausible deniability: "I'm just curious what happens." Responds to understated confidence, not mystical theater.

All three need the same thing: something that takes itself seriously without trying too hard.

---

## Core User Stories

### 1. Choosing a Channel

**As a user**, I want to choose the source of my message so that it speaks to my specific situation.

**Acceptance Criteria:**
- I see 6 distinct options, each with a clear label and description
- The descriptions tell me WHO is speaking (not what I'll get)
- I understand the framing before I commit
- Tapping advances me immediately (no confirmation needed)

**Final Copy:**
| Type | Label | Description |
|------|-------|-------------|
| Love Interest | "The Beloved" | "What echoes between you" |
| Deceased | "The Ancestor" | "From a familiar silence" |
| Future Self | "The Sage" | "A glimpse of what you might know" |
| Universe | "The Cosmos" | "A voice from nowhere in particular" |
| Life Decision | "The Crossroads" | "Clarity from the impartial eye" |
| Purpose | "The Calling" | "What might be asked of you" |

Note: These descriptions are understated and evocative. They suggest without explaining.

---

### 2. Answering Coordinate Questions

**As a user**, I want to answer quick intuitive questions so that my reading is anchored to this specific moment.

**Acceptance Criteria:**
- Questions feel personal and evocative, not like a quiz
- All questions are multiple choice (4 options)
- I tap once and immediately advance
- Questions are a mix of themed (about my situation) and grounding (about now)
- I never feel like there's a "right" answer
- Questions should NEVER be trivia or factual

**Question Categories:**
- **Themed**: Intuitive questions related to my message type
  - "What word lives unspoken between you?"
  - "Which element speaks to the energy between you?"
- **Grounding**: Present-moment awareness questions
  - "What is the light like in this moment?"
  - "What texture comes to mind?"

**Anti-patterns (never do this):**
- "What phase is the moon?" (trivia)
- "What time of day is it?" (auto-generatable)
- "Are you alone?" (too direct/factual)

---

### 3. Naming the Subject (optional, type-dependent)

**As a user**, I want to provide a name or brief context so the reading feels personal without requiring deep disclosure.

**Acceptance Criteria:**
- Only certain message types ask for a name
- Single text field, optional
- Name appears in the synthesized message where appropriate
- If skipped, the message uses "they" or generic framing

**Type-Specific Name Prompts:**
| Type | Prompt | Placeholder | Used in Output |
|------|--------|-------------|----------------|
| The Beloved | "Who are they?" | "A name, or how you think of them..." | "What [name] carries..." |
| The Ancestor | "Who are you reaching for?" | "Their name, or your relation..." | "From [name]..." |
| The Sage | — | — | (no name needed, it's you) |
| The Cosmos | — | — | (no name needed) |
| The Crossroads | "What's the decision about?" | "One word or phrase..." | "Regarding [subject]..." |
| The Calling | — | — | (no name needed) |

---

### 4. Setting an Intention

**As a user**, I want to set an intention for my reading so the message addresses what I actually need.

**Acceptance Criteria:**
- The prompt is specific to my message type
- The placeholder text gives a starting point
- Encouraged to be open-ended, not specific
- Character limit (250) encourages brevity
- Guidance feels inviting, not restrictive

**Type-Specific Prompts:**
| Type | Prompt | Placeholder |
|------|--------|-------------|
| The Beloved | "What remains unspoken?" | "The words that live between you..." |
| The Ancestor | "What echoes still?" | "What you long to hear, or say..." |
| The Sage | "What would your future self say?" | "The counsel you need now..." |
| The Cosmos | "What stirs within you?" | "The question beneath the question..." |
| The Crossroads | "Which path calls to you?" | "The choice that weighs on you..." |
| The Calling | "What wants to emerge through you?" | "Your gift to the world..." |

---

### 5. Watching the Field

**As a user**, I want to see progress while the oracles respond, without theatrical copy that breaks the spell.

**Acceptance Criteria:**
- Visual progression, not text: the starfield deepens, constellations form, the field "fills in"
- Oracle indicators light up as each model responds
- Constellation lines connect between completed responses
- The experience feels like watching something assemble, not waiting

**Loading Experience Options:**
1. **Silent visual** — No text. Stars multiply, brightness increases, lines form between oracles.
2. **Minimal status** — Just "3 of 5" or progress indicator. No poetic loading messages.
3. **Wry single line** — One understated phrase that doesn't rotate: "Listening." or "Gathering."

Avoid: rotating mystical phrases, anything that sounds like a loading screen wrote poetry.

---

### 6. Receiving the Message

**As a user**, I want to receive the synthesized message so that I can reflect on what emerged.

**Acceptance Criteria:**
- The synthesis appears word-by-word (60ms per word)
- A cursor blinks during reveal
- After reveal, I can expand to see individual threads
- Each thread shows the oracle name (Iris, Luna, etc.)
- I can see what generated my coordinates
- I can start a new journey easily

**Thread Labels:**
| Oracle | Archetype | Display Format |
|--------|-----------|----------------|
| Iris | The Oracle | "Iris - The Oracle" |
| Luna | The Muse | "Luna - The Muse" |
| Echo | The Mirror | "Echo - The Mirror" |
| Shade | The Deep | "Shade - The Deep" |
| Nova | The Wild | "Nova - The Wild" |

---

## Edge Cases

### Partial Failure

**As a user**, if some oracles fail to respond, I still want to receive a message from those that succeeded.

**Acceptance Criteria:**
- Synthesis proceeds with 3+ successful responses
- Failed oracles are dimmed in the loader
- No explicit failure messaging (just visual dimming)
- The experience doesn't feel broken

---

### Complete Failure

**As a user**, if channeling fails completely, I want to try again without losing my intention.

**Acceptance Criteria:**
- Error message is clear and understated, not theatrical
- I can retry with one tap
- I can start over with a different message type
- My coordinates are preserved for retry

**Error Copy (understated, not theatrical):**
- "Something slipped. Try again." (generic)
- "The connection timed out." (timeout)
- "Couldn't reach the oracles. Check your connection." (network)

Avoid: "The cosmic threads have frayed" or similar overwrought language.

---

## Voice & Tone

### Copy Principles

1. **Understated confidence** — Don't try to convince anyone. Present the experience and let it speak.
2. **Precision over poetry** — When in doubt, be clear. Ornate language often signals insecurity.
3. **No exclamation points** — Calm, centered energy. Nothing is "exciting."
4. **No emojis** — Ever.
5. **Mystery through restraint** — The less you explain, the more space for meaning.
6. **Avoid New Age clichés** — If it sounds like a yoga studio or crystal shop, rewrite it.

### Register Examples

**Too theatrical:**
> "The veils between worlds grow thin as the oracles attune to your intention..."

**Too clinical:**
> "Five AI models are processing your query in parallel."

**Right register:**
> "The oracles are listening."

### Words to Use Sparingly
- Thread, pattern, convergence (fine, but don't overuse)
- Emerge, surface, arise (one per page max)

### Words to Avoid
- Magic, magical, mystical, spiritual (too on-the-nose)
- Weave, woven (sounds like hair products)
- AI, model, algorithm (breaks immersion)
- Results, output, response (too transactional)
- Amazing, wonderful, beautiful (too enthusiastic)
- Journey, path, threshold (overused)
- Vibration, energy, frequency (New Age cliché)
- Sacred, divine, blessed (religious connotation)
