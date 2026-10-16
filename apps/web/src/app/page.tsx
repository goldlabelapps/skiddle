import { ApiTester } from '../components/ApiTester/ApiTester';

export default function HomePage() {
  const apiKeyConfigured = Boolean(process.env.SKIDDLE_API_KEY);

  return (
    <main style={{ maxWidth: 1080, margin: '40px auto 80px', padding: '0 24px', lineHeight: 1.6, color: '#ffffff' }}>
      {/* MONOREPO HEADER BADGE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: apiKeyConfigured ? '#00d26a' : '#f59e0b',
            boxShadow: apiKeyConfigured ? '0 0 8px rgba(0, 210, 106, 0.6)' : 'none',
          }}
        />
        <span style={{ fontSize: 13, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>
          Skiddle Monorepo &bull; Turborepo &bull; Next.js 15
        </span>
      </div>

      <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5, color: '#ffffff' }}>
        Skiddle SDK Web Integration
      </h1>

      <p style={{ color: '#ffffff', fontSize: 17, marginBottom: 28, maxWidth: 840, opacity: 0.95 }}>
        This Next.js application consumes the shared workspace library <code style={{ color: '#38bdf8' }}>@skiddle/sdk</code> directly from{' '}
        <code style={{ color: '#38bdf8' }}>packages/sdk</code>. Test endpoints, construct fluent query conditions, and inspect live responses below.
      </p>

      {/* COMPREHENSIVE INTERACTIVE API TESTER */}
      <ApiTester />

      {/* ARCHITECTURE STATUS (AT THE BOTTOM) */}
      <div
        style={{
          marginTop: 48,
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: 10,
          padding: 24,
          color: '#ffffff',
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: '#ffffff' }}>
          Architecture Status
        </h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#ffffff' }}>
          <li>🚀 <strong style={{ color: '#ffffff' }}>Turborepo:</strong> Pipeline caching for build, test, and typecheck</li>
          <li>📦 <strong style={{ color: '#ffffff' }}>Workspace Package:</strong> <code style={{ color: '#38bdf8' }}>@skiddle/sdk</code> (TypeScript / Zero External Dependencies)</li>
          <li>⚡ <strong style={{ color: '#ffffff' }}>API Transport:</strong> Native <code>fetch</code> with dual v1/v3 endpoint routing</li>
          <li>🔑 <strong style={{ color: '#ffffff' }}>Environment API Key:</strong> {apiKeyConfigured ? <span style={{ color: '#00d26a', fontWeight: 600 }}>Configured & Loaded</span> : <span style={{ color: '#f59e0b', fontWeight: 600 }}>Offline / Enter Key Manually</span>}</li>
        </ul>
      </div>
    </main>
  );
}
