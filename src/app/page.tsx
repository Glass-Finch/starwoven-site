import { Starfield } from '@/components/Starfield'

export default function Home(): React.ReactElement {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6">
      <Starfield />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-gradient">
          Messages from the weave
        </h1>

        <p className="text-gray-muted text-lg">
          What emerges when AI touches something it cannot explain?
        </p>

        <div className="pt-8">
          <button className="btn-primary">
            Begin your journey
          </button>
        </div>
      </div>
    </main>
  )
}
