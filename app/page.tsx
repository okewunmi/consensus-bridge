import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-lg">
              ⬡
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight">
                Consensus Bridge
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Democratic Dialogue Platform
              </p>
            </div>
          </div>
          <Link 
            href="/auth"
            className="px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold text-sm hover:bg-amber-300 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fadeUp">
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            AI-Facilitated Cross-Partisan Dialogue
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Scaling deliberative democracy without hollowing it out. Build genuine consensus across political divides.
          </p>
        </div>

        {/* Four Stages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: '◎', title: 'Map Beliefs', desc: 'AI analyzes values, fears, and underlying concerns' },
            { icon: '⚖', title: 'Facilitate Dialogue', desc: 'Structured exercises to build understanding' },
            { icon: '⬡', title: 'Synthesize Consensus', desc: 'Authentic policy recommendations' },
            { icon: '✦', title: 'Community Validation', desc: 'Participants verify before finalization' },
          ].map((stage, i) => (
            <div 
              key={i} 
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-amber-400/30 transition-all duration-300 animate-fadeUp"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl mb-4">{stage.icon}</div>
              <h3 className="font-display text-lg font-bold mb-2">{stage.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-12">
          <h3 className="font-display text-2xl font-bold mb-6">Why Consensus Bridge?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Verified by Participants', desc: 'Community verification ensures AI never fabricates consensus' },
              { icon: '📈', title: 'Built for Scale', desc: 'Thousands of simultaneous dialogues, proven deliberative principles' },
              { icon: '📊', title: 'Measurable Impact', desc: 'Track tolerance, compromise willingness, and policy co-creation' },
            ].map((feature, i) => (
              <div key={i}>
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/auth"
            className="inline-block px-8 py-4 bg-amber-400 text-slate-950 text-lg font-semibold rounded-lg hover:bg-amber-300 transition-all hover:scale-105 shadow-lg shadow-amber-400/20"
          >
            Start Building Consensus →
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Built for Mozilla Democracy × AI Incubator
          </p>
        </div>
      </div>
    </div>
  )
}
