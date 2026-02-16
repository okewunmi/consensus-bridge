import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export const createClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}
