'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <div className={styles.brandLogoBox}>
                <Image
                  src="/skiddle-logo-light.svg"
                  alt="Skiddle"
                  width={28}
                  height={28}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className={styles.brandTitleGroup}>
                <span className={styles.brandTitle}>Skiddle Promos</span>
                <span className={styles.brandSubtitle}>Polyglot SDKs &bull; Live API Ready</span>
              </div>
            </div>
            <p className={styles.brandDescription}>
              Modern TypeScript, live Skiddle event discovery, Promo pages, and zero-onboarding developer workflows via the NX&deg; CLI.
            </p>
          </div>

          {/* Candidate */}
          <div>
            <h4 className={styles.columnTitle}>Candidate</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/sdk">
                  <span className={styles.linkIcon}>
                    <CodeIcon />
                  </span>
                  <span>SDK Explorer</span>
                </Link>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://promotioncentre.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.linkIcon}>
                    <SparklesIcon />
                  </span>
                  <span>Promotion Centre</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://www.skiddle.com/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.linkIcon}>
                    <BookIcon />
                  </span>
                  <span>API Documentation</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://github.com/listingslab/skiddle"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.linkIcon}>
                    <TerminalIcon />
                  </span>
                  <span>Monorepo Source</span>
                  <ExternalIcon />
                </a>
              </li>
            </ul>
          </div>

          {/* Skiddle */}
          <div>
            <h4 className={styles.columnTitle}>Skiddle</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a
                  href="https://www.skiddle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Skiddle.com</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://www.skiddle.com/whats-on/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>What&apos;s On Guide</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://www.skiddle.com/festivals/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Festivals Guide</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="https://promotioncentre.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Promotion Centre</span>
                  <ExternalIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <Link href="/" className={styles.copyright}>
            &copy; 2026 Goldlabel
          </Link>

          <button
            type="button"
            onClick={scrollToTop}
            className={styles.backToTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      className={styles.externalIcon}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
