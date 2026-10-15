import { SkiddleSession, Events, SkiddleException } from '@skiddle/sdk';
import { log, colors, banner, promptInput, promptSelect, promptConfirm, openBrowser, playSound } from '../terminal.js';

export async function getEventCommand(id, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    log.error('Skiddle API key is required. Set SKIDDLE_API_KEY in your environment or pass --key <apiKey>');
    return null;
  }

  const session = new SkiddleSession({ apiKey, devMode: Boolean(options.dev) });
  const events = new Events();
  events.setSession(session);

  log.info(`Fetching event listing [${colors.brightCyan}${id}${colors.reset}]...`);

  try {
    const t0 = Date.now();
    const response = await events.getListing(id);
    const elapsed = Date.now() - t0;
    const evt = response.results;

    if (!evt) {
      log.warn(`No listing found for event ID: ${id}`);
      return null;
    }

    log.divider();
    console.log(`\n  ${colors.bold}${colors.brightWhite}${evt.eventname || 'Untitled Event'}${colors.reset}`);
    log.highlight('Event ID', evt.id);
    log.highlight('Date / Time', `${evt.date || 'TBD'} (${evt.openingtimes?.doorsopen || 'Doors open'} - ${evt.openingtimes?.doorsclose || 'Close'})`);
    log.highlight('Venue', `${evt.venue?.name || 'TBD'} — ${evt.venue?.address || ''}, ${evt.venue?.town || ''} (${evt.venue?.postcode || ''})`);
    log.highlight('Price', evt.entryprice ? `${evt.entryprice} (Min age: ${evt.MinAge || 'All ages'})` : 'Price not listed');
    log.highlight('Tickets', evt.tickets ? `${colors.brightGreen}Tickets on sale${colors.reset}` : `${colors.yellow}Sold Out / Off Sale${colors.reset}`);
    if (evt.description) {
      const cleanDesc = evt.description.replace(/<[^>]+>/g, '').trim();
      const snippet = cleanDesc.length > 300 ? cleanDesc.slice(0, 300) + '...' : cleanDesc;
      console.log(`\n  ${colors.dim}${snippet}${colors.reset}\n`);
    }
    if (evt.link) {
      log.highlight('Skiddle URL', evt.link);
    }
    log.divider();
    log.success(`Listing retrieved in ${elapsed}ms`);
    return evt;
  } catch (err) {
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    log.error(`Failed to fetch event ID ${id}: ${msg}`);
    return null;
  }
}

export async function searchEventsCommand(keyword, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    log.error('Skiddle API key is required. Set SKIDDLE_API_KEY in your environment or pass --key <apiKey>');
    return false;
  }

  let searchKeyword = keyword;
  let limit = options.limit || '5';

  // Interactive query refinement
  if (options.interactive && typeof searchKeyword === 'undefined') {
    searchKeyword = await promptInput('enter search keyword (press Enter for trending/all)', '');
    if (searchKeyword === 'exit') return { escaped: true };

    const limitInput = await promptInput('number of events to display', '5');
    if (limitInput === 'exit') return { escaped: true };
    limit = limitInput || '5';
  }

  const session = new SkiddleSession({ apiKey, devMode: Boolean(options.dev) });
  const events = new Events();
  events.setSession(session);

  if (searchKeyword) {
    events.addCond('keyword', searchKeyword);
  }
  if (limit) {
    events.addCond('limit', limit);
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

  log.info(`Searching Skiddle Events... ${searchKeyword ? `(Query: "${searchKeyword}")` : '(Trending)'}`);

  try {
    const t0 = Date.now();
    const response = await events.getListings();
    const elapsed = Date.now() - t0;

    const results = Array.isArray(response.results) ? response.results : [];
    log.divider();
    log.success(`Found ${colors.bold}${results.length}${colors.reset} event(s) in ${elapsed}ms (Total in index: ${response.totalresults ?? 'N/A'})\n`);

    if (results.length === 0) {
      log.warn('No events matched your search criteria.');
      return true;
    }

    results.forEach((evt, idx) => {
      const name = `${colors.bold}${colors.brightWhite}${evt.eventname || 'Untitled Event'}${colors.reset}`;
      const date = `${colors.cyan}${evt.date || evt.startdate || 'Date TBD'}${colors.reset}`;
      const venueName = evt.venue ? `${evt.venue.name || 'Venue TBD'} (${evt.venue.town || ''})` : 'Unknown venue';
      const price = evt.entryprice ? `${colors.brightGreen}${evt.entryprice}${colors.reset}` : `${colors.gray}Price not listed${colors.reset}`;
      const tickets = evt.tickets ? `${colors.brightGreen}🎟 Tickets Available${colors.reset}` : `${colors.yellow}Sold Out / Off Sale${colors.reset}`;

      console.log(`  ${colors.brightCyan}[${idx + 1}]${colors.reset} ${name}`);
      console.log(`      📅 ${date}  |  📍 ${venueName}`);
      console.log(`      💵 ${price}  |  ${tickets}`);
      if (evt.link) {
        console.log(`      🔗 ${colors.dim}${evt.link}${colors.reset}`);
      }
      console.log('');
    });

    // In interactive mode, let the user inspect an event or open in browser
    if (options.interactive && results.length > 0) {
      const inspectOptions = results.map((evt, idx) => ({
        label: `${evt.eventname || 'Event #' + (idx + 1)} (${evt.date || 'TBD'})`,
        value: String(idx),
      }));

      const selection = await promptSelect('Inspect Event Listing', inspectOptions);
      if (selection !== 'exit') {
        const selectedEvt = results[parseInt(selection, 10)];
        if (selectedEvt) {
          log.divider();
          console.log(`\n  ${colors.bold}${colors.brightWhite}${selectedEvt.eventname}${colors.reset}`);
          log.highlight('Event ID', selectedEvt.id);
          log.highlight('Venue', `${selectedEvt.venue?.name || 'TBD'} — ${selectedEvt.venue?.town || ''}`);
          log.highlight('Date', selectedEvt.date || 'TBD');
          log.highlight('Price', selectedEvt.entryprice || 'N/A');
          if (selectedEvt.description) {
            const clean = selectedEvt.description.replace(/<[^>]+>/g, '').trim();
            console.log(`\n  ${colors.dim}${clean.slice(0, 250)}...${colors.reset}\n`);
          }
          if (selectedEvt.link) {
            log.highlight('Link', selectedEvt.link);
            const openChoice = await promptConfirm('Open tickets page in browser?', true);
            if (openChoice) {
              log.info(`Launching browser: ${selectedEvt.link}`);
              openBrowser(selectedEvt.link);
            }
          }
        }
      }
    }

    playSound('pass');
    return true;
  } catch (err) {
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    log.error(`Event search failed: ${msg}`);
    playSound('fail');
    return false;
  }
}
