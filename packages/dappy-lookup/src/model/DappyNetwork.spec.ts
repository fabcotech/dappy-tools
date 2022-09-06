import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { isDappyNetwork } from './DappyNetwork';

chai.use(spies);

describe('DappyNetwork', () => {
  it('isDappyNetwork()', async () => {
    expect(isDappyNetwork([{ hostname: '' }])).to.eql(false);
    expect(
      isDappyNetwork([
        {
          hostname: 'hostname',
          ip: '127.0.0.1',
          port: '123',
          scheme: 'https',
          caCert: Buffer.from('wrong_ca_cert', 'utf8').toString('base64'),
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
    ).to.eql(true);
  });
});
