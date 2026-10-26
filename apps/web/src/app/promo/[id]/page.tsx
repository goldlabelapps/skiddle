import React, { cache } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@skiddle/sdk';
import type { SkiddleEventDetail } from '@skiddle/sdk';
import { IPhoneFrame } from '../../../components/SkiddleVenue';
import { PromoFlash } from '../../../components/PromoFlash';

export const dynamic = 'force-dynamic';

function cleanDescription(desc?: string): string {
  if (!desc) return '';
  return desc.replace(/<[^>]*>?/gm, '').trim();
}

const getEvent = cache(async (id: string): Promise<SkiddleEventDetail | null> => {
  const apiKey = process.env.SKIDDLE_API_KEY;
  if (!apiKey) return null;

  try {
    const client = createClient({ apiKey, devMode: false });
    const response = await client.events.getListing(id);
    return (response?.results as SkiddleEventDetail) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  const title = event?.eventname || `Event #${id} | Skiddle Promo`;
  const description =
    cleanDescription(event?.description) ||
    `Interactive Promo Experience for Skiddle Event #${id}.`;
  const largeImage = event?.largeimageurl || event?.imageurl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(largeImage
        ? {
            images: [
              {
                url: largeImage,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(largeImage ? { images: [largeImage] } : {}),
    },
  };
}

export default async function PromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventData = await getEvent(id);

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
