import { describe, it, expect } from 'vitest';
import { parseArgs, MAIN_MENU_OPTIONS } from '../src/index.js';
import { checkEnv } from '../src/env.js';
import { colors, banner, VERSION, getMonorepoVersion } from '../src/terminal.js';
import { SCENARIO_DEFS } from '../src/commands/scenarios.js';

describe('CLI Main Menu Options', () => {
  it('includes expected core options in main menu', () => {
    const values = MAIN_MENU_OPTIONS.map((o) => o.value);
    expect(values).toContain('events');
    expect(values).toContain('doctor');
    expect(values).toContain('scenarios');
    expect(values).toContain('benchmark');
    expect(values).toContain('test');
    expect(values).toContain('git');
    expect(values).toContain('env');
    expect(values).toContain('help');
  });

  it('provides descriptions for each menu item', () => {
    MAIN_MENU_OPTIONS.forEach((opt) => {
      expect(opt.label).toBeTruthy();
      expect(opt.desc).toBeTruthy();
    });
  });
});

describe('CLI Argument Parser (parseArgs)', () => {
  it('parses positional commands and subcommands accurately', () => {
    const res = parseArgs(['events', 'Warehouse', '--limit=10', '--quiet']);
    expect(res.command).toBe('events');
    expect(res.subcommand).toBe('Warehouse');
    expect(res.flags.limit).toBe('10');
    expect(res.flags.quiet).toBe(true);
  });

  it('handles boolean short flags correctly', () => {
    const res = parseArgs(['-h', '-v', '-i', '-q', '-y', '--dev', '--dry-run']);
    expect(res.flags.help).toBe(true);
    expect(res.flags.version).toBe(true);
    expect(res.flags.interactive).toBe(true);
    expect(res.flags.quiet).toBe(true);
    expect(res.flags.yes).toBe(true);
    expect(res.flags.dev).toBe(true);
    expect(res.flags.dryRun).toBe(true);
  });

  it('handles option values with spaces or equals', () => {
    const res1 = parseArgs(['events', '-k', 'my-api-key', '-l', '25', '-c', 'FEST']);
    expect(res1.flags.key).toBe('my-api-key');
    expect(res1.flags.limit).toBe('25');
    expect(res1.flags.eventcode).toBe('FEST');

    const res2 = parseArgs(['benchmark', '--requests=50', '--concurrency=10']);
    expect(res2.flags.requests).toBe('50');
    expect(res2.flags.concurrency).toBe('10');
  });

  it('handles empty arguments with defaults', () => {
    const res = parseArgs([]);
    expect(res.command).toBeNull();
    expect(res.subcommand).toBeNull();
    expect(res.flags.interactive).toBe(false);
    expect(res.flags.quiet).toBe(false);
  });
});

describe('CLI Environment Diagnostics (checkEnv)', () => {
  it('inspects Node, OS, and package manager strategy', () => {
    const env = checkEnv();
    expect(env.node.major).toBeGreaterThanOrEqual(18);
    expect(env.node.supported).toBe(true);
    expect(env.os.platform).toBeTruthy();
    expect(env.packageManagers.preferred).toBe('pnpm');
    expect(env.git).toHaveProperty('installed');
    expect(env.skiddle).toHaveProperty('hasKey');
  });
});

describe('CLI Terminal & Styling', () => {
  it('exports valid semantic version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
    expect(getMonorepoVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('formats banner with gold ANSI border and title', () => {
    expect(banner).toContain('NX° Skiddle');
    expect(banner).toContain(colors.gold);
    expect(banner).toContain('╭');
    expect(banner).toContain('╰');
  });

  it('defines ANSI color palette', () => {
    expect(colors.gold).toBe('\x1b[38;5;220m');
    expect(colors.cyan).toBe('\x1b[36m');
    expect(colors.reset).toBe('\x1b[0m');
  });
});

describe('Classic Scenarios Parity', () => {
  it('defines all 10 classic Skiddle test scenarios', () => {
    expect(SCENARIO_DEFS.length).toBe(10);
    const ids = SCENARIO_DEFS.map((s) => s.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
