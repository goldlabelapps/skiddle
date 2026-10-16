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
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a
            href="https://promotioncentre.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#9ca3af',
              fontSize: 14,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Promotion Centre ↗
          </a>
          <a
            href="https://www.skiddle.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#9ca3af',
              fontSize: 14,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Skiddle.com ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
