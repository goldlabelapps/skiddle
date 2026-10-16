import { describe, it, expect, vi, afterEach } from 'vitest';
import { toEFlyerPromotionData } from '@skiddle/sdk';
import manifest from '../../src/app/manifest.js';
import { metadata, viewport } from '../../src/app/layout.js';
import { executeSkiddleQuery } from '../../src/app/actions.js';

describe('Web App End-to-End (E2E) & Integration Suite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates PWA Web App Manifest contract and icon definitions', () => {
    const webManifest = manifest();
    expect(webManifest.name).toBe('Skiddle Promotion Centre');
    expect(webManifest.short_name).toBe('Skiddle');
    expect(webManifest.start_url).toBe('/');
    expect(webManifest.display).toBe('standalone');
    expect(webManifest.theme_color).toBe('#0b0f19');
    expect(webManifest.icons?.length).toBeGreaterThanOrEqual(5);
  });

  it('validates RootLayout metadata and viewport contracts', () => {
    expect(viewport.themeColor).toBe('#0b0f19');
    expect(metadata.title).toBe('Skiddle Monorepo | Next.js App');
    expect(metadata.manifest).toBe('/manifest.webmanifest');
  });

  it('executes full E2E integration from Next.js Server Action -> @skiddle/sdk -> eFlyer Promotion Model', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 0,
          totalcount: 1,
          pagecount: 1,
          results: {
            id: '42616476',
            listingid: '2311883',
            eventname: 'Mozart, Made in Manchester',
            cancelled: '0',
            cancellationDate: '',
            cancellationType: '',
            cancellationReason: '',
            rescheduledDate: '',
            venue: {
              id: '75988',
              name: 'The Stoller Hall',
              address: 'Hunts Bank, Manchester',
              town: 'Manchester',
              postcode: 'M3 1DA',
              countrycode: 'GB',
              cityname: 'Manchester',
              phone: '0333 130 0967',
              latitude: '53.48725000',
              longitude: '-2.24332800',
              link: 'https://www.skiddle.com/whats-on/Manchester/The-Stoller-Hall/',
            },
            imageurl: 'https://example.com/thumb.jpg',
            largeimageurl: 'https://example.com/hero.jpg',
            headerhex: '#080808',
            link: 'https://www.skiddle.com/whats-on/Manchester/The-Stoller-Hall/Mozart-Made-in-Manchester/42616476/',
            date: '2027-04-15',
            dateStart: '2027-04-15 19:30:00',
            dateEnd: '2027-04-15 21:30:00',
            startdate: '2027-04-15T18:30:00+00:00',
            enddate: '2027-04-15T20:30:00+00:00',
            description: 'Manchester Camerata return to Stoller Hall.',
            openingtimes: {
              doorsopen: '19:30',
              doorsclose: '21:30',
              lastentry: '',
            },
            genres: [{ genreid: '37', name: 'Classical' }],
            entryprice: '27.50',
            MinAge: '',
            going: [],
            imgoing: 0,
            goingtos: 0,
            artists: [],
            ticketStatus: '',
            tickets: false,
            paymentPlanTCs: null,
            eventVisibility: 'public',
            ticketUrl: '',
            groupingid: '',
            rep: { enabled: false },
            seatingPlanID: '',
            healthAndSafety: [],
          },
          requestId: 'api_e2e_test_1',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const queryResult = await executeSkiddleQuery({
      resource: 'event-single',
      conditions: {},
      singleId: '42616476',
      apiKey: 'e2e_web_secret_key',
      devMode: true,
    });

    expect(queryResult.success).toBe(true);
    expect(queryResult.resource).toBe('event-single');
    expect(queryResult.debugInfo?.[0].status).toBe(200);
    expect(queryResult.debugInfo?.[0].url).not.toContain('e2e_web_secret_key');

    const eflyer = toEFlyerPromotionData(queryResult.data.results);
    expect(eflyer.eventName).toBe('Mozart, Made in Manchester');
    expect(eflyer.venueName).toBe('The Stoller Hall');
    expect(eflyer.entryPrice).toBe('27.50');
  });
});
