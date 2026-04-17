import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Feature 4: Goal & KPI Tracking — 1200×780
export function GET() {
  const goals = [
    { name: 'Revenue Target', current: 850000, target: 1000000, unit: '$', suffix: 'K', color: '#10B981' },
    { name: 'Client Meetings', current: 42, target: 50, unit: '', suffix: '', color: '#4F72F8' },
    { name: 'New Clients', current: 8, target: 12, unit: '', suffix: '', color: '#8B5CF6' },
    { name: 'Pipeline Value', current: 2100000, target: 3000000, unit: '$', suffix: 'M', color: '#F59E0B' },
  ];

  function formatValue(val: number, unit: string, suffix: string): string {
    if (suffix === 'K') return `${unit}${(val / 1000).toFixed(0)}K`;
    if (suffix === 'M') return `${unit}${(val / 1000000).toFixed(1)}M`;
    return `${unit}${val}`;
  }

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
            bottom: -80,
            left: 100,
            width: 500,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
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
              backgroundColor: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            🎯
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600, letterSpacing: 1.5 }}>
              PERFORMANCE
            </span>
            <span style={{ color: '#F5F5F5', fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              Goal &amp; KPI Tracking
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex' }} />
          {/* Cycle badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <span style={{ color: '#52525B', fontSize: 11, fontWeight: 500 }}>CURRENT CYCLE</span>
            <span style={{ color: '#10B981', fontSize: 20, fontWeight: 800 }}>Q2 · 2025</span>
          </div>
        </div>

        {/* Goal cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '0 64px', flex: 1 }}>
          {goals.map((g) => {
            const pct = Math.round((g.current / g.target) * 100);
            return (
              <div
                key={g.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  backgroundColor: '#1C1C1C',
                  border: '1px solid #2A2A2A',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: g.color,
                        display: 'flex',
                        boxShadow: `0 0 8px ${g.color}80`,
                      }}
                    />
                    <span style={{ color: '#D4D4D8', fontSize: 16, fontWeight: 600 }}>{g.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ color: g.color, fontSize: 22, fontWeight: 800 }}>
                      {formatValue(g.current, g.unit, g.suffix)}
                    </span>
                    <span style={{ color: '#52525B', fontSize: 14 }}>
                      / {formatValue(g.target, g.unit, g.suffix)}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: `${g.color}18`,
                        border: `1px solid ${g.color}30`,
                        borderRadius: 999,
                        padding: '3px 10px',
                        marginLeft: 8,
                      }}
                    >
                      <span style={{ color: g.color, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    display: 'flex',
                    height: 8,
                    backgroundColor: '#2A2A2A',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: `${pct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${g.color}90 0%, ${g.color} 100%)`,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Bottom insight */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              backgroundColor: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 14,
              padding: '16px 24px',
            }}
          >
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ color: '#A1A1AA', fontSize: 14, fontWeight: 500 }}>
              At current pace, revenue goal will be met{' '}
              <span style={{ color: '#10B981', fontWeight: 700 }}>6 days ahead of schedule</span>
              . 3 advisors are below their personal targets — check Accountability tab.
            </span>
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
          <span style={{ color: '#3F3F46', fontSize: 12 }}>Individual &amp; team targets · revenue, pipeline &amp; activity KPIs</span>
        </div>
      </div>
    ),
    { width: 1200, height: 780 },
  );
}
