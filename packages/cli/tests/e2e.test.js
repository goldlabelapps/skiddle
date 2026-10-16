import { describe, it, expect, vi, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEventCommand, searchEventsCommand } from '../src/commands/events.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { runTest } from '../src/commands/test.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, '../bin/nx.js');

describe('CLI End-to-End (E2E) Execution Suite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes nx --version binary and outputs valid version string', () => {
    const output = execFileSync(process.execPath, [cliBin, '--version'], {
      encoding: 'utf8',
    });
    expect(output).toMatch(/v\d+\.\d+\.\d+/);
  });

  it('executes nx --help binary and renders command reference', () => {
    const output = execFileSync(process.execPath, [cliBin, '--help'], {
      encoding: 'utf8',
    });
    expect(output).toContain('NX° Skiddle');
    expect(output).toContain('doctor');
    expect(output).toContain('events');
    expect(output).toContain('benchmark');
  });

  it('executes runTest in dry-run mode across all CI pipeline stages and submodes', async () => {
    expect(await runTest('ci', { dryRun: true, quiet: true })).toBe(true);
    expect(await runTest('unit', { dryRun: true, quiet: true })).toBe(true);
    expect(await runTest('e2e', { dryRun: true, quiet: true })).toBe(true);
    expect(await runTest('php', { dryRun: true, quiet: true })).toBe(true);
    expect(await runTest('lint', { dryRun: true, quiet: true })).toBe(true);
    expect(await runTest('build', { dryRun: true, quiet: true })).toBe(true);
  });

  it('executes getEventCommand end-to-end with mocked SDK transport', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 0,
          results: {
            id: '42616476',
            eventname: 'Mozart, Made in Manchester',
            date: '2027-04-15',
            entryprice: '27.50',
            tickets: true,
            venue: { name: 'The Stoller Hall', town: 'Manchester', postcode: 'M3 1DA' },
            openingtimes: { doorsopen: '19:30', doorsclose: '21:30' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const evt = await getEventCommand('42616476', { key: 'mock_cli_key', quiet: true });
    expect(evt).toBeTruthy();
    expect(evt.id).toBe('42616476');
    expect(evt.eventname).toBe('Mozart, Made in Manchester');
  });

  it('executes searchEventsCommand end-to-end with mocked SDK transport', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 0,
          totalresults: 1,
          results: [
            {
              id: '101',
              eventname: 'Warehouse Project Opening',
              date: '2026-10-30',
              venue: { name: 'Depot Mayfield', town: 'Manchester' },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const ok = await searchEventsCommand('Warehouse', {
      key: 'mock_cli_key',
      limit: '5',
      quiet: true,
      interactive: false,
    });
    expect(ok).toBe(true);
  });

  it('executes doctorCommand end-to-end verifying both API v3 and v1 health checks', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            totalresults: 100,
            results: [{ id: '42616476', eventname: 'Mozart' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            totalresults: 100,
            results: [{ id: '42616476', eventname: 'Mozart' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: { id: '42616476', eventname: 'Mozart, Made in Manchester' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const healthy = await doctorCommand({ key: 'mock_doctor_key_12345678', quiet: true });
    expect(healthy).toBe(true);
  });
});
