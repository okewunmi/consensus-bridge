// app/profile/[userId]/page.jsx
export default function UserProfilePage({ params }) {
  const userId = params.userId
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({})
  
  useEffect(() => {
    loadProfile()
  }, [])
  
  const loadProfile = async () => {
    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Get stats
    const { data: dialogues } = await supabase
      .from('dialogue_participants')
      .select('dialogue_id')
      .eq('user_id', userId)
    
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', userId)
      .eq('is_ai', false)
    
    const { data: verifications } = await supabase
      .from('verifications')
      .select('decision')
      .eq('user_id', userId)
    
    setUserData(user)
    setStats({
      dialogues: dialogues?.length || 0,
      messages: messages?.length || 0,
      verifications: verifications?.length || 0,
      endorsed: verifications?.filter(v => v.decision === 'endorse').length || 0
    })
  }
  
  return (
    <div>
      <h1>{userData?.name}</h1>
      <p>{userData?.political_lean}</p>
      
      {userData?.belief_profile && (
        <Card>
          <h3>Worldview</h3>
          <p>{userData.belief_profile.worldview}</p>
        </Card>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-3xl font-bold">{stats.dialogues}</div>
          <div className="text-sm text-slate-400">Dialogues</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold">{stats.messages}</div>
          <div className="text-sm text-slate-400">Messages</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold">{stats.verifications}</div>
          <div className="text-sm text-slate-400">Syntheses Verified</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold">{stats.endorsed}</div>
          <div className="text-sm text-slate-400">Endorsed</div>
        </Card>
      </div>
    </div>
  )
}