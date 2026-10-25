import { ApiTester } from '../../components/ApiTester/ApiTester';

export default function SdkPage() {
  const apiKeyConfigured = Boolean(process.env.SKIDDLE_API_KEY);

  return (
    <main
      style={{
        maxWidth: 1080,
        width: '100%',
        margin: '32px auto 80px',
        padding: '0 16px',
        lineHeight: 1.6,
        color: '#0f172a',
        boxSizing: 'border-box',
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* MONOREPO HEADER BADGE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: apiKeyConfigured ? '#00d26a' : '#f59e0b',
            boxShadow: apiKeyConfigured ? '0 0 8px rgba(0, 210, 106, 0.4)' : 'none',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, wordBreak: 'break-word' }}>
          Skiddle Monorepo &bull; Turborepo &bull; Next.js 15
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, marginBottom: 12, letterSpacing: -0.5, color: '#0f172a', wordBreak: 'break-word' }}>
        Skiddle SDK
      </h1>

      <p style={{ color: '#475569', fontSize: 'clamp(15px, 3.5vw, 17px)', marginBottom: 28, maxWidth: 840, lineHeight: 1.6, wordBreak: 'break-word' }}>
        This Next.js application consumes the shared workspace library <code style={{ color: '#0284c7', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, wordBreak: 'break-word' }}>@skiddle/sdk</code> directly from{' '}
        <code style={{ color: '#0284c7', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, wordBreak: 'break-word' }}>packages/sdk</code>. Test endpoints, construct fluent query conditions, and inspect live responses below.
      </p>

      {/* COMPREHENSIVE INTERACTIVE API TESTER */}
      <ApiTester />
    </main>
  );
}
