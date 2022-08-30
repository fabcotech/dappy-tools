import { expect } from 'chai';

import { parseUrl } from './parse';

describe('parseUrl', () => {
  it('url with explicit port', () => {
    expect(parseUrl('http://localhost:8080')).to.eql({
      scheme: 'http',
      hostname: 'localhost',
      port: '8080',
    });
  });
  it('url with implicit port', () => {
    expect(parseUrl('http://localhost')).to.eql({
      scheme: 'http',
      hostname: 'localhost',
      port: '80',
    });
    expect(parseUrl('https://localhost')).to.eql({
      scheme: 'https',
      hostname: 'localhost',
      port: '443',
    });
  });
  it('url with ip as hostname', () => {
    expect(parseUrl('https://127.0.0.1:8081')).to.eql({
      scheme: 'https',
      hostname: '127.0.0.1',
      port: '8081',
    });
  });
  it('return ', () => {
    expect(parseUrl('foo')).to.eql(undefined);
  });
});
