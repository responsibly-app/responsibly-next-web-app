import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0F0F0F',
          padding: '0 72px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue glow blob */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: 240,
            width: 500,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,114,248,0.12) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: 160,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #4F72F8 30%, #8B5CF6 70%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Logo + Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4F72F8 0%, #6B46F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(79,114,248,0.4)',
            }}
          >
            <span style={{ color: 'white', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>R</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ color: '#F5F5F5', fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
              Responsibly
            </span>
            <span style={{ color: '#52525B', fontSize: 12, fontWeight: 500, letterSpacing: 0.5 }}>
              responsibly.work
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 52,
            backgroundColor: '#2A2A2A',
            marginLeft: 40,
            marginRight: 40,
            flexShrink: 0,
            display: 'flex',
          }}
        />

        {/* Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
          <span style={{ color: '#F5F5F5', fontSize: 21, fontWeight: 700, letterSpacing: -0.3 }}>
            Performance Management for Financial Agencies
          </span>
          <span style={{ color: '#71717A', fontSize: 13, fontWeight: 400 }}>
            Turn accountability into your agency's biggest competitive edge — powered by gamification &amp; real-time analytics
          </span>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, marginLeft: 32 }}>
          {[
            { label: 'XP Engine', color: '#4F72F8', bg: 'rgba(79,114,248,0.12)', border: 'rgba(79,114,248,0.3)' },
            { label: 'Leaderboards', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
            { label: 'Goal Tracking', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
            { label: 'Zoom Integration', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: pill.bg,
                border: `1px solid ${pill.border}`,
                borderRadius: 999,
                padding: '7px 15px',
              }}
            >
              <span style={{ color: pill.color, fontSize: 12, fontWeight: 600 }}>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1824, height: 176 },
  );
}
