import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Navigation - Mobile optimized */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-base sm:text-lg flex-shrink-0">
              ⬡
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-sm sm:text-base lg:text-lg tracking-tight truncate">
                Consensus Bridge
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider hidden sm:block">
                Democratic Dialogue Platform
              </p>
            </div>
          </div>
          <Link 
            href="/auth"
            className="px-4 sm:px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold text-xs sm:text-sm hover:bg-amber-300 transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Responsive */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        {/* Hero text - Mobile optimized */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fadeUp">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight px-2">
            AI-Facilitated Cross-Partisan Dialogue
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
            Scaling deliberative democracy without hollowing it out. Build genuine consensus across political divides.
          </p>
        </div>

        {/* Four Stages - Mobile 1 column, tablet 2, desktop 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          {[
            { icon: '◎', title: 'Map Beliefs', desc: 'AI analyzes values, fears, and underlying concerns' },
            { icon: '⚖', title: 'Facilitate Dialogue', desc: 'Structured exercises to build understanding' },
            { icon: '⬡', title: 'Synthesize Consensus', desc: 'Authentic policy recommendations' },
            { icon: '✦', title: 'Community Validation', desc: 'Participants verify before finalization' },
          ].map((stage, i) => (
            <div 
              key={i} 
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-amber-400/30 transition-all duration-300 animate-fadeUp"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{stage.icon}</div>
              <h3 className="font-display text-base sm:text-lg font-bold mb-2">{stage.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>

        {/* Features - Responsive */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Why Consensus Bridge?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '🛡️', title: 'Verified by Participants', desc: 'Community verification ensures AI never fabricates consensus' },
              { icon: '📈', title: 'Built for Scale', desc: 'Thousands of simultaneous dialogues, proven deliberative principles' },
              { icon: '📊', title: 'Measurable Impact', desc: 'Track tolerance, compromise willingness, and policy co-creation' },
            ].map((feature, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-2xl sm:text-3xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-sm sm:text-base mb-2">{feature.title}</h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Full width on mobile */}
        <div className="text-center px-4">
          <Link 
            href="/auth"
            className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-amber-400 text-slate-950 text-base sm:text-lg font-semibold rounded-lg hover:bg-amber-300 transition-all hover:scale-105 shadow-lg shadow-amber-400/20"
          >
            Start Building Consensus →
          </Link>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500">
            Built for Mozilla Democracy × AI Incubator
          </p>
        </div>
      </div>
    </div>
  )
}