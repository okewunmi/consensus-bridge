import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Consensus Bridge'
    const participants = searchParams.get('participants') || null
    const messages = searchParams.get('messages') || null

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            padding: '60px',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: '#fbbf24',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#0f172a',
              marginBottom: '40px',
            }}
          >
            ⬡
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 60,
              maxWidth: '90%',
              textAlign: 'center',
              fontWeight: 'bold',
              margin: '0 0 30px 0',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>

          {/* Stats if provided */}
          {(participants || messages) && (
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginBottom: '30px',
                fontSize: '18px',
                color: '#94a3b8',
              }}
            >
              {participants && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👥</span>
                  <span>{participants} participants</span>
                </div>
              )}
              {messages && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💬</span>
                  <span>{messages} messages</span>
                </div>
              )}
            </div>
          )}

          {/* Branding */}
          <div
            style={{
              fontSize: 28,
              color: '#fbbf24',
              fontWeight: '600',
            }}
          >
            Consensus Bridge
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: '8px',
            }}
          >
            AI-Facilitated Democratic Dialogue
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}