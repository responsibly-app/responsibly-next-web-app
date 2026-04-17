import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Feature 3: Live Leaderboards — 1200×780
export function GET() {
  const advisors = [
    { rank: 1, name: 'Sarah Mitchell', xp: 2840, streak: 14, change: '+3', medal: '🥇' },
    { rank: 2, name: 'James Rivera', xp: 2410, streak: 9, change: '+1', medal: '🥈' },
    { rank: 3, name: 'Alex Chen', xp: 1980, streak: 21, change: '–', medal: '🥉' },
    { rank: 4, name: 'Maria Santos', xp: 1720, streak: 6, change: '-1', medal: null },
    { rank: 5, name: 'David Park', xp: 1540, streak: 3, change: '+2', medal: null },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0F0F0F',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: 100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '48px 64px 32px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            🏆
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600, letterSpacing: 1.5 }}>
              COMPETITION
            </span>
            <span style={{ color: '#F5F5F5', fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              Live Leaderboards
            </span>
          </div>
          <div style={{ display: 'flex', flex: 1 }} />
          {/* Week reset badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <span style={{ color: '#52525B', fontSize: 11, fontWeight: 500 }}>RESETS IN</span>
            <span style={{ color: '#F59E0B', fontSize: 22, fontWeight: 800 }}>3 days</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, padding: '0 64px', gap: 32 }}>
          {/* Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {/* Column headers */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                gap: 16,
              }}
            >
              <span style={{ color: '#3F3F46', fontSize: 11, fontWeight: 500, width: 32 }}>#</span>
              <span style={{ color: '#3F3F46', fontSize: 11, fontWeight: 500, flex: 1 }}>ADVISOR</span>
              <span style={{ color: '#3F3F46', fontSize: 11, fontWeight: 500, width: 80, textAlign: 'right' }}>STREAK</span>
              <span style={{ color: '#3F3F46', fontSize: 11, fontWeight: 500, width: 60, textAlign: 'center' }}>CHNG</span>
              <span style={{ color: '#3F3F46', fontSize: 11, fontWeight: 500, width: 90, textAlign: 'right' }}>XP</span>
            </div>

            {advisors.map((a) => (
              <div
                key={a.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: a.rank === 1 ? 'rgba(245,158,11,0.06)' : '#1C1C1C',
                  border: a.rank === 1 ? '1px solid rgba(245,158,11,0.2)' : '1px solid #2A2A2A',
                  borderRadius: 12,
                  padding: '14px 20px',
                  gap: 16,
                }}
              >
                {/* Rank */}
                <div style={{ display: 'flex', width: 32, alignItems: 'center', justifyContent: 'center' }}>
                  {a.medal ? (
                    <span style={{ fontSize: 20 }}>{a.medal}</span>
                  ) : (
                    <span style={{ color: '#52525B', fontSize: 16, fontWeight: 700 }}>{a.rank}</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: a.rank === 1 ? 'rgba(245,158,11,0.2)' : 'rgba(79,114,248,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: a.rank === 1 ? '#F59E0B' : '#4F72F8', fontSize: 15, fontWeight: 800 }}>
                      {a.name.charAt(0)}
                    </span>
                  </div>
                  <span style={{ color: a.rank <= 3 ? '#F5F5F5' : '#A1A1AA', fontSize: 15, fontWeight: a.rank === 1 ? 700 : 500 }}>
                    {a.name}
                  </span>
                </div>

                {/* Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 80, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ color: '#F97316', fontSize: 14, fontWeight: 700 }}>{a.streak}d</span>
                </div>

                {/* Change */}
                <div style={{ display: 'flex', width: 60, justifyContent: 'center' }}>
                  <span
                    style={{
                      color: a.change.startsWith('+') ? '#10B981' : a.change === '–' ? '#52525B' : '#F87171',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {a.change}
                  </span>
                </div>

                {/* XP */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, width: 90, justifyContent: 'flex-end' }}>
                  <span style={{ color: a.rank === 1 ? '#F59E0B' : '#4F72F8', fontSize: 20, fontWeight: 800 }}>
                    {a.xp.toLocaleString()}
                  </span>
                  <span style={{ color: '#52525B', fontSize: 11 }}>XP</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 220 }}>
            <span style={{ color: '#71717A', fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>
              TEAM STATS
            </span>

            {[
              { label: 'Active Advisors', value: '24', color: '#4F72F8' },
              { label: 'Total Team XP', value: '38.4K', color: '#F59E0B' },
              { label: 'Avg Streak', value: '8.2d', color: '#F97316' },
              { label: 'Top Performer', value: 'Sarah M.', color: '#10B981', small: true },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  backgroundColor: '#1C1C1C',
                  border: '1px solid #2A2A2A',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <span style={{ color: '#52525B', fontSize: 11, fontWeight: 500 }}>{stat.label}</span>
                <span style={{ color: stat.color, fontSize: stat.small ? 20 : 28, fontWeight: 800 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 64px',
            borderTop: '1px solid #1E1E1E',
          }}
        >
          <span style={{ color: '#3F3F46', fontSize: 13, fontWeight: 600 }}>Responsibly · responsibly.work</span>
          <span style={{ color: '#3F3F46', fontSize: 12 }}>Real-time rankings reset weekly · milestone celebrations included</span>
        </div>
      </div>
    ),
    { width: 1200, height: 780 },
  );
}
