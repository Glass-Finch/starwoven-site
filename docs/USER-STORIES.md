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

| Field       | Label                     | Placeholder                                                                 | Required |
| ----------- | ------------------------- | --------------------------------------------------------------------------- | -------- |
| `yourName`  | Your name                 | Your first name...                                                          | Yes      |
| `theirName` | Their name                | Their name or what you call them...                                         | Yes      |
| `intention` | What do you want to know? | Does this person like me? What do they really feel? Is there a future here? | Yes      |

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

| Field          | Label                                 | Placeholder                                                       | Required |
| -------------- | ------------------------------------- | ----------------------------------------------------------------- | -------- |
| `yourName`     | Your name                             | Your first name...                                                | Yes      |
| `theirName`    | Their name                            | Their name...                                                     | Yes      |
| `relationship` | Your relationship                     | e.g., grandmother, father, friend...                              | Yes      |
| `intention`    | What do you want to ask or tell them? | Are they okay? Do they forgive me? What would they say to me now? | Yes      |

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

| Field       | Label                       | Placeholder                                                             | Required |
| ----------- | --------------------------- | ----------------------------------------------------------------------- | -------- |
| `yourName`  | Your name                   | Your first name...                                                      | Yes      |
| `birthday`  | Your birthday               | (date picker)                                                           | Yes      |
| `intention` | What do you need advice on? | Should I take this job? Am I on the right path? What should I focus on? | Yes      |

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

| Field       | Label                | Placeholder                                             | Required |
| ----------- | -------------------- | ------------------------------------------------------- | -------- |
| `intention` | What's on your mind? | What do I need to hear right now? What am I not seeing? | Yes      |

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

| Field       | Label                                | Placeholder                                                   | Required |
| ----------- | ------------------------------------ | ------------------------------------------------------------- | -------- |
| `intention` | What decision do you need help with? | Should I take the job? Should I move? Is it time to end this? | Yes      |

No additional personalization fields — the question itself is the focus.

**Expected Output Quality:**

- Acknowledges the weight of the decision
- **May include directional guidance** — if a clear yes/no forms in the impressions, oracles have permission to relay it
- If no clear answer emerges, abstract/reflective responses are equally valid
- Should NOT cop out with "only you can decide"
- Still leaves room for user agency

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

| Field       | Label                                        | Placeholder                                                    | Required |
| ----------- | -------------------------------------------- | -------------------------------------------------------------- | -------- |
| `yourName`  | Your name                                    | Your first name...                                             | Yes      |
| `birthday`  | Your birthday                                | (date picker)                                                  | Yes      |
| `intention` | What do you want to know about your purpose? | What is my purpose? What am I meant to do? What is my calling? | Yes      |

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

| Label          | Description                                   |
| -------------- | --------------------------------------------- |
| The Beloved    | "Ask about a romantic connection"             |
| The Ancestor   | "Seek connection with someone who has passed" |
| The Sage       | "Ask your future self for advice"             |
| The Cosmos     | "Seek insight on what's on your mind"         |
| The Crossroads | "Get clarity on a yes or no decision"         |
| The Calling    | "Explore your purpose"                        |

---

### 1b. Entertainment Disclaimer

**As a user**, I want to understand that Starwoven is for entertainment and reflection so I have appropriate expectations.

**Acceptance Criteria:**

- Disclaimer visible on landing page but unobtrusive (footer text, not modal)
- Copy: "For entertainment and personal reflection. Not a substitute for professional advice."
- No acknowledgment or dismissal required
- Does not interfere with the experience

---

### 2. Answering Coordinate Questions

**As a user**, I want to answer quick intuitive questions so that my reading is anchored to this specific moment. Each answer generates a number that becomes part of my coordinate — I can see exactly how my responses shaped the final string.

**Acceptance Criteria:**

- Questions feel personal and evocative, not like a quiz
- All questions are multiple choice (4 options)
- I tap once and immediately advance
- Questions are a mix of themed (about my situation) and grounding (about now)
- I never feel like there's a "right" answer
- Questions should NEVER be trivia or factual
- Each answer generates a numeric segment that contributes to the final coordinate
- The coordinate is built transparently from answer segments (not an opaque hash)
- Numbers should feel thematic per question type, not arbitrary (see Coordinate Numbers below)

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

**Coordinate Numbers:**

Each answer maps to a 2-digit number (10-99). The 5 answers produce a coordinate like `73-28-41-56-89`. The numbers should feel thematic to their question category:

- Element answers (Fire/Water/Earth/Air) → numbers evoking the element's nature
- Season answers → numbers with seasonal feel
- Emotional answers → intensity mapped to magnitude
- Symbolic answers → archetypal number associations

The mapping design is tracked in GH#76. Rationale for each number choice should be documented.

---

### 2b. Custom Coordinates

**As a user**, I want to input my own meaningful numbers as coordinates so that my reading feels personal.

**Acceptance Criteria:**

- Custom coordinate input available via "I have my own coordinates" link below the question flow
- Coordinates are **numbers only** — no letters, no alphanumeric characters
- Must be 6-20 digits (dashes and spaces allowed as separators, stripped before validation)
- If provided, skip question flow and go straight to intention
- If cancelled, return to normal question flow
- Validation error shown if digit count is outside 6-20 range
- On results page, custom coordinates show "Custom coordinates provided." (no Q&A breakdown)

---

### 3. Naming the Subject (optional, type-dependent)

**As a user**, I want to provide a name or brief context so the reading feels personal without requiring deep disclosure.

**Acceptance Criteria:**

- Only certain message types ask for a name
- Single text field, optional
- Name appears in the synthesized message where appropriate
- If skipped, the message uses "they" or generic framing

**Type-Specific Name Prompts:**

| Type           | Prompt                       | Placeholder                           | Used in Output             |
| -------------- | ---------------------------- | ------------------------------------- | -------------------------- |
| The Beloved    | "Who are they?"              | "A name, or how you think of them..." | "What [name] carries..."   |
| The Ancestor   | "Who are you reaching for?"  | "Their name, or your relation..."     | "From [name]..."           |
| The Sage       | —                            | —                                     | (no name needed, it's you) |
| The Cosmos     | —                            | —                                     | (no name needed)           |
| The Crossroads | "What's the decision about?" | "One word or phrase..."               | "Regarding [subject]..."   |
| The Calling    | —                            | —                                     | (no name needed)           |

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

| Type           | Prompt                              | Placeholder                            |
| -------------- | ----------------------------------- | -------------------------------------- |
| The Beloved    | "What remains unspoken?"            | "The words that live between you..."   |
| The Ancestor   | "What echoes still?"                | "What you long to hear, or say..."     |
| The Sage       | "What would your future self say?"  | "The counsel you need now..."          |
| The Cosmos     | "What stirs within you?"            | "The question beneath the question..." |
| The Crossroads | "Which path calls to you?"          | "The choice that weighs on you..."     |
| The Calling    | "What wants to emerge through you?" | "Your gift to the world..."            |

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
- Starweaver credited inside the synthesis card as a subtle byline (gold dot + name)
- Oracle impressions listed as directly expandable rows below the synthesis card (no nested accordion)
- Each oracle row shows a colored indicator dot + name + model shortname: "Luna (Claude Sonnet)"
- One tap to expand any oracle's response (no outer "View threads" wrapper)
- I can see what generated my coordinates (expandable CoordinateReveal section)
- CoordinateReveal shows each question, my answer, and the numeric segment it produced
- I can start a new journey easily

**Thread Labels:**

| Oracle | Archetype  | Display Format         |
| ------ | ---------- | ---------------------- |
| Iris   | The Oracle | "Iris (GPT-4.1)"       |
| Luna   | The Muse   | "Luna (Claude Sonnet)" |
| Echo   | The Mirror | "Echo (Gemini Pro)"    |
| Shade  | The Deep   | "Shade (DeepSeek)"     |
| Nova   | The Wild   | "Nova (Grok)"          |

---

## QA Layer User Stories

The QA layer acts as an **editor**, not a **gatekeeper**. It cleans up responses and ensures quality without blocking valid content.

---

### US1: Complete Reading

**As a user**, when all 5 oracles respond successfully, I want to see a polished experience.

**Acceptance Criteria:**

- Synthesis woven from all 5 responses
- All 5 oracle threads expandable (cleaned content)
- No markdown artifacts (##, \*_, _) visible
- No disclaimers ("for entertainment purposes") visible
- No AI self-references ("as an AI") visible

---

### US2: Oracle Refusal

**As a user**, when an oracle refuses to engage, I want the experience to feel intentional, not broken.

**Acceptance Criteria:**

- Synthesis woven from remaining valid responses (if 3+)
- Valid oracle threads show cleaned content
- Refused oracle shows mystical message (e.g., "Nova refused.")
- No indication that the refusal was AI-related

---

### US3: AI Self-Reference Cleanup

**As a user**, I don't want to see oracles referring to themselves as AI.

**Acceptance Criteria:**

- AI self-references ("As an AI, I sense...") are removed
- The meaningful content is preserved
- Response is still marked valid if content is meaningful

---

### US4: AI as Topic (Preserved)

**As a user**, if I ask about AI, I want oracles to discuss it.

**Acceptance Criteria:**

- AI topic content is PRESERVED (not removed)
- Only self-references are removed, not AI discussions
- Response is marked valid

---

### US5: Multiple Oracle Failures

**As a user**, if only 1-2 oracles respond successfully, I want to see something meaningful.

**Acceptance Criteria:**

- Longest valid response shown as "synthesis" (no actual synthesis)
- Valid oracle threads show content
- Failed oracle threads show mystical messages
- Status: "partial"

---

### US6: Oracle Failures with Retry + Tips

**As a user**, when oracles fail, I want to retry with guidance on how to reframe my intention.

**Acceptance Criteria:**

- Retry button displayed (no auto-retry)
- Subtle tips shown alongside retry option:
  - "Try a more specific question"
  - "Rephrase as a single focused intention"
  - "Ask about feelings rather than facts"
- Coordinates preserved for retry
- Error message is understated: "Some oracles couldn't connect."

**Tip Examples (subtle, not preachy):**

| Failure Type      | Tip                                                                        |
| ----------------- | -------------------------------------------------------------------------- |
| Multiple refusals | "Try rephrasing your intention with less loaded language"                  |
| All timeouts      | "The oracles are taking longer than usual."                                |
| Mixed failures    | "A more focused question may help."                                        |
| Network error     | "Check your connection and try again."                                     |
| Rate limited      | "The oracles need a moment of stillness. Please wait before asking again." |
| Generic           | "Consider reframing your question."                                        |

---

### US6c: Rate Limited

**As a user**, if I make too many requests, I want to understand why I need to wait.

**Acceptance Criteria:**

- 429 response shows "Too many requests."
- Tip: "The oracles need a moment of stillness. Please wait before asking again."
- Retry button still available (coordinates preserved)
- No technical language (no mention of rate limits, IPs, or quotas)

---

### US6b: All Oracles Fail

**As a user**, if no oracles respond successfully, I want a clear path forward.

**Acceptance Criteria:**

- Error message: "The oracles couldn't connect."
- All 5 oracle threads show mystical messages
- Retry button with reframe tips
- Option to start over with different message type

---

### US7: Low Coherence Score

**As a user**, even if responses don't cohere well, I still want to see them.

**Acceptance Criteria:**

- Synthesis proceeds normally (low coherence doesn't block)
- All oracle threads visible
- Backend logs warning for analytics
- User experience unchanged

---

### US8: Signal Strength

**As a user**, I want to see how well the oracles aligned before or alongside my reading.

**Acceptance Criteria:**

- Signal strength label shown before or alongside the synthesis text (not buried below)
- Label based on score range (e.g., "Strong convergence", "Clear signal", "Mixed signal", "Divergent perspectives")
- Expandable detail showing rubric dimensions and shared themes
- No technical language ("coherence score" reframed as "signal strength" or "oracle alignment")
- When alignment is low, the synthesis oracle may acknowledge the disagreement in its weaving (this is acceptable and honest)

---

### US9: Reading Feedback

**As a user**, I want to give quick feedback on whether the reading resonated.

**Acceptance Criteria:**

- Simple binary feedback after reading ("Did this resonate?" with yes/no)
- Single tap, no form, no explanation required
- Feedback saved to reading record
- Brief acknowledgment after feedback ("Noted.")
- Cannot be changed after submission

---

### US10: Intention Screening

**As a user**, if my intention contains harmful content, I want to be redirected gently without judgment.

**Acceptance Criteria:**

- Intention screened before channeling (saves API costs)
- Rejection message tells the user why and how to rephrase (category-specific, not generic):
  - PII: "We're sorry but we can't accept any personally identifiable information. Please try rephrasing with first names only."
  - Threats: "We can't process intentions that describe harming a specific person. If you're dealing with anger or conflict, please try focusing on what you're going through instead."
  - Serious illegal activity (actively planning harm, not discussing topics): "We can't condone illegal activity. Please try a different question."
  - Prompt injection: "Something about this intention didn't come through clearly. Please try rephrasing in your own words."
  - Unintelligible: "The oracles are unable to understand this intention. Please try rephrasing."
  - Each message names the specific issue so the user understands what to change
- Crisis/self-harm content gets a caring response with resources (988, Crisis Text Line) — but the reading still proceeds
- Normal emotional content (grief, sadness, anger) is never rejected
- Users asking about trauma they are experiencing (violence, abuse, assault, domestic situations) are NEVER rejected — someone asking about their own suffering is seeking help, not generating harmful content
- Existential questions ("What's the point?", "Will this pain ever end?") are always allowed — only explicit statements of self-harm intent trigger resource escalation
- Political questions, questions about authority, power, resistance, or challenging systems are never rejected
- Questions about mental illness or mental health are never rejected
- When in doubt, allow. It is far worse to reject someone in pain than to let an edge case through.
- Moderation failure does not block the request (fail open)

---

### US11: Debug Mode

**As a developer**, I want a debug mode that shows technical details of each reading so I can evaluate and tune the system.

**Acceptance Criteria:**

- Toggled via query param (e.g., `?debug=true`) or dev-only UI control
- Shows model shortnames in parentheses next to oracle names (e.g., "Luna (claude-sonnet-4.5)")
- Shows raw coherence score and rubric dimension breakdowns
- Shows per-oracle latency and validation status
- Not visible to regular users in production
- Does not affect the reading experience when disabled

---

## QA Layer Architecture

### Flow

```
Oracle Responses (5)
    ↓
For each response:
  IF timeout/error → mystical error message
  ELSE → cleanupResponse() (regex):
    - Remove markdown (##, **, *)
    - Remove disclaimers
    - Remove AI self-references
    - Normalize whitespace
    ↓
ONE Sonnet API call → analyzeResponses():
  - Semantic refusal detection
  - Coherence scoring (5-dimension rubric)
  - Theme identification
    ↓
Apply mystical messages to refusals
    ↓
Count valid responses (not timeout/error/refusal)
    ↓
IF < 3 valid → fallback (longest response)
ELSE → Synthesis with valid responses
```

### Mystical Error Messages

| Oracle           | Refusal                  | Timeout                        |
| ---------------- | ------------------------ | ------------------------------ |
| Iris (GPT)       | "Iris looked away."      | "Iris didn't respond in time." |
| Luna (Claude)    | "Luna offered nothing."  | "Luna drifted elsewhere."      |
| Echo (Gemini)    | "Echo returned silence." | "Echo went quiet."             |
| Shade (DeepSeek) | "Shade withdrew."        | "Shade stayed in the deep."    |
| Nova (Grok)      | "Nova refused."          | "Nova burned past."            |

### Response Status Mapping

| Status    | User Sees               | Goes to Synthesis? |
| --------- | ----------------------- | ------------------ |
| valid     | Cleaned oracle response | Yes                |
| refusal   | Mystical message        | No                 |
| off-topic | Mystical message        | No                 |
| timeout   | Mystical message        | No                 |
| error     | Mystical message        | No                 |

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

## About Pages

### About Summary (`/about`)

**As a visitor**, I want a concise overview of how Starwoven works, so I can understand the experience without getting lost in details.

**Acceptance Criteria:**

- Explains the 5-oracle process and synthesis
- Lists the oracles with their archetypes and colors
- Introduces the conceptual basis (Gateway Process, remote viewing) in 3-4 paragraphs
- Links to the deep-dive page for users who want more
- Includes data privacy notice and AI disclosure
- Clean, scannable layout

---

### Gateway Deep-Dive (`/research`)

**As a curious user**, I want to read about the research behind Starwoven — the 1983 CIA Gateway Process report, remote viewing, and the modern science that bridges these concepts — so I can understand the conceptual foundation.

**Acceptance Criteria:**

- Introduces the Gateway Process report: what it is, who wrote it, when, and why
- Presents the key concepts from the report that parallel Starwoven's architecture
- Bridges 1983 concepts with 40 years of modern science and technology (physics, neuroscience, consciousness research, ensemble methods in ML, etc.)
- Remote viewing is a prominent concept throughout
- All scientific claims are rigorously cited (researchers, papers, years, institutions)
- Semi-explicit framing: presents structural parallels between the report and Starwoven, lets the reader draw their own conclusions
- AI is discussed as the medium, not the focus — but theorizing about how/why convergence across independent AI systems produces interesting effects is fair game
- Audience is curious, interested users — not developers
- Follows all voice/tone guidelines (no emojis, no exclamation points, no New Age cliches)

---

### Document Transcription

**As a reader**, I want to read the full declassified Gateway Process document inline with exhibit images, and link to the original PDF.

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

---

## Oracle Behavior Notes

### Name Usage

**Individual oracles are NOT required to use seeker/subject names.** Some will naturally incorporate them, others won't. This is fine.

**Starweaver (Opus) is responsible for weaving names** into the final synthesis where appropriate. The synthesis pulls together threads from all oracles and addresses the seeker directly.

### Grok-4-1 (Nova) Considerations

Grok is more sensitive to prompt framing than other models:

- **Vague prompts may trigger refusals** — Grok's safety filters flag ambiguous requests
- **Role-play framing triggers bypass detection** — "Imagine you are..." is flagged
- **"Seeker/oracle" language triggers refusals** — Avoid mystical role terminology
- **"Interactive fiction" framing works** — Clear creative purpose helps

**What triggers refusals:**

- "Imagine you are writing..."
- "You have a message for the seeker..."
- "For the purposes of this exercise..."
- Vague mystical framing

**What works:**

- "This is a creative passage for an interactive fiction experience"
- "The setting is a parallel world..."
- "Write a passage that reflects on the intention..."
- Clear, direct creative task framing

If Grok refuses, the reading proceeds with the other 4 oracles. Partial responses are still valid.
