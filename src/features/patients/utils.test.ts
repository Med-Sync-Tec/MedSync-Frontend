import {
  calculateAge,
  daysBetween,
  formatDate,
  formatDateShort,
  formatRelative,
  formatRelativeFromNow,
  getInitials,
  parseDate,
} from './utils';

describe('parseDate', () => {
  it('returns null for undefined', () => {
    expect(parseDate(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseDate(null)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseDate('')).toBeNull();
  });

  it('returns null for an unparseable string', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });

  it('returns a Date for a valid ISO string', () => {
    const result = parseDate('2024-03-15T12:00:00');

    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(15);
  });
});

describe('formatDate', () => {
  it('returns an em dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns an em dash for an empty string', () => {
    expect(formatDate('')).toBe('—');
  });

  it('returns an em dash for an invalid date string', () => {
    expect(formatDate('garbage')).toBe('—');
  });

  it('formats a valid date in long es-MX style', () => {
    const result = formatDate('2024-03-15T12:00:00');

    expect(result).toMatch(/15/);
    expect(result).toMatch(/mar/i);
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateShort', () => {
  it('returns an em dash for undefined', () => {
    expect(formatDateShort(undefined)).toBe('—');
  });

  it('returns an em dash for an invalid date string', () => {
    expect(formatDateShort('garbage')).toBe('—');
  });

  it('formats a valid date with a 2-digit year', () => {
    const result = formatDateShort('2024-03-15T12:00:00');

    expect(result).toMatch(/15/);
    expect(result).toMatch(/mar/i);
    expect(result).toMatch(/24/);
    expect(result).not.toMatch(/2024/);
  });
});

describe('calculateAge', () => {
  const reference = new Date(2024, 5, 15); // 15 jun 2024

  it('returns the age when the birthday already passed this year', () => {
    expect(calculateAge('1990-03-10T00:00:00', reference)).toBe(34);
  });

  it('subtracts one when the birth month has not arrived yet', () => {
    expect(calculateAge('1990-09-10T00:00:00', reference)).toBe(33);
  });

  it('subtracts one when same month but the day has not arrived yet', () => {
    expect(calculateAge('1990-06-20T00:00:00', reference)).toBe(33);
  });

  it('does not subtract on the exact birthday', () => {
    expect(calculateAge('1990-06-15T00:00:00', reference)).toBe(34);
  });

  it('returns null for an invalid date', () => {
    expect(calculateAge('invalid', reference)).toBeNull();
  });

  it('returns null when the birth date is in the future', () => {
    expect(calculateAge('2030-01-01T00:00:00', reference)).toBeNull();
  });
});

describe('daysBetween', () => {
  it('returns whole days between two dates', () => {
    const from = new Date(2024, 0, 1);
    const to = new Date(2024, 0, 11);

    expect(daysBetween(from, to)).toBe(10);
  });

  it('returns 0 for identical dates', () => {
    const d = new Date(2024, 0, 1);

    expect(daysBetween(d, d)).toBe(0);
  });

  it('clamps negative ranges to 0', () => {
    const from = new Date(2024, 0, 11);
    const to = new Date(2024, 0, 1);

    expect(daysBetween(from, to)).toBe(0);
  });

  it('floors partial days', () => {
    const from = new Date(2024, 0, 1, 0, 0, 0);
    const to = new Date(2024, 0, 2, 23, 59, 59);

    expect(daysBetween(from, to)).toBe(1);
  });
});

describe('formatRelative', () => {
  it('returns "Hoy" for 0 days', () => {
    expect(formatRelative(0)).toBe('Hoy');
  });

  it('returns "Ayer" for 1 day', () => {
    expect(formatRelative(1)).toBe('Ayer');
  });

  it('returns days for fewer than 30 days', () => {
    expect(formatRelative(5)).toBe('hace 5 d');
    expect(formatRelative(29)).toBe('hace 29 d');
  });

  it('returns months for 30 to 359 days', () => {
    expect(formatRelative(30)).toBe('hace 1 m');
    expect(formatRelative(359)).toBe('hace 11 m');
  });

  it('returns years from 365 days onward', () => {
    expect(formatRelative(365)).toBe('hace 1 a');
    expect(formatRelative(730)).toBe('hace 2 a');
  });

  // Documents current behavior: days in [360, 364] fall through the
  // months branch (floor(360/30) === 12) but floor(360/365) === 0,
  // producing "hace 0 a". Reported as a potential source bug.
  it('produces "hace 0 a" for the 360-364 day gap (known quirk)', () => {
    expect(formatRelative(360)).toBe('hace 0 a');
  });
});

describe('formatRelativeFromNow', () => {
  it('returns an em dash for an invalid value', () => {
    expect(formatRelativeFromNow('garbage')).toBe('—');
  });

  it('formats relative to the provided reference', () => {
    const reference = new Date(2024, 0, 11, 12, 0, 0);

    expect(formatRelativeFromNow(new Date(2024, 0, 11, 10, 0, 0).toISOString(), reference)).toBe('Hoy');
    expect(formatRelativeFromNow(new Date(2024, 0, 10, 12, 0, 0).toISOString(), reference)).toBe('Ayer');
    expect(formatRelativeFromNow(new Date(2024, 0, 1, 12, 0, 0).toISOString(), reference)).toBe('hace 10 d');
  });
});

describe('getInitials', () => {
  it('takes the first letters of the first two words, uppercased', () => {
    expect(getInitials('María Fernanda López')).toBe('MF');
  });

  it('returns one letter for a single word', () => {
    expect(getInitials('Carlos')).toBe('C');
  });

  it('handles extra whitespace', () => {
    expect(getInitials('  ana   gómez  ')).toBe('AG');
  });

  it('returns an empty string for an empty input', () => {
    expect(getInitials('')).toBe('');
  });
});
