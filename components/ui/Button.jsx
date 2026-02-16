// import { Spinner } from './Spinner'

// type ButtonVariant = 'primary' | 'secondary' | 'ghost'

// export function Button({
//   children,
//   onClick,
//   variant = 'primary',
//   loading = false,
//   disabled = false,
//   type = 'button',
//   className = ''
// }: {
//   children: React.ReactNode
//   onClick?: () => void
//   variant?: ButtonVariant
//   loading?: boolean
//   disabled?: boolean
//   type?: 'button' | 'submit'
//   className?: string
// }) {
//   const variants = {
//     primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
//     secondary: 'bg-transparent text-slate-300 border border-slate-700 hover:border-slate-600',
//     ghost: 'bg-transparent text-amber-400 border border-amber-400/30 hover:bg-amber-400/10'
//   }

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled || loading}
//       className={`
//         inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded
//         font-medium text-sm transition-all
//         disabled:opacity-50 disabled:cursor-not-allowed
//         ${variants[variant]}
//         ${className}
//       `}
//     >
//       {loading && <Spinner size={14} />}
//       {children}
//     </button>
//   )
// }

import { Spinner } from './Spinner'

export function Button({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = ''
}) {
  const variants = {
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    secondary: 'bg-transparent text-slate-300 border border-slate-700 hover:border-slate-600',
    ghost: 'bg-transparent text-amber-400 border border-amber-400/30 hover:bg-amber-400/10'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded
        font-medium text-sm transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}