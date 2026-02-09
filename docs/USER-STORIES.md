# Starwoven User Stories

## The User

Three archetypes, one experience:

**The Curious** — Spiritually open, exploring. Drawn to tarot, astrology, therapy. Wants an experience that feels intentional without requiring belief.

**The Practiced** — Already familiar with readings, oracle cards, intuitive practices. Expects sophistication. Will notice if the copy is cheesy.

**The Skeptic** — Intellectually intrigued despite themselves. Needs plausible deniability: "I'm just curious what happens." Responds to understated confidence, not mystical theater.

All three need the same thing: something that takes itself seriously without trying too hard.

---

## Message Type User Stories

Each message type serves a different user need. The intention prompt and placeholder should be clear and inviting.

---

### The Beloved (Love Interest)

**Who uses this:** Someone wondering about a romantic interest, crush, partner, or ex. They want insight into how that person feels, what's happening in the relationship, or what's between them.

**Note:** We're not asking the person directly — we're asking ABOUT them and the relationship.

**What they're really asking:**
- Does this person like me?
- What do they really feel about me?
- Why did they act that way?
- Is there a future here?
- What's really going on between us?

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `yourName` | Your name | Your first name... | Yes |
| `theirName` | Their name | Their name or what you call them... | Yes |
| `intention` | What do you want to know? | Does this person like me? What do they really feel? Is there a future here? | Yes |

**Example intentions:**
- "Does he like me?"
- "Why has she been distant?"
- "Is there a future here?"
- "What do they really feel about me?"

---

### The Ancestor (Deceased Loved One)

**Who uses this:** Someone grieving, seeking closure, or wanting connection with someone who has passed. They might want to ask something OR express something.

**What they're really asking:**
- Are they okay?
- Do they forgive me?
- What would they say to me now?
- Is there something they want me to know?
- There's something I need to tell them

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `yourName` | Your name | Your first name... | Yes |
| `theirName` | Their name | Their name... | Yes |
| `relationship` | Your relationship | e.g., grandmother, father, friend... | Yes |
| `intention` | What do you want to ask or tell them? | Are they okay? Do they forgive me? What would they say to me now? | Yes |

**Example intentions:**
- "Are you okay?"
- "Do you forgive me?"
- "What would you say about my life now?"
- "I need you to know I'm okay"

---

### The Sage (Future Self)

**Who uses this:** Someone wanting to ask their future self for advice. The version of them that has already lived through whatever they're facing now.

**What they're really asking:**
- What would I tell myself if I could look back?
- What do I already know, deep down?
- What would my wiser self say about this?

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `yourName` | Your name | Your first name... | Yes |
| `birthday` | Your birthday | (date picker) | Yes |
| `intention` | What do you need advice on? | Should I take this job? Am I on the right path? What should I focus on? | Yes |

**Example intentions:**
- "Should I take this job?"
- "Am I on the right path?"
- "What should I focus on right now?"
- "Is this relationship right for me?"

---

### The Cosmos (Universe/General)

**Who uses this:** Someone with something on their mind, not tied to a specific person or decision. Seeking insight or reflection.

**What they're really asking:**
- What do I need to hear right now?
- What's going on with me?
- What am I not seeing?

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `intention` | What's on your mind? | What do I need to hear right now? What am I not seeing? | Yes |

No additional personalization fields — just the intention.

**Example intentions:**
- "What do I need to hear right now?"
- "What am I not seeing?"
- "What am I avoiding?"

---

### The Crossroads (Life Decision)

**Who uses this:** Someone facing a yes/no decision. Like a sophisticated magic 8-ball — they have a specific question they need an answer to.

**What they're really asking:**
- Should I do this or not?
- Is it time?
- Yes or no?

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `intention` | What decision do you need help with? | Should I take the job? Should I move? Is it time to end this? | Yes |

No additional personalization fields — the question itself is the focus.

**Example intentions:**
- "Should I take the job?"
- "Should I move?"
- "Is it time to end this relationship?"
- "Should I reach out to them?"

---

### The Calling (Purpose)

**Who uses this:** Someone asking about their purpose. What they're meant to do. What they're here for.

**What they're really asking:**
- What is my purpose?
- What am I meant to do?
- What is my calling?
- What should I be focusing my life on?

**User Inputs:**
| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| `yourName` | Your name | Your first name... | Yes |
| `birthday` | Your birthday | (date picker) | Yes |
| `intention` | What do you want to know about your purpose? | What is my purpose? What am I meant to do? What is my calling? | Yes |

**Example intentions:**
- "What is my purpose?"
- "What am I meant to do?"
- "What is my calling?"
- "What should I be doing with my life?"

---

## Core Flow User Stories

### 1. Choosing a Channel

**As a user**, I want to choose the type of message I need so that it speaks to my specific situation.

**Acceptance Criteria:**
- I see 6 distinct options, each with a clear label and description
- The descriptions are functional and clear (user knows what each channel is for)
- I understand the framing before I commit
- Tapping advances me immediately

**Final Copy:**
| Label | Description |
|-------|-------------|
| The Beloved | "Ask about a romantic connection" |
| The Ancestor | "Seek connection with someone who has passed" |
| The Sage | "Ask your future self for advice" |
| The Cosmos | "Seek insight on what's on your mind" |
| The Crossroads | "Get clarity on a yes or no decision" |
| The Calling | "Explore your purpose" |

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
