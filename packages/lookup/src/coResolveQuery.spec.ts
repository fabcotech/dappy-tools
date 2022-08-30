import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId } from '.';
import {
  createCoResolveQuery,
  getDappyNetworkMembers,
  createGetDappyNetworkMembers,
} from './coResolveQuery';
import { spyFns } from './testUtils/spyFns';
import {
  createNamePacketSuccessResponse,
  getFakeDappyNetworkMember,
} from './model/fakeData';

chai.use(spies);

describe('coResolveQuery', () => {
  it('getDappyNetworkMembers() unknown dappy network', async () => {
    let exp;
    try {
      await getDappyNetworkMembers('unknown' as DappyNetworkId);
    } catch (e) {
      exp = e;
    }
    expect((exp as Error).message).to.eql('unknown or malformed dappy network');
  });

  it('getDappyNetworkInfo() should return custom valid DappyNetworkInfo[]', async () => {
    const customValidNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];
    expect(await getDappyNetworkMembers(customValidNetwork)).to.eql(
      customValidNetwork,
    );
  });

  it('getDappyNetworkInfo() should throw on invalid DappyNetworkInfo[]', async () => {
    const customValidNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      {} as any,
    ];
    let exp;
    try {
      await getDappyNetworkMembers(customValidNetwork);
    } catch (e) {
      exp = e;
    }
    expect((exp as Error).message).to.match(
      /unknown or malformed dappy network/,
    );
  });
  it('Default Dappy network set to dNetwork', async () => {
    const getNetwork = createGetDappyNetworkMembers(() =>
      Promise.resolve({
        d: [
          getFakeDappyNetworkMember({
            ip: 'DNETWORK_MEMBER_1_IP',
          }),
        ],
        gamma: [],
      }),
    );
    expect((await getNetwork())[0].ip).to.eql('DNETWORK_MEMBER_1_IP');
  });
  it('coResolve() with 3 network members (absolute: 2, accuracy: 66%): success scenario (3:abb => b) ', async () => {
    const fakeQuery = spyFns([
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(2),
    ]);

    const coResolve = createCoResolveQuery(fakeQuery);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];
    const response = await coResolve(undefined, {
      dappyNetwork,
    });

    expect(response).to.eql(2);
    expect(fakeQuery).to.have.been.called.exactly(3);
  });

  it('coResolve() with 9 network members (absolute: 4, accuracy: 66%): success scenario (9:baabaa => a)', async () => {
    const fakeRequest = spyFns([
      () => Promise.resolve(2),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
    ]);

    const coResolve = createCoResolveQuery(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];
    const zone = await coResolve(undefined, {
      dappyNetwork,
    });

    expect(zone).to.eql(1);
    expect(fakeRequest).to.have.been.called.exactly(6);
  });

  it('coResolveQuery() with 7 network members (absolute: 4, accuracy: 66%): failed scenario  (7:bbbaaaa => e)', async () => {
    const fakeRequest = spyFns([
      () => Promise.resolve(2),
      () => Promise.resolve(2),
      () => Promise.resolve(2),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
      () => Promise.resolve(1),
    ]);

    const coResolve = createCoResolveQuery(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];

    let exp;
    try {
      await coResolve('foo', {
        dappyNetwork,
      });
    } catch (err) {
      exp = err;
    }
    expect((exp as Error).message).to.match(
      /Query foo not resolved: Unaccurate state/,
    );
  });

  it('coResolveQuery() with 3 network members (absolute: 2, accuracy: 66%): failed scenario  (3:eea => e)', async () => {
    const namePacket = createNamePacketSuccessResponse();

    const fakeRequest = spyFns([
      () => {
        throw new Error('fake error');
      },
      () => {
        throw new Error('fake error');
      },
      () => Promise.resolve(JSON.stringify(namePacket)),
    ]);

    const coResolve = createCoResolveQuery(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];

    let exp;
    try {
      await coResolve('foo', {
        dappyNetwork,
      });
    } catch (err) {
      exp = err;
    }
    expect((exp as Error).message).to.match(
      /Query foo not resolved: Out of nodes/,
    );
  });
});
