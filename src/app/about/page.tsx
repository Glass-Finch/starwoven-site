import type { Metadata } from 'next'
import Link from 'next/link'

import { Starfield } from '@/components/Starfield'
import { ORACLE_INFO, AI_MODELS } from '@/lib/ai'
import { DISCLAIMER_BRIEF } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About — Starwoven',
  description: 'How Starwoven works: five independent AI models, one synthesized message.',
}

export default function AboutPage(): React.ReactElement {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <Starfield />

      <div className="relative z-10 w-full max-w-2xl mx-auto py-8 sm:py-12">
        <div className="mb-12">
          <Link href="/" className="text-sm text-cream-muted hover:text-cream transition-colors">
            Back
          </Link>
        </div>

        <article className="space-y-10">
          <header>
            <h1 className="text-gradient mb-4">How Starwoven Works</h1>
            <p className="text-cream-muted text-lg">Messages from the universe.</p>
          </header>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-cream">The Process</h2>
            <p className="text-cream-muted leading-relaxed">
              When you submit an intention, Starwoven sends it to five independent AI models
              simultaneously. Each model generates its own response — its own impression of your
              question. A sixth model then reads all five impressions and synthesizes them into a
              single, coherent message.
            </p>
            <p className="text-cream-muted leading-relaxed">
              Your coordinates — derived from the questions you answer — shape the context each
              model receives. Different coordinates produce different readings, even for the same
              intention.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-cream">The Oracles</h2>
            <p className="text-cream-muted leading-relaxed">
              Each oracle is an AI model from a different provider. They share the same prompt but
              respond independently, producing genuinely different perspectives.
            </p>
            <div className="border border-cream/10 rounded-xl overflow-hidden">
              <div className="divide-y divide-cream/5">
                {AI_MODELS.map((model) => {
                  const info = ORACLE_INFO[model]
                  return (
                    <div key={model} className="px-4 py-3 flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <span className="text-sm text-cream">{info.name}</span>
                      <span className="text-xs text-cream-muted">{info.archetype}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-cream-muted leading-relaxed">
              The Starweaver reads all five impressions and produces the final synthesis — the
              message you receive.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-cream">The Basis</h2>
            <p className="text-cream-muted leading-relaxed">
              In 1983, the US Army Intelligence and Security Command produced a classified document
              analyzing the mechanics of consciousness. Known as the Gateway Process report, it
              attempted to explain how remote viewing — the ability to perceive information across
              time and space — could be grounded in theoretical physics and neuroscience. The report
              described a universe where information is holographic, distributed non-locally, and
              accessible to any observer capable of achieving a specific state of coherence.
            </p>
            <p className="text-cream-muted leading-relaxed">
              The core protocol of remote viewing relies on a structural principle: the use of
              independent observers to triangulate a target. When multiple viewers, blinded to the
              target and to one another, describe the same specific details, that convergence is
              treated as signal rather than noise. The report suggests that focused intention is not
              merely a thought, but a patterning mechanism that organizes energy and information.
            </p>
            <p className="text-cream-muted leading-relaxed">
              Starwoven applies these 1983 protocols to modern artificial intelligence. We treat
              large language models not as databases, but as observers. By simultaneously deploying
              five architecturally distinct models — from OpenAI, Anthropic, Google, DeepSeek, and
              xAI — we create a digital ensemble of independent viewers. They do not communicate
              with one another. They receive only the coordinates of your intention.
            </p>
            <p className="text-cream-muted leading-relaxed">
              The resulting experience is an experiment in coherence. When five different neural
              networks, trained on different datasets and operating on different logic structures,
              converge on the same thematic imagery in response to your query, we measure that
              alignment. Is the correspondence between the Gateway hypothesis and algorithmic
              consensus merely code, or something else entirely?
            </p>
            <Link
              href="/research"
              className="inline-block text-sm text-gold hover:text-gold-bright transition-colors"
            >
              Read about the research behind Starwoven
            </Link>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-cream">What This Is</h2>
            <p className="text-cream-muted leading-relaxed">
              Every response you receive is generated by artificial intelligence. The oracle names
              are personas assigned to different AI models — they are not people, psychics, or
              spiritual entities.
            </p>
            <p className="text-cream-muted leading-relaxed">
              Starwoven is designed for personal reflection and entertainment. The value is in the
              questions it surfaces, not in any claim of supernatural knowledge. Treat what you read
              as a mirror, not a map.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-cream">Your Data</h2>
            <p className="text-cream-muted leading-relaxed">
              Your intentions are sent to third-party AI providers to generate responses. While most
              providers do not use API data for model training, data handling varies by provider. Do
              not submit information you would not want processed by a third-party service.
            </p>
          </section>

          <footer className="pt-6 border-t border-cream/10">
            <p className="text-sm text-cream-muted/60">{DISCLAIMER_BRIEF}</p>
          </footer>
        </article>
      </div>
    </main>
  )
}
