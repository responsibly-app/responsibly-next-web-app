import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Feature 1: Zoom Meeting Feed — 1200×780
export function GET() {
  const meetings = [
    { title: 'Weekly Team Sync', time: 'Today · 2:00 PM', duration: '60 min', attendees: 8, xp: 50 },
    { title: 'Client Review: Johnson Family', time: 'Today · 3:30 PM', duration: '45 min', attendees: 3, xp: 75 },
    { title: 'New Advisor Onboarding', time: 'Tomorrow · 10:00 AM', duration: '30 min', attendees: 5, xp: 40 },
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
            top: -80,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '48px 64px 32px',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            📹
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#8B5CF6', fontSize: 13, fontWeight: 600, letterSpacing: 1.5 }}>
              ZOOM INTEGRATION
            </span>
            <span style={{ color: '#F5F5F5', fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              Meeting Feed &amp; Attendance
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, padding: '0 64px', gap: 32 }}>
          {/* Meeting list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#71717A', fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>
                UPCOMING MEETINGS
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 999,
                  padding: '4px 12px',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'flex' }} />
                <span style={{ color: '#10B981', fontSize: 11, fontWeight: 600 }}>LIVE SYNC</span>
              </div>
            </div>

            {meetings.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1C1C1C',
                  border: '1px solid #2A2A2A',
                  borderRadius: 14,
                  padding: '20px 24px',
                  gap: 20,
                }}
              >
                {/* Time badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    backgroundColor: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#8B5CF6', fontSize: 10, fontWeight: 700 }}>ZOOM</span>
                  <span style={{ color: '#C4B5FD', fontSize: 9, fontWeight: 500 }}>{m.duration}</span>
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                  <span style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700 }}>{m.title}</span>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#71717A', fontSize: 13 }}>{m.time}</span>
                    <span style={{ color: '#52525B', fontSize: 13 }}>· {m.attendees} attendees</span>
                  </div>
                </div>

                {/* XP badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: 'rgba(79,114,248,0.12)',
                    border: '1px solid rgba(79,114,248,0.25)',
                    borderRadius: 999,
                    padding: '6px 14px',
                  }}
                >
                  <span style={{ color: '#4F72F8', fontSize: 13, fontWeight: 700 }}>+{m.xp} XP</span>
                </div>

                {/* Join button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#8B5CF6',
                    borderRadius: 8,
                    padding: '8px 18px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Join</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 220 }}>
            <span style={{ color: '#71717A', fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>
              THIS WEEK
            </span>

            {[
              { label: 'Meetings Attended', value: '12', color: '#8B5CF6' },
              { label: 'XP from Meetings', value: '680', suffix: 'XP', color: '#4F72F8' },
              { label: 'Attendance Rate', value: '94', suffix: '%', color: '#10B981' },
              { label: 'Avg Join Time', value: '-2', suffix: 'min early', color: '#F59E0B' },
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ color: stat.color, fontSize: 28, fontWeight: 800 }}>{stat.value}</span>
                  {stat.suffix && (
                    <span style={{ color: stat.color, fontSize: 12, fontWeight: 600, opacity: 0.7 }}>{stat.suffix}</span>
                  )}
                </div>
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
          <span style={{ color: '#3F3F46', fontSize: 12 }}>Automatic meeting tracking via Zoom OAuth</span>
        </div>
      </div>
    ),
    { width: 1200, height: 780 },
  );
}
