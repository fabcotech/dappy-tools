import { DappyNetworkMember } from '@fabcotech/dappy-lookup';
import { expect } from 'chai';

import { gossip } from './index';

describe('gossip.ts', () => {
  it('should gossip 2 out of 3', async (done) => {
    const results = await gossip(
      [1, 2, 3] as unknown as DappyNetworkMember[],
      (dnm) => {
        if ((dnm as unknown as number) === 3) {
          return Promise.reject('comm/tls')
        }
        return Promise.resolve(true);
      },
      1
    )
    expect(results).to.equal([true, true, 'comm/tls']);
    done();
  });
});
