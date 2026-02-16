// export function Spinner({ size = 18 }: { size?: number }) {
//   return (
//     <span
//       className="inline-block rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin-slow"
//       style={{ width: size, height: size }}
//     />
//   )
// }
export function Spinner({ size = 18 }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin-slow"
      style={{ width: size, height: size }}
    />
  )
}