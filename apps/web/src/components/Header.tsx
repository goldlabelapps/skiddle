import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid #1f2937',
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Link
          href="/"
          id="logo"
          aria-label="Skiddle Homepage"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Image
            src="/skiddle-logo-white.svg"
            alt="Skiddle Logo"
            width={111}
            height={40}
            priority
            style={{
              height: 28,
              width: 'auto',
              display: 'block',
            }}
          />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link
            href="/sdk"
            style={{
              color: '#ffffff',
              fontSize: 14,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            @skiddle/sdk
          </Link>
        </nav>
      </div>
    </header>
  );
}
