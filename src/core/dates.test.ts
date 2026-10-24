import { describe, it, expect } from 'vitest';
import { ymdInZone, dayNumberSince, countdownTo, hoursApart, clockIn, formatDate } from './dates';

const SZ = 'Asia/Shanghai';
const TX = 'America/Chicago';

describe('dayNumberSince', () => {
  it('counts the day we met as day 1', () => {
    expect(dayNumberSince('2026-09-20', new Date('2026-09-20T02:00:00Z'), SZ)).toBe(1);
  });
  it('is day 42 on her birthday', () => {
    expect(dayNumberSince('2026-09-20', new Date('2026-10-31T04:00:00Z'), SZ)).toBe(42);
  });
  it('uses Shenzhen date even when Texas is still on 10-30', () => {
    const now = new Date('2026-10-31T04:00:00Z'); // 23:00 on 10-30 in Texas
    expect(ymdInZone(now, TX)).toBe('2026-10-30');
    expect(dayNumberSince('2026-09-20', now, SZ)).toBe(42);
  });
});

describe('countdownTo', () => {
  const target = new Date('2027-02-08T05:00:00Z');
  it('splits remaining time', () => {
    expect(countdownTo(target, new Date('2027-02-07T03:58:00Z'))).toEqual({ days: 1, hours: 1, minutes: 2, done: false });
  });
  it('never goes negative after the target', () => {
    expect(countdownTo(target, new Date('2027-02-09T00:00:00Z'))).toEqual({ days: 0, hours: 0, minutes: 0, done: true });
  });
});

describe('hoursApart', () => {
  it('is 13 during US daylight time and 14 after', () => {
    expect(hoursApart(SZ, TX, new Date('2026-10-31T12:00:00Z'))).toBe(13);
    expect(hoursApart(SZ, TX, new Date('2026-12-01T12:00:00Z'))).toBe(14);
  });
});

describe('clockIn', () => {
  it('reports local hour and day/night', () => {
    const c = clockIn(SZ, new Date('2026-10-31T04:00:00Z'), 'en');
    expect(c.hour).toBe(12);
    expect(c.isDay).toBe(true);
    expect(c.time).toBe('12:00');
    expect(clockIn(TX, new Date('2026-10-31T04:00:00Z'), 'en').isDay).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats in both languages without shifting the day', () => {
    expect(formatDate('2026-10-18', 'zh')).toBe('2026年10月18日');
    expect(formatDate('2026-10-18', 'en')).toBe('Oct 18, 2026');
  });
});
