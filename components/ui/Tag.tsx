type TagColor = 'amber' | 'green' | 'blue' | 'red'

export function Tag({ 
  children, 
  color = 'amber' 
}: { 
  children: React.ReactNode
  color?: TagColor 
}) {
  const colors = {
    amber: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    green: 'bg-green-400/10 text-green-400 border-green-400/30',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    red: 'bg-red-400/10 text-red-400 border-red-400/30',
  }

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      border text-xs font-mono uppercase tracking-wider font-medium
      ${colors[color]}
    `}>
      {children}
    </span>
  )
}
