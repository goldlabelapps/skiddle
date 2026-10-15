import { createClient } from '@skiddle/sdk';

export default function HomePage() {
  const apiKeyConfigured = Boolean(process.env.SKIDDLE_API_KEY);

  return (
    <main style={{ maxWidth: 860, margin: '60px auto', padding: '0 24px', lineHeight: 1.6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: apiKeyConfigured ? '#00d26a' : '#f59e0b',
          }}
        />
        <span style={{ fontSize: 14, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
          Skiddle Monorepo &bull; Turborepo
        </span>
      </div>

      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
        Next.js App + Turborepo + @skiddle/sdk
      </h1>

      <p style={{ color: '#9ca3af', fontSize: 18, marginBottom: 32 }}>
        This Next.js application consumes the shared workspace library <code>@skiddle/sdk</code> directly from <code>packages/sdk</code>.
      </p>

      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Architecture Status</h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>🚀 <strong>Turborepo:</strong> Configured with caching for build, test, and typecheck</li>
          <li>📦 <strong>Workspace Packages:</strong> <code>packages/sdk</code> (<code>@skiddle/sdk</code>)</li>
          <li>📱 <strong>Applications:</strong> <code>apps/web</code> (Next.js 15), <code>apps/cli</code> (<code>@skiddle/cli</code>)</li>
          <li>🔑 <strong>Skiddle API Key:</strong> {apiKeyConfigured ? 'Configured in Environment' : 'Not set (mock / offline mode ready)'}</li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <h3 style={{ fontSize: 16, color: '#9ca3af', marginBottom: 8 }}>Quick SDK Usage</h3>
        <pre
          style={{
            backgroundColor: '#05070d',
            padding: 16,
            borderRadius: 6,
            overflowX: 'auto',
            fontSize: 14,
            color: '#34d399',
          }}
        >
          {`import { createClient } from '@skiddle/sdk';

const skiddle = createClient({ apiKey: process.env.SKIDDLE_API_KEY });
const events = await skiddle.events.get({ keyword: 'Festival' });`}
        </pre>
      </div>
    </main>
  );
}
