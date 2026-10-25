import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px',
        boxSizing: 'border-box',
      }}
    >
      <Link
        href="/sdk"
        role="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00d26a',
          color: '#052e16',
          fontWeight: 700,
          fontSize: 16,
          padding: '14px 28px',
          borderRadius: 8,
          textDecoration: 'none',
          boxShadow: '0 2px 10px rgba(0, 210, 106, 0.25)',
          transition: 'all 0.2s ease',
        }}
      >
        Skiddle SDK
      </Link>
    </main>
  );
}
