import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@skiddle/sdk';
import { IPhoneFrame } from '../../../components/SkiddleVenue';
import { PromoFlash } from '../../../components/PromoFlash';

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
    title: `Event #${id} | Skiddle Promo`,
    description: `Interactive Promo Experience for Skiddle Event #${id}.`,
  };
}

export default async function PromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiKey = process.env.SKIDDLE_API_KEY;

  let eventData: any = null;

  if (apiKey) {
    try {
      const client = createClient({ apiKey, devMode: false });
      const response = await client.events.getListing(id);
      eventData = response?.results;
    } catch {
      // Fallback gracefully if API fails
      eventData = null;
    }
  }

  return (
    <main
      className="w-full h-[100dvh] min-h-screen flex items-center justify-center p-0 md:p-8 bg-white overflow-hidden relative"
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <IPhoneFrame variant="light">
        <PromoFlash id={id} event={eventData} />
      </IPhoneFrame>
    </main>
  );
}
