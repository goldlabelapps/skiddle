'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Stage, CleverText, LightningBolt } from '@goldlabelapps/flash';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Share2,
  RotateCcw,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Terminal,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import styles from './PromoteFlashMovie.module.css';

interface PromoteFlashMovieClientProps {
  id: string;
  event: any;
  rawResponse: any;
  executionTimeMs?: number;
}

function formatBritishDate(dateStr?: string): string {
  if (!dateStr || dateStr === 'Date TBA') return dateStr || 'Date TBA';
  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(year, month, day));
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Web Audio synthesizer for nostalgic Flash retro sound effects
function playFlashSound(type: 'intro' | 'click' | 'share') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'intro') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'share') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch {
    // Ignore audio policy errors
  }
}

export function PromoteFlashMovieClient({
  id,
  event,
  rawResponse,
  executionTimeMs = 120,
}: PromoteFlashMovieClientProps) {
  // Prevent any document scrolling while this Flash movie is displayed
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, []);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Animation element refs
  const posterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Live event fields
  const eventName = event?.eventname || event?.eventName || `Event #${id}`;
  const imageUrl = event?.largeimageurl || event?.imageurl || event?.largeImageUrl || event?.imageUrl || '';
  const venue = event?.venue || {};
  const venueName = venue.name || 'Venue TBA';
  const venueTown = venue.town || venue.cityname || 'UK';
  const dateFormatted = formatBritishDate(event?.date || event?.startdate);
  const entryPrice = event?.entryprice || event?.entryPrice || 'Free / TBA';
  const minAge = event?.MinAge || event?.minage ? `${event?.MinAge || event?.minage}+` : 'All Ages';
  const doorsOpen = event?.openingtimes?.doorsopen ? `Doors ${event.openingtimes.doorsopen}` : 'Doors TBA';
  const skiddleUrl = event?.link || `https://www.skiddle.com/e/${id}/`;

  // Artists & Genres
  const artists = Array.isArray(event?.artists)
    ? event.artists.map((a: any) => (typeof a === 'string' ? a : a.name)).filter(Boolean)
    : [];
  const genres = Array.isArray(event?.genres)
    ? event.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  // Ticker phrases dynamically generated from live API
  const tickerPhrases = [
    `🔥 LIVE SKIDDLE FEED // EVENT #${id} VERIFIED`,
    `⚡ ${eventName.toUpperCase()} // LIVE AT ${venueName.toUpperCase()}`,
    `📍 ${venueTown.toUpperCase()} // ${dateFormatted.toUpperCase()} // ${doorsOpen.toUpperCase()}`,
    `🎟️ ENTRY: ${entryPrice.toUpperCase()} // TICKETS SELLING FAST`,
    artists.length > 0
      ? `🎵 LINEUP: ${artists.slice(0, 3).join(' • ').toUpperCase()}`
      : `🌟 DON'T MISS THIS OFFICIAL SKIDDLE SHOWCASE`,
  ];

  // GSAP Flash action script timeline
  const playAnimation = useCallback(() => {
    if (soundEnabled) {
      playFlashSound('intro');
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (posterRef.current) {
      tl.fromTo(
        posterRef.current,
        { scale: 0.85, opacity: 0, rotationY: -10 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 0.8, ease: 'back.out(1.4)' },
        0
      );
    }

    if (tickerRef.current) {
      tl.fromTo(
        tickerRef.current,
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.15
      );
    }

    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { y: 25, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
        0.25
      );
    }

    if (cardsRef.current) {
      tl.fromTo(
        cardsRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
        0.35
      );
    }

    if (ctaRef.current) {
      tl.fromTo(
        ctaRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' },
        0.5
      );
    }
  }, [soundEnabled]);

  // Trigger intro animation on initial mount
  useEffect(() => {
    playAnimation();
  }, [playAnimation]);

  // Rotate through ticker messages
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerPhrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tickerPhrases.length]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Copy share link
  const handleShare = async () => {
    if (soundEnabled) playFlashSound('share');
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('Promotion link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      setToastMessage('Link ready to share!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSoundToggle = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playFlashSound('click');
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Cyber Glow & Retro Grid */}
      <div className={styles.background}>
        <div className={styles.bgGlowTop} />
        <div className={styles.bgGlowBottom} />
        <div className={styles.cyberGrid} />
        <div className={styles.scanlines} />
      </div>

      {/* Top HUD Bar */}
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <Link href={`/events/${id}`} className={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Event Detail</span>
          </Link>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span>Skiddle Live API</span>
          </div>
        </div>

        <div className={styles.navRight}>
          <button
            type="button"
            className={styles.apiPill}
            onClick={() => setShowApiModal(true)}
            title="Inspect Live Skiddle API JSON payload"
          >
            <Terminal size={13} />
            <span>API #{id} ({executionTimeMs}ms)</span>
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Mute Flash audio' : 'Enable Flash audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen presentation'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}

      {/* Flash Stage Surface from @goldlabelapps/flash */}
      <main className={styles.stageWrapper}>
        <Stage color="transparent" className={styles.flashStage}>
          <div className={styles.movieGrid}>
            {/* Left Column: Floating Holographic Artwork */}
            <div className={styles.artworkCol}>
              <div ref={posterRef} className={styles.posterCard}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={eventName}
                    fill
                    className={styles.posterImage}
                    priority
                    unoptimized
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: 14,
                    }}
                  >
                    No Image Available
                  </div>
                )}

                <div className={styles.posterOverlay} />

                {/* Electric LightningBolt from @goldlabelapps/flash */}
                <div className={styles.boltWrapper}>
                  <LightningBolt
                    width="44px"
                    height="85px"
                    frontColor="#00d26a"
                    backColor="#0284c7"
                    strokeColor="#ffffff"
                  />
                </div>

                <div className={styles.cornerPill}>
                  <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Verified Event</span>
                </div>

                <div className={styles.bottomPills}>
                  <div className={styles.priceTag}>{entryPrice}</div>
                  <div className={styles.ageTag}>{minAge}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Kinetic Typography & Clickbait Hook */}
            <div className={styles.contentCol}>
              {/* Typewriter Ticker powered by @goldlabelapps/flash CleverText */}
              <div ref={tickerRef} className={styles.cleverTicker}>
                <CleverText
                  key={tickerIndex}
                  text={tickerPhrases[tickerIndex]}
                  speed={20}
                  cursor="█"
                />
              </div>

              {/* Huge Kinetic Title */}
              <h1 ref={titleRef} className={styles.eventTitle}>
                {eventName}
              </h1>

              {/* Live Info HUD Cards */}
              <div ref={cardsRef} className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Calendar size={13} style={{ color: '#00d26a' }} />
                    <span>Date & Doors</span>
                  </div>
                  <div className={styles.infoValue}>
                    {dateFormatted} &bull; {doorsOpen}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <MapPin size={13} style={{ color: '#38bdf8' }} />
                    <span>Location</span>
                  </div>
                  <div className={styles.infoValue} title={`${venueName}, ${venueTown}`}>
                    {venueName}, {venueTown}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Ticket size={13} style={{ color: '#f59e0b' }} />
                    <span>Tickets & Entry</span>
                  </div>
                  <div className={styles.infoValue} style={{ color: '#00d26a', fontWeight: 700 }}>
                    {entryPrice} &bull; {minAge}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Terminal size={13} style={{ color: '#a855f7' }} />
                    <span>Skiddle Listing</span>
                  </div>
                  <div className={styles.infoValue}>
                    Event #{id} (Live Sync)
                  </div>
                </div>
              </div>

              {/* Artists & Genres Pills (Desktop) */}
              {(artists.length > 0 || genres.length > 0) && (
                <div className={styles.lineupBox}>
                  <div className={styles.lineupTitle}>Featured Artists & Genres</div>
                  <div className={styles.pillsRow}>
                    {artists.slice(0, 4).map((artist: string, idx: number) => (
                      <span key={idx} className={styles.artistPill}>
                        {artist}
                      </span>
                    ))}
                    {genres.slice(0, 3).map((genre: string, idx: number) => (
                      <span key={`g-${idx}`} className={styles.genrePill}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shareable / Clickbait Action Row */}
              <div ref={ctaRef} className={styles.ctaRow}>
                <a
                  href={skiddleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.skiddleBtn}
                  onClick={() => soundEnabled && playFlashSound('click')}
                >
                  <span>Get Tickets on Skiddle</span>
                  <ExternalLink size={16} />
                </a>

                <button
                  type="button"
                  className={styles.shareBtn}
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  <span>Share Event</span>
                </button>

                <button
                  type="button"
                  className={styles.replayBtn}
                  onClick={playAnimation}
                  title="Replay Flash Movie animation"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>
          </div>
        </Stage>
      </main>

      {/* Bottom HUD Bar with Visualizer Equalizer */}
      <footer className={styles.bottomHud}>
        <div className={styles.visualizer}>
          <div className={styles.bar} style={{ animationDelay: '0.1s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.4s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.2s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.6s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.3s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.5s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.25s' }} />
          <div className={styles.bar} style={{ animationDelay: '0.45s' }} />
        </div>

        <div className={styles.hudFooterText}>
          POWERED BY{' '}
          <a
            href="https://www.npmjs.com/package/@goldlabelapps/flash"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.hudFooterLink}
          >
            @goldlabelapps/flash
          </a>{' '}
          &bull; SKIDDLE LIVE API
        </div>
      </footer>

      {/* API JSON Inspector Modal (Zero doubt / nothing up our sleeves) */}
      {showApiModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowApiModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                LIVE SKIDDLE API PAYLOAD &bull; GET /api/v1/events/{id}/ ({executionTimeMs}ms)
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowApiModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <pre className={styles.modalBody}>
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
