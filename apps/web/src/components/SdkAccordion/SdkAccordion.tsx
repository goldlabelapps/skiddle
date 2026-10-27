'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Code2,
  FileText,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import styles from './SdkAccordion.module.css';

interface AccordionSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export function SdkAccordion() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'what-is-this': false,
    'php-port': false,
    'api-quirks': false,
    docs: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections: AccordionSection[] = [
    {
      id: 'what-is-this',
      icon: <Layers size={18} />,
      title: 'What You Are Looking At',
      subtitle: 'Next.js 15 App Router test harness executing @skiddle/sdk',
      content: (
        <div>
          <p>
            You are looking at an interactive developer harness that demonstrates{' '}
            <code className={styles.codeBadge}>@skiddle/sdk</code> running inside a production Next.js 15
            application with React 19.
          </p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>Zero Browser CORS & Credential Isolation:</strong> API queries are routed through
                secure Next.js Server Actions (<code className={styles.codeBadge}>executeSkiddleQuery</code>
                ). The browser never exposes your secret{' '}
                <code className={styles.codeBadge}>SKIDDLE_API_KEY</code>, and third-party CORS limitations are
                completely avoided.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>Live Fluent Query Construction:</strong> Directly tests the SDK&apos;s condition
                methods (<code className={styles.codeBadge}>addCond</code>,{' '}
                <code className={styles.codeBadge}>delCond</code>,{' '}
                <code className={styles.codeBadge}>getConditions</code>, and{' '}
                <code className={styles.codeBadge}>clearConditions</code>) against live Skiddle endpoints.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>Full Observability:</strong> Real-time latency tracking (ms), HTTP response headers,
                curl command generator, and structured error payloads via{' '}
                <code className={styles.codeBadge}>SkiddleException</code>.
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'php-port',
      icon: <Code2 size={18} />,
      title: 'Porting the PHP SDK to JavaScript / TypeScript',
      subtitle: 'Preserving object-oriented ergonomics with native modern Web APIs',
      content: (
        <div>
          <p>
            The official Skiddle PHP SDK (<code className={styles.codeBadge}>SkiddleSDK\...</code> in{' '}
            <code className={styles.codeBadge}>php/src/</code>) provided a battle-tested object-oriented API
            using curl and fluent condition builders. We ported this entire codebase into TypeScript (
            <code className={styles.codeBadge}>packages/sdk/src/</code>) with 1:1 architectural parity:
          </p>
          <div className={styles.tableContainer}>
            <table className={styles.mappingTable}>
              <thead>
                <tr>
                  <th>PHP Class</th>
                  <th>TypeScript Module</th>
                  <th>Modern Architecture & Enhancements</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>SkiddleSession.php</code></td>
                  <td><code>session.ts</code></td>
                  <td>Immutable API key resolution from options or <code>SKIDDLE_API_KEY</code> environment variable.</td>
                </tr>
                <tr>
                  <td><code>SkiddleRequest.php</code></td>
                  <td><code>request.ts</code></td>
                  <td>Native <code>fetch</code> with zero external dependencies. Routes between v1 and v3 endpoints.</td>
                </tr>
                <tr>
                  <td><code>SkiddleBase.php</code></td>
                  <td><code>base.ts</code></td>
                  <td>Fluent condition builder (<code>addCond</code>, <code>delCond</code>, <code>clearConditions</code>).</td>
                </tr>
                <tr>
                  <td><code>SkiddleException.php</code></td>
                  <td><code>errors.ts</code></td>
                  <td>Unified exception handling normalizing v1 error codes and v3 RFC problem details.</td>
                </tr>
                <tr>
                  <td><code>Events.php</code>, <code>Artists.php</code>, <code>Venues.php</code></td>
                  <td><code>events.ts</code>, <code>artists.ts</code>, <code>venues.ts</code></td>
                  <td>Strongly typed TypeScript resource interfaces, pagination contracts, and event models.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Like the PHP version, query conditions can be chained fluently:
            <br />
            <code className={styles.codeBadge}>
              client.events.addCond(&apos;keyword&apos;, &apos;Warehouse&apos;).addCond(&apos;limit&apos;, 10)
            </code>
          </p>
        </div>
      ),
    },
    {
      id: 'api-quirks',
      icon: <Zap size={18} />,
      title: 'Handling Skiddle API Quirks & Packaging',
      subtitle: 'v1/v3 key transformations, uppercase requirements, and dual ESM/CJS builds',
      content: (
        <div>
          <p>
            During the port from PHP, we accounted for key differences and quirks across Skiddle&apos;s API
            versions:
          </p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>API Key Case Transformation:</strong> Skiddle v1 endpoints require snake_case{' '}
                <code className={styles.codeBadge}>api_key</code>, while v3 requires camelCase{' '}
                <code className={styles.codeBadge}>apiKey</code>. The SDK&apos;s{' '}
                <code className={styles.codeBadge}>SkiddleRequest</code> automatically transforms keys based
                on the target endpoint version.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>Uppercase Event Code Requirement:</strong> Skiddle&apos;s backend strictly expects category
                codes like <code className={styles.codeBadge}>LIVE</code>,{' '}
                <code className={styles.codeBadge}>CLUB</code>, and{' '}
                <code className={styles.codeBadge}>COMEDY</code> in uppercase. The SDK normalizes this automatically.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <div>
                <strong>Dual ESM & CommonJS Bundling:</strong> Built via <code className={styles.codeBadge}>tsup</code>{' '}
                into dual <code className={styles.codeBadge}>dist/index.js</code> (ESM) and{' '}
                <code className={styles.codeBadge}>dist/index.cjs</code> (CJS) with generated{' '}
                <code className={styles.codeBadge}>.d.ts</code> declarations, ensuring compatibility across both
                modern bundlers and legacy Node runtimes.
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'docs',
      icon: <FileText size={18} />,
      title: 'Architecture Documentation & References',
      subtitle: 'Comprehensive architectural decision records in the docs/ folder',
      content: (
        <div>
          <p>
            For deep dives into the implementation and engineering decisions, refer to the documentation
            in the monorepo root:
          </p>
          <div className={styles.docLinksGrid}>
            <div className={styles.docLinkCard}>
              <span className={styles.docLinkTitle}>
                <BookOpen size={14} color="#00d26a" /> 03 — SDK Port Architecture
              </span>
              <span className={styles.docLinkDesc}>
                Detailed PHP class to TypeScript module mapping and feature parity analysis.
              </span>
            </div>
            <div className={styles.docLinkCard}>
              <span className={styles.docLinkTitle}>
                <BookOpen size={14} color="#00d26a" /> 08 — API v3 Compatibility
              </span>
              <span className={styles.docLinkDesc}>
                Instant-search routing, pagination envelopes, and backwards compatibility.
              </span>
            </div>
            <div className={styles.docLinkCard}>
              <span className={styles.docLinkTitle}>
                <BookOpen size={14} color="#00d26a" /> 10 — API Tester Component
              </span>
              <span className={styles.docLinkDesc}>
                Next.js 15 Server Actions architecture and client-side testing harness.
              </span>
            </div>
            <div className={styles.docLinkCard}>
              <span className={styles.docLinkTitle}>
                <BookOpen size={14} color="#00d26a" /> 12 — TDD Suite & CI/CD
              </span>
              <span className={styles.docLinkDesc}>
                Vitest unit and mock testing strategy ensuring 100% network isolation.
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container} data-testid="sdk-accordion">
      {sections.map((section) => {
        const isOpen = Boolean(openSections[section.id]);
        return (
          <div key={section.id} className={styles.accordionItem}>
            <button
              type="button"
              className={styles.headerButton}
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${section.id}`}
            >
              <div className={styles.headerLeft}>
                <div className={styles.iconWrapper}>{section.icon}</div>
                <div className={styles.headerTitleBlock}>
                  <span className={styles.headerTitle}>{section.title}</span>
                  <span className={styles.headerSubtitle}>{section.subtitle}</span>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div
                id={`accordion-content-${section.id}`}
                className={styles.contentWrapper}
                role="region"
                aria-labelledby={`accordion-header-${section.id}`}
              >
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
