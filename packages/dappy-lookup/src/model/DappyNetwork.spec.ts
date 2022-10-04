import { expect } from 'chai';

import { isDappyNetwork } from './DappyNetwork';

describe('DappyNetwork', () => {
  it('should parse https member', async () => {
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '123',
          scheme: 'https',
          caCert: Buffer.from('fake_ca_cert', 'utf8').toString('base64'),
        },
      ]),
    ).to.eql(true);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '123',
          scheme: 'https',
        },
      ]),
    ).to.eql(false);
  });
  it('should parse http member', async () => {
    expect(isDappyNetwork([{ hostname: '' }])).to.eql(false);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '123',
          scheme: 'http',
        },
      ]),
    ).to.eql(true);
  });
  it('should validate port between 0 and 65535', () => {
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '65536',
          scheme: 'http',
        },
      ]),
    ).to.eql(false);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '80',
          scheme: 'http',
        },
      ]),
    ).to.eql(true);
  });
  it('should validate hostname', () => {
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname.a0.bar',
          ip: '127.0.0.1',
          port: '80',
          scheme: 'http',
        },
      ]),
    ).to.eql(true);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname-foo/bar',
          ip: '127.0.0.1',
          port: '80',
          scheme: 'http',
        },
      ]),
    ).to.eql(false);
  });
  it('should validate base64', () => {
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '80',
          scheme: 'https',
          caCert: '34567*%£*',
        },
      ]),
    ).to.eql(false);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '80',
          scheme: 'https',
          caCert: Buffer.from('34567*%£*').toString('base64'),
        },
      ]),
    ).to.eql(true);
  });
});
