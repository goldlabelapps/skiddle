import type { SkiddleEventDetail, EFlyerPromotionData } from './types.js';

/**
 * Normalizes a raw SkiddleEventDetail object into a streamlined ViewModel
 * designed specifically for eFlyer email templates, web banners, and marketing creatives.
 *
 * @param event The single event detail payload from Skiddle API v1 (/api/v1/events/{id}/)
 * @returns Clean, promotion-ready eFlyer data structure
 */
export function toEFlyerPromotionData(event: SkiddleEventDetail): EFlyerPromotionData {
  const isCancelled = event.cancelled === '1' || Boolean(event.cancellationReason && event.cancellationReason.trim().length > 0);

  return {
    eventId: event.id,
    listingId: event.listingid,
    eventName: event.eventname,
    description: event.description,
    heroImageUrl: event.largeimageurl || event.imageurl || '',
    thumbnailImageUrl: event.imageurl || event.largeimageurl || '',
    accentColor: event.headerhex || '#080808',
    skiddleUrl: event.link,
    eventDate: event.date,
    doorsOpen: event.openingtimes?.doorsopen || '',
    doorsClose: event.openingtimes?.doorsclose || '',
    lastEntry: event.openingtimes?.lastentry ? event.openingtimes.lastentry : undefined,
    venueName: event.venue?.name || '',
    venueAddress: event.venue?.address || '',
    venueCity: event.venue?.town || event.venue?.cityname || '',
    venuePostcode: event.venue?.postcode || '',
    venuePhone: event.venue?.phone ? event.venue.phone : undefined,
    venueLink: event.venue?.link ? event.venue.link : undefined,
    entryPrice: event.entryprice || '',
    minAge: event.MinAge ? String(event.MinAge) : undefined,
    ticketsAvailable: Boolean(event.tickets),
    ticketUrl: event.ticketUrl ? event.ticketUrl : undefined,
    genres: Array.isArray(event.genres) ? event.genres.map((g) => g.name) : [],
    isCancelled,
    cancellationReason: event.cancellationReason ? event.cancellationReason : undefined,
  };
}
