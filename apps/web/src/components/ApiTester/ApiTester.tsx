'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { executeSkiddleQuery, checkServerConfig, QueryResult } from '../../app/actions';
import styles from './ApiTester.module.css';

type ResourceType = 'events' | 'event-single' | 'venues' | 'artists';

const EVENT_CODES = [
  { value: '', label: 'All Event Codes' },
  { value: 'LIVE', label: 'LIVE (Live Music)' },
  { value: 'CLUB', label: 'CLUB (Club Nights)' },
  { value: 'FEST', label: 'FEST (Festivals)' },
  { value: 'COMEDY', label: 'COMEDY (Comedy)' },
  { value: 'THEATRE', label: 'THEATRE (Theatre)' },
  { value: 'SPORT', label: 'SPORT (Sports)' },
  { value: 'KIDS', label: 'KIDS (Kids/Family)' },
  { value: 'EXHIB', label: 'EXHIB (Exhibitions)' },
];

export function ApiTester() {
  const [activeTab, setActiveTab] = useState<ResourceType>('events');
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean>(true);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [devMode, setDevMode] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'json' | 'debug'>('cards');
  const [copied, setCopied] = useState<boolean>(false);

  // Conditions state mirroring SDK addCond / delCond / clearConditions
  const [conditions, setConditions] = useState<Record<string, string>>({
    keyword: 'Manchester',
    eventCode: 'LIVE',
    limit: '6',
  });
  const [singleId, setSingleId] = useState<string>('42616476');
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [customValInput, setCustomValInput] = useState<string>('');

  // Result & loading states
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check server configuration on mount
  useEffect(() => {
    checkServerConfig().then((cfg) => {
      setHasServerApiKey(cfg.hasServerApiKey);
    });
  }, []);

  const runQueryWithParams = useCallback(
    (
      res: ResourceType,
      conds: Record<string, string>,
      idVal?: string,
      overrideKey?: string
    ) => {
      startTransition(async () => {
        const queryRes = await executeSkiddleQuery({
          resource: res,
          conditions: conds,
          singleId: idVal,
          apiKey: overrideKey !== undefined ? overrideKey : customApiKey,
          devMode,
        });
        setResult(queryRes);
      });
    },
    [customApiKey, devMode]
  );

  // Auto-run initial query once mounted
  useEffect(() => {
    runQueryWithParams('events', { keyword: 'Manchester', eventCode: 'LIVE', limit: '6' });
  }, [runQueryWithParams]);

  // Tab change handler
  const handleTabChange = (tab: ResourceType) => {
    setActiveTab(tab);
    if (tab === 'events') {
      const newConds = { keyword: 'Festival', eventCode: 'FEST', limit: '6' };
      setConditions(newConds);
      runQueryWithParams('events', newConds);
    } else if (tab === 'event-single') {
      const id = '42616476';
      setSingleId(id);
      runQueryWithParams('event-single', {}, id);
    } else if (tab === 'venues') {
      const newConds = { keyword: 'Manchester', limit: '6' };
      setConditions(newConds);
      runQueryWithParams('venues', newConds);
    } else if (tab === 'artists') {
      const newConds = { keyword: 'Bicep', limit: '6' };
      setConditions(newConds);
      runQueryWithParams('artists', newConds);
    }
  };

  // Condition builders
  const handleAddCustomCond = () => {
    if (!customKeyInput.trim()) return;
    setConditions((prev) => ({
      ...prev,
      [customKeyInput.trim()]: customValInput.trim(),
    }));
    setCustomKeyInput('');
    setCustomValInput('');
  };

  const handleRemoveCond = (key: string) => {
    setConditions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleClearConditions = () => {
    setConditions({});
  };

  const handleRunCurrent = () => {
    runQueryWithParams(activeTab, conditions, singleId);
  };

  const handlePreset = (
    res: ResourceType,
    conds: Record<string, string>,
    idVal?: string
  ) => {
    setActiveTab(res);
    setConditions(conds);
    if (idVal) setSingleId(idVal);
    runQueryWithParams(res, conds, idVal);
  };

  const handleTestInvalidKey = () => {
    runQueryWithParams(activeTab, conditions, singleId, 'invalid_test_api_key_12345');
  };

  const handleCopyJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to extract items array from result data
  const extractItems = (): any[] => {
    if (!result || !result.data) return [];
    if (Array.isArray(result.data.data)) return result.data.data; // v3 instant-search
    if (Array.isArray(result.data.results)) return result.data.results; // v1 array
    if (result.data.results && typeof result.data.results === 'object') {
      return [result.data.results]; // single item
    }
    return [];
  };

  const items = extractItems();
  const totalCount =
    result?.data?.meta?.totalEvents ??
    result?.data?.totalcount ??
    result?.data?.totalresults ??
    items.length;

  return (
    <div className={styles.container}>
      {/* PANEL */}
      <section className={styles.panel}>
        {/* PANEL HEADER */}
        <div className={styles.panelHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.panelTitle}>
              <span>⚡</span> Skiddle SDK Live API Explorer
            </h2>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>
              @skiddle/sdk
            </span>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>
              {activeTab === 'events' ? 'API v3 Instant Search' : 'API v1'}
            </span>
          </div>

          <div className={styles.statusIndicator}>
            <div
              className={styles.statusDot}
              style={{
                backgroundColor: result?.success
                  ? '#00d26a'
                  : result
                  ? '#ef4444'
                  : '#f59e0b',
              }}
            />
            <span>
              {result?.success
                ? `Active & Verified (${result.executionTimeMs}ms)`
                : isPending
                ? 'Calling API via SDK...'
                : hasServerApiKey
                ? 'Server Key Configured'
                : 'No API Key Set'}
            </span>
          </div>
        </div>

        {/* PRESET SHORTCUTS */}
        <div className={styles.presetsSection}>
          <span className={styles.presetLabel}>Quick Integration Demonstrations:</span>
          <div className={styles.presetButtons}>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() =>
                handlePreset('events', { keyword: 'Manchester', eventCode: 'LIVE', limit: '6' })
              }
            >
              🎸 Manchester Live
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() =>
                handlePreset('events', { keyword: 'Festival', eventCode: 'FEST', limit: '6' })
              }
            >
              🎪 UK Festivals
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() =>
                handlePreset('events', { keyword: 'Creamfields', limit: '4' })
              }
            >
              🎧 Creamfields
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('event-single', {}, '42616476')}
            >
              🏛️ Event ID #42616476
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() =>
                handlePreset('venues', { keyword: 'Manchester', limit: '6' })
              }
            >
              📍 Manchester Venues
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() =>
                handlePreset('artists', { keyword: 'Bicep', limit: '6' })
              }
            >
              🎤 Artists Search
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              style={{ borderColor: '#ef4444', color: '#fca5a5' }}
              onClick={handleTestInvalidKey}
              title="Deliberately send an invalid API key to demonstrate SkiddleException error catching"
            >
              ⚠️ Test Error Handling
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('events')}
          >
            Events (v3 Instant Search)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'event-single' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('event-single')}
          >
            Single Event Lookup (v1)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'venues' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('venues')}
          >
            Venues Directory (v1)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'artists' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('artists')}
          >
            Artists Directory (v1)
          </button>
        </div>

        {/* CONTROLS GRID */}
        {activeTab !== 'event-single' ? (
          <div className={styles.controlsGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Keyword / Search Query</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Manchester, Festival, Techno"
                value={conditions.keyword || ''}
                onChange={(e) =>
                  setConditions((prev) => ({ ...prev, keyword: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleRunCurrent()}
              />
            </div>

            {activeTab === 'events' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Event Code Filter</label>
                <select
                  className={styles.select}
                  value={conditions.eventCode || ''}
                  onChange={(e) =>
                    setConditions((prev) => ({ ...prev, eventCode: e.target.value }))
                  }
                >
                  {EVENT_CODES.map((ec) => (
                    <option key={ec.value} value={ec.value}>
                      {ec.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Result Limit</label>
              <input
                type="number"
                className={styles.input}
                min={1}
                max={20}
                value={conditions.limit || '6'}
                onChange={(e) =>
                  setConditions((prev) => ({ ...prev, limit: e.target.value }))
                }
              />
            </div>

            {/* Custom Condition Add */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Fluent Condition (addCond)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="key (e.g. radius)"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="value (e.g. 10)"
                  value={customValInput}
                  onChange={(e) => setCustomValInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleAddCustomCond}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.controlsGrid}>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Event / Listing ID</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 42616476"
                  value={singleId}
                  onChange={(e) => setSingleId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCurrent()}
                  style={{ maxWidth: 360 }}
                />
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => {
                    setSingleId('42616476');
                    runQueryWithParams('event-single', {}, '42616476');
                  }}
                >
                  Use Stoller Hall ID (42616476)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE CONDITIONS DISPLAY */}
        {activeTab !== 'event-single' && (
          <div className={styles.conditionsBar}>
            <div className={styles.conditionChips}>
              <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 700 }}>
                SDK Conditions Map:
              </span>
              {Object.keys(conditions).length === 0 ? (
                <span className={styles.noConditionsText}>
                  No active conditions (fetching unfiltered listings)
                </span>
              ) : (
                Object.entries(conditions).map(([k, v]) => (
                  <div key={k} className={styles.conditionChip}>
                    <span>
                      <strong>{k}</strong>: &quot;{v}&quot;
                    </span>
                    <button
                      type="button"
                      className={styles.removeChipBtn}
                      onClick={() => handleRemoveCond(k)}
                      title={`Remove condition ${k} (delCond)`}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>

            {Object.keys(conditions).length > 0 && (
              <button
                type="button"
                className={styles.clearCondBtn}
                onClick={handleClearConditions}
                title="Clear all conditions (clearConditions)"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* ACTION ROW */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleRunCurrent}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className={styles.spinner} />
                Executing SDK Call...
              </>
            ) : (
              <>
                <span>▶</span> Execute SDK Query
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.configToggle}
            onClick={() => setShowConfig(!showConfig)}
          >
            ⚙️ {showConfig ? 'Hide SDK Config' : 'Configure API Key & Dev Mode'}
          </button>
        </div>

        {/* ADVANCED CONFIG SECTION */}
        {showConfig && (
          <div className={styles.configSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Custom API Key (Leave empty to use server environment key)
              </label>
              <input
                type="password"
                className={styles.input}
                placeholder={
                  hasServerApiKey
                    ? 'Using server SKIDDLE_API_KEY environment variable'
                    : 'Paste your Skiddle API Key here'
                }
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="devModeCheck"
                checked={devMode}
                onChange={(e) => setDevMode(e.target.checked)}
              />
              <label htmlFor="devModeCheck" style={{ fontSize: 13, color: '#ffffff' }}>
                Enable Dev Mode (captures full debug traces and execution metrics)
              </label>
            </div>
          </div>
        )}
      </section>

      {/* ERROR BANNER */}
      {result && !result.success && (
        <div className={styles.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span>❌</span> SkiddleException Caught (HTTP Code: {result.errorCode ?? 500})
          </div>
          <div>{result.error}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            Executed via <code>@skiddle/sdk</code> in {result.executionTimeMs}ms
          </div>
        </div>
      )}

      {/* TELEMETRY & RESULTS */}
      {result && result.success && (
        <section className={styles.panel}>
          {/* TELEMETRY BAR */}
          <div className={styles.telemetryBar}>
            <div className={styles.telemetryItem}>
              <span>Status:</span>
              <span className={styles.telemetryValue} style={{ color: '#00d26a' }}>
                200 OK
              </span>
            </div>
            <div className={styles.telemetryItem}>
              <span>Latency:</span>
              <span className={styles.telemetryValue}>{result.executionTimeMs} ms</span>
            </div>
            <div className={styles.telemetryItem}>
              <span>Results Found:</span>
              <span className={styles.telemetryValue}>{totalCount}</span>
            </div>
            <div className={styles.telemetryItem}>
              <span>Endpoint:</span>
              <span className={styles.telemetryValue} style={{ color: '#38bdf8' }}>
                {activeTab === 'events'
                  ? '/events/instant-search/ (v3)'
                  : activeTab === 'event-single'
                  ? `/events/${singleId}/ (v1)`
                  : activeTab === 'venues'
                  ? '/venues/ (v1)'
                  : '/artists/ (v1)'}
              </span>
            </div>
          </div>

          {/* RESULTS HEADER & VIEW TOGGLES */}
          <div className={styles.resultsHeader} style={{ marginTop: 20 }}>
            <h3 className={styles.resultsTitle}>
              API Results ({items.length} {items.length === 1 ? 'item' : 'items'} displayed)
            </h3>
            <div className={styles.viewModeToggle}>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${
                  viewMode === 'cards' ? styles.viewModeBtnActive : ''
                }`}
                onClick={() => setViewMode('cards')}
              >
                Cards View
              </button>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${
                  viewMode === 'json' ? styles.viewModeBtnActive : ''
                }`}
                onClick={() => setViewMode('json')}
              >
                Raw JSON
              </button>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${
                  viewMode === 'debug' ? styles.viewModeBtnActive : ''
                }`}
                onClick={() => setViewMode('debug')}
              >
                SDK Debug Trace ({result.debugInfo?.length || 0})
              </button>
            </div>
          </div>

          {/* VIEW: CARDS */}
          {viewMode === 'cards' && (
            <>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  No items matched your current search conditions.
                </div>
              ) : (
                <div className={styles.cardsGrid}>
                  {items.map((item: any, idx: number) => {
                    const title =
                      item.eventName || item.eventname || item.name || `Result #${idx + 1}`;
                    const imgUrl =
                      item.largeImageUrl ||
                      item.imageUrl ||
                      item.imageurl ||
                      item.largeimageurl;
                    const dateStr = item.date || item.startdate;
                    const venueName =
                      item.venue?.name || item.venue?.town || item.town || '';
                    const venueTown = item.venue?.town || item.town || '';
                    const price = item.entryPrice || item.entryprice || 'Check website';
                    const link =
                      item.link ||
                      (item.id ? `https://www.skiddle.com/whats-on/?id=${item.id}` : '#');

                    return (
                      <div key={item.id || idx} className={styles.card}>
                        <div className={styles.cardImageWrap}>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={title}
                              className={styles.cardImage}
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className={styles.cardImagePlaceholder}>
                              {activeTab === 'venues' ? '🏛️' : activeTab === 'artists' ? '🎤' : '🎵'}
                            </div>
                          )}
                        </div>

                        <div className={styles.cardBody}>
                          <h4 className={styles.cardTitle}>{title}</h4>

                          {(venueName || venueTown) && (
                            <div className={styles.cardMeta}>
                              <span>📍</span>
                              <span>
                                {venueName}
                                {venueTown && venueTown !== venueName ? `, ${venueTown}` : ''}
                              </span>
                            </div>
                          )}

                          {dateStr && (
                            <div className={styles.cardMeta}>
                              <span>📅</span>
                              <span>{dateStr}</span>
                            </div>
                          )}

                          {item.description && (
                            <p className={styles.cardDesc}>
                              {item.description.replace(/<[^>]*>?/gm, '')}
                            </p>
                          )}

                          <div className={styles.cardFooter}>
                            <span className={styles.priceTag}>
                              {price !== 'Check website' ? price : (item.type || 'Verified')}
                            </span>
                            {item.link ? (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.cardLink}
                              >
                                View on Skiddle ↗
                              </a>
                            ) : (
                              <span style={{ fontSize: 12, color: '#ffffff' }}>
                                ID: {item.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* VIEW: JSON */}
          {viewMode === 'json' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleCopyJson}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy JSON Payload'}
                </button>
              </div>
              <pre className={styles.jsonBox}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}

          {/* VIEW: DEBUG */}
          {viewMode === 'debug' && (
            <div className={styles.debugBox}>
              <h4 style={{ color: '#ffffff', marginBottom: 12, fontSize: 14 }}>
                SDK Debug Log (Captured via <code>client.getDebugInfo()</code>)
              </h4>
              {result.debugInfo && result.debugInfo.length > 0 ? (
                result.debugInfo.map((entry: any, i: number) => (
                  <div key={i} className={styles.debugEntry}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}>
                      <span><strong>{entry.method}</strong> {entry.status} OK</span>
                      <span>{entry.durationMs}ms &bull; {entry.timestamp}</span>
                    </div>
                    <div style={{ color: '#38bdf8', wordBreak: 'break-all' }}>
                      {entry.url}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#ffffff' }}>
                  No debug entries recorded. Ensure devMode is enabled in SDK configuration.
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
