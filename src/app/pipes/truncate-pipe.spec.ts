import { TruncatePipe } from './truncate-pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('returns an empty string for null and undefined values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('leaves short text unchanged without adding a trail', () => {
    expect(pipe.transform('Short bio')).toBe('Short bio');
  });

  it('truncates text at the default limit and adds three dots', () => {
    const text = 'a'.repeat(61);

    expect(pipe.transform(text)).toBe(`${'a'.repeat(60)}...`);
  });

  it('supports a custom limit and trail', () => {
    expect(pipe.transform('This bio is long', 5, '…')).toBe('This…');
  });

  it('does not add a trail when the text matches the limit', () => {
    expect(pipe.transform('Exactly', 7, '…')).toBe('Exactly');
  });
});
