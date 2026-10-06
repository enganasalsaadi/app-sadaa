import { parseAppLink } from '../appLink';

const HOST = 'links.sada.app';
const creator = (slug: string) => ({ kind: 'creator', slug });

describe('parseAppLink', () => {
  it('parses universal links on the configured host', () => {
    expect(parseAppLink('https://links.sada.app/c/anas', HOST)).toEqual(creator('anas'));
    expect(parseAppLink('https://links.sada.app/c/anas.style/', HOST)).toEqual(
      creator('anas.style'),
    );
    expect(parseAppLink('https://links.sada.app/c/anas_1?src=link#top', HOST)).toEqual(
      creator('anas_1'),
    );
  });

  it('lowercases the slug and the host (case-insensitive)', () => {
    expect(parseAppLink('HTTPS://Links.Sada.App/c/Anas.Style', HOST)).toEqual(
      creator('anas.style'),
    );
  });

  it('parses the custom scheme', () => {
    expect(parseAppLink('sada://c/anas', HOST)).toEqual(creator('anas'));
    expect(parseAppLink('sada://c/anas/?src=web', HOST)).toEqual(creator('anas'));
    expect(parseAppLink('SADA://C/ANAS', HOST)).toEqual(creator('anas'));
  });

  it('rejects slugs that break the §17.2 rule', () => {
    [
      'ab', // too short
      'a'.repeat(31), // too long
      '.anas',
      'anas.',
      'an..as',
      'an-as',
      'an%20as',
      'anas!',
    ].forEach(slug => {
      expect(parseAppLink(`https://links.sada.app/c/${slug}`, HOST)).toBeNull();
    });
  });

  it('rejects other hosts, schemes, ports and user-info', () => {
    [
      'http://links.sada.app/c/anas',
      'https://evil.com/c/anas',
      'https://links.sada.app.evil.com/c/anas',
      'https://links.sada.app:8443/c/anas',
      'https://user@links.sada.app/c/anas',
      'https://evil.com@links.sada.app/c/anas',
      'ftp://links.sada.app/c/anas',
      'intent://links.sada.app/c/anas',
    ].forEach(url => expect(parseAppLink(url, HOST)).toBeNull());
  });

  it('rejects other paths and routes', () => {
    [
      'https://links.sada.app/',
      'https://links.sada.app/c',
      'https://links.sada.app/c/',
      'https://links.sada.app/c//anas',
      'https://links.sada.app/c/anas/extra',
      'https://links.sada.app/x/anas',
      'https://links.sada.app/C/../c/anas',
      'sada://kyc',
      'sada://platforms/01J',
      'sada://c',
      'sada://c/anas/extra',
    ].forEach(url => expect(parseAppLink(url, HOST)).toBeNull());
  });

  it('ignores https links while no web host is configured', () => {
    expect(parseAppLink('https://links.sada.app/c/anas', '')).toBeNull();
    expect(parseAppLink('sada://c/anas', '')).toEqual(creator('anas'));
  });

  it('rejects non-strings, empty and oversized input', () => {
    expect(parseAppLink(null, HOST)).toBeNull();
    expect(parseAppLink(undefined, HOST)).toBeNull();
    expect(parseAppLink(42, HOST)).toBeNull();
    expect(parseAppLink('', HOST)).toBeNull();
    expect(parseAppLink(`https://links.sada.app/c/anas?${'x'.repeat(3000)}`, HOST)).toBeNull();
  });
});
