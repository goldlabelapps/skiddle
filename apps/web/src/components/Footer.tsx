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
            <ul className={styles.linkList}></ul>
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
                  href="https://promotioncentre.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Promotion Centre</span>
                  <ExternalIcon />
                </a>
              </li>
              <li className={styles.linkItem}>
                <a
                  href="/docs/React%20Developer%20Job%20Spec%20-%20Sep%2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Job Description</span>
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

