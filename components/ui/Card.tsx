export function Card({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`
      bg-slate-900 border border-slate-800 rounded-lg p-6
      ${className}
    `}>
      {children}
    </div>
  )
}
