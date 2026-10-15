import pc from 'picocolors';
import { SkiddleSession, Events, SkiddleException } from '../../../dist/index.js';

export async function searchEventsCommand(keyword, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.error(pc.red('Error: Skiddle API key is required. Set SKIDDLE_API_KEY in your environment or use --key <apiKey>'));
    return;
  }

  const session = new SkiddleSession({ apiKey, devMode: Boolean(options.dev) });
  const events = new Events();
  events.setSession(session);

  if (keyword) {
    events.addCond('keyword', keyword);
  }
  if (options.limit) {
    events.addCond('limit', options.limit);
  }
  if (options.eventcode) {
    events.addCond('eventcode', options.eventcode);
  }
  if (options.radius) {
    events.addCond('radius', options.radius);
  }
  if (options.latitude && options.longitude) {
    events.addCond('latitude', options.latitude);
    events.addCond('longitude', options.longitude);
  }

  console.log(pc.bold(`\nSearching Skiddle Events... ${keyword ? `(Query: "${keyword}")` : ''}\n`));

  try {
    const t0 = Date.now();
    const response = await events.getListings();
    const elapsed = Date.now() - t0;

    const results = Array.isArray(response.results) ? response.results : [];
    console.log(`${pc.green('✔')} Found ${pc.bold(results.length)} event(s) in ${elapsed}ms (Total in index: ${response.totalresults ?? 'N/A'})\n`);

    if (results.length === 0) {
      console.log(pc.yellow('No events matched your criteria.'));
      return;
    }

    results.forEach((evt, idx) => {
      const name = pc.bold(pc.white(evt.eventname || 'Untitled Event'));
      const date = pc.cyan(evt.date || evt.startdate || 'Date TBD');
      const venueName = evt.venue ? `${evt.venue.name || 'Venue TBD'} (${evt.venue.town || ''})` : 'Unknown venue';
      const price = evt.entryprice ? pc.green(evt.entryprice) : pc.gray('Price not listed');
      const tickets = evt.tickets ? pc.green('🎟 Tickets Available') : pc.yellow('Sold Out / Not on Sale');

      console.log(`${pc.gray(`[${idx + 1}]`)} ${name}`);
      console.log(`    📅 ${date}  |  📍 ${venueName}`);
      console.log(`    💵 ${price}  |  ${tickets}`);
      if (evt.link) {
        console.log(`    🔗 ${pc.blue(evt.link)}`);
      }
      console.log('');
    });
  } catch (err) {
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    console.error(pc.red(`Failed to fetch events: ${msg}`));
  }
}

export async function getEventCommand(id, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.error(pc.red('Error: Skiddle API key is required. Set SKIDDLE_API_KEY in your environment or use --key <apiKey>'));
    return;
  }

  const session = new SkiddleSession({ apiKey, devMode: Boolean(options.dev) });
  const events = new Events();
  events.setSession(session);

  console.log(pc.bold(`\nFetching Event ID #${id}...\n`));

  try {
    const response = await events.getListing(id);
    const evt = response.results;

    if (!evt) {
      console.log(pc.yellow('No event data returned for this ID.'));
      return;
    }

    console.log(pc.bold(pc.green(evt.eventname || 'Untitled Event')));
    console.log(pc.gray('─'.repeat(50)));
    console.log(`ID:           ${evt.id}`);
    console.log(`Date:         ${evt.date || evt.startdate}`);
    console.log(`Venue:        ${evt.venue?.name} - ${evt.venue?.town}`);
    console.log(`Doors Open:   ${evt.openingtimes?.doorsopen ?? 'N/A'}`);
    console.log(`Min Age:      ${evt.minage ?? 'N/A'}`);
    console.log(`Entry Price:  ${evt.entryprice ?? 'N/A'}`);
    console.log(`Tickets:      ${evt.tickets ? 'Available' : 'Unavailable'}`);
    if (evt.description) {
      console.log(`\nDescription:\n${pc.gray(evt.description.slice(0, 300))}...`);
    }
    console.log('');
  } catch (err) {
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    console.error(pc.red(`Failed to fetch event: ${msg}`));
  }
}
