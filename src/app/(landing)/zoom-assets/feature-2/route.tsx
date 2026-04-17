import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Feature 2: XP & Points Engine — 1200×780
export function GET() {
  const events = [
    { action: 'Closed Deal', xp: 150, time: '2m ago', category: 'DEAL' },
    { action: 'Client Meeting Attended', xp: 75, time: '18m ago', category: 'MEETING' },
    { action: 'Weekly Check-in Submitted', xp: 25, time: '1h ago', category: 'CHECK-IN' },
    { action: 'Referral Submitted', xp: 30, time: '3h ago', category: 'REFERRAL' },
    { action: 'Daily Streak Maintained', xp: 10, time: '8h ago', category: 'STREAK' },
  ];

  const categoryColors: Record<string, string> = {
    DEAL: '#10B981',
    MEETING: '#8B5CF6',
    'CHECK-IN': '#4F72F8',
    REFERRAL: '#F59E0B',
    STREAK: '#F97316',
  };

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
            left: -60,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,114,248,0.08) 0%, transparent 70%)',
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
              backgroundColor: 'rgba(79,114,248,0.15)',
              border: '1px solid rgba(79,114,248,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#4F72F8', fontSize: 13, fontWeight: 600, letterSpacing: 1.5 }}>
              GAMIFICATION
            </span>
            <span style={{ color: '#F5F5F5', fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              XP &amp; Points Engine
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, padding: '0 64px', gap: 32 }}>
          {/* Activity feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <span style={{ color: '#71717A', fontSize: 13, fontWeight: 500, letterSpacing: 0.5, marginBottom: 4 }}>
              LIVE XP FEED · SARAH MITCHELL
            </span>

            {events.map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1C1C1C',
                  border: '1px solid #2A2A2A',
                  borderRadius: 12,
                  padding: '16px 20px',
                  gap: 16,
                }}
              >
                {/* Category pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 6,
                    padding: '4px 8px',
                    backgroundColor: `${categoryColors[e.category]}18`,
                    border: `1px solid ${categoryColors[e.category]}30`,
                    minWidth: 72,
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: categoryColors[e.category], fontSize: 10, fontWeight: 700 }}>
                    {e.category}
                  </span>
                </div>

                <span style={{ color: '#D4D4D8', fontSize: 15, fontWeight: 500, flex: 1 }}>{e.action}</span>

                <span style={{ color: '#52525B', fontSize: 12, flexShrink: 0 }}>{e.time}</span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#4F72F8', fontSize: 18, fontWeight: 800 }}>+{e.xp}</span>
                  <span style={{ color: '#4F72F8', fontSize: 11, fontWeight: 600, opacity: 0.7 }}>XP</span>
                </div>
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                color: '#52525B',
                fontSize: 12,
              }}
            >
              + 47 more events this week
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 240 }}>
            {/* Total XP */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                backgroundColor: 'rgba(79,114,248,0.08)',
                border: '1px solid rgba(79,114,248,0.2)',
                borderRadius: 16,
                padding: '24px 20px',
              }}
            >
              <span style={{ color: '#71717A', fontSize: 12, fontWeight: 500 }}>TOTAL XP THIS WEEK</span>
              <span style={{ color: '#4F72F8', fontSize: 52, fontWeight: 900, letterSpacing: -2 }}>2,840</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 999,
                  padding: '4px 10px',
                }}
              >
                <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>↑ 18% vs last week</span>
              </div>
            </div>

            {/* Custom rules */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
                borderRadius: 16,
                padding: '20px',
              }}
            >
              <span style={{ color: '#71717A', fontSize: 12, fontWeight: 500 }}>CUSTOM POINT RULES</span>
              {[
                { rule: 'Closed Deal', pts: '100–200 XP' },
                { rule: 'Client Meeting', pts: '50–75 XP' },
                { rule: 'Check-in', pts: '10–25 XP' },
              ].map((r) => (
                <div key={r.rule} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#A1A1AA', fontSize: 13 }}>{r.rule}</span>
                  <span style={{ color: '#4F72F8', fontSize: 13, fontWeight: 700 }}>{r.pts}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  padding: '8px 0 0',
                  borderTop: '1px solid #2A2A2A',
                }}
              >
                <span style={{ color: '#52525B', fontSize: 11 }}>Fully configurable per agency</span>
              </div>
            </div>
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
          <span style={{ color: '#3F3F46', fontSize: 12 }}>Zoom meetings automatically earn XP for your advisors</span>
        </div>
      </div>
    ),
    { width: 1200, height: 780 },
  );
}
