import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@skiddle/sdk';
import { SkiddleVenue, IPhoneFrame } from '../../../components/SkiddleVenue';

export const dynamic = 'force-dynamic';

const defaultVenue = {
  id: '38952',
  name: 'Hare And Hounds Kings Heath',
  address: '106 High Street, Kings Heath',
  town: 'Birmingham',
  postcode: 'B14 7JZ',
  countrycode: 'GB',
  cityname: 'Birmingham',
  phone: '0121 444 2081',
  latitude: '52.43462200',
  longitude: '-1.89298000',
  link: 'https://www.skiddle.com/whats-on/Birmingham/Hare-And-Hounds-Kings-Heath/',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Event #${id} | Skiddle Venue 3D`,
    description: `Interactive 3D venue view for Skiddle Event #${id}.`,
  };
}

export default async function PromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiKey = process.env.SKIDDLE_API_KEY;
  const host = process.env.NEXT_PUBLIC_GPXROUTE_HOST || 'http://localhost:3001';

  let venue = defaultVenue;

  if (apiKey) {
    try {
      const client = createClient({ apiKey, devMode: false });
      const response = await client.events.getListing(id);
      const eventData = response?.results;

      if (eventData?.venue && (eventData.venue.latitude || eventData.venue.longitude)) {
        venue = {
          id: String(eventData.venue.id || eventData.venueid || id),
          name: eventData.venue.name || eventData.eventname || defaultVenue.name,
          address: eventData.venue.address || defaultVenue.address,
          town: eventData.venue.town || eventData.venue.cityname || defaultVenue.town,
          postcode: eventData.venue.postcode || defaultVenue.postcode,
          countrycode: eventData.venue.countrycode || defaultVenue.countrycode,
          cityname: eventData.venue.cityname || eventData.venue.town || defaultVenue.cityname,
          phone: eventData.venue.phone || defaultVenue.phone,
          latitude: String(eventData.venue.latitude || defaultVenue.latitude),
          longitude: String(eventData.venue.longitude || defaultVenue.longitude),
          link: eventData.venue.link || eventData.link || defaultVenue.link,
        };
      }
    } catch {
      // Fallback gracefully to default venue
      venue = defaultVenue;
    }
  }

  return (
    <main
      className="w-full h-[100dvh] min-h-screen flex items-center justify-center p-0 md:p-4 bg-slate-950 overflow-hidden relative"
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#020617',
        overflow: 'hidden',
      }}
    >
      <Link
        href={`/events/${id}`}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 50,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 8,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: '#ffffff',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'all 0.15s ease',
        }}
      >
        &larr; Back to Event Details
      </Link>

      <IPhoneFrame>
        <SkiddleVenue
          host={host}
          venue={venue}
          width="100%"
          height="100%"
          borderRadius={0}
        />
      </IPhoneFrame>
    </main>
  );
}
