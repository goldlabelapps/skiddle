import { NextResponse } from 'next/server';
import {
  buildPromoShareEmailHtml,
  sendTemplatedEmail,
} from '@goldlabelapps/notify';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { to, message, event, eventId, shareUrl } = body;

    // Email is required
    if (!to || typeof to !== 'string' || !to.includes('@') || !to.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = to.trim();
    const eventName =
      event?.eventname ||
      event?.eventName ||
      event?.title ||
      (eventId ? `Event #${eventId}` : 'Skiddle Event');

    const ctaUrl =
      shareUrl ||
      event?.link ||
      (eventId ? `https://www.skiddle.com/e/${eventId}/` : 'https://www.skiddle.com');

    const avatar =
      event?.largeimageurl ||
      event?.largeImageUrl ||
      event?.imageurl ||
      event?.imageUrl;

    const subject = `Check out ${eventName} on Skiddle!`;
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    // Build the responsive promotional share email template
    const html = buildPromoShareEmailHtml({
      appName: 'Skiddle',
      appLogoUrl: 'https://www.skiddle.com/favicon.ico',
      recipientEmail: trimmedEmail,
      heading: subject,
      eventName,
      message: cleanMessage || `You've been invited to check out ${eventName} on Skiddle.`,
      ctaLabel: 'View Promo',
      ctaUrl,
      imageUrl: avatar,
      badgeLabel: '🎟️ Skiddle Promo',
      sentUsingLabel: 'Skiddle Promo',
      sentUsingUrl: 'https://www.skiddle.com',
      footerLabel: 'Sent via Skiddle Promo',
    });

    const apiKey =
      process.env.NOTIFY_API_KEY ||
      process.env.NEXT_PUBLIC_NOTIFY_API_KEY ||
      'pk_live_listingslab';

    const result = await sendTemplatedEmail({
      apiKey,
      defaultSenderName: 'Skiddle Promo',
      fromAddress: 'onboarding@goldlabel.pro',
      payload: {
        to: trimmedEmail,
        subject,
        html,
        text: cleanMessage
          ? `${cleanMessage}\n\nCheck out ${eventName} on Skiddle: ${ctaUrl}`
          : `Check out ${eventName} on Skiddle: ${ctaUrl}`,
        body: cleanMessage,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Email dispatched successfully.',
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Failed to send promo email.';
    console.error('[promo/email] Dispatch error:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
