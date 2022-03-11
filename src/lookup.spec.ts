import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId } from '.';
import {
  createCoResolveRequest,
  getDappyNetworkMembers,
  createGetDappyNetworkMembers,
  createGetRecords,
} from './lookup';
import { spyFns } from './testUtils/spyFns';
import {
  createNamePacketSuccessResponse,
  getFakeDappyNetworkMember,
} from './model/fakeData';
import { RecordType } from './model/ResourceRecords';

chai.use(spies);

describe('lookup', () => {
  it('createGetRecords() should return NamePacket for an existing name', async () => {
    const namePacket = createNamePacketSuccessResponse();
    const fakeRequest = () => Promise.resolve(JSON.stringify(namePacket));

    const r = await createGetRecords(fakeRequest)(
      'example.com',
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(namePacket);
  });

  it('createGetRecords() network connectivity issue', async () => {
    const fakeRequest = () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:31000');
    };

    let throwExp;
    try {
      await createGetRecords(fakeRequest)(
        'foo',
        getFakeDappyNetworkMember({
          ip: '127.0.0.1',
          port: '31000',
        }),
      );
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      'connect ECONNREFUSED 127.0.0.1:31000',
    );
  });

  it('createGetRecords() return non JSON value', async () => {
    const fakeRequest = () => Promise.resolve('NOT PARSABLE JSON');

    let throwExp;
    try {
      await createGetRecords(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse response from/,
    );
  });

  it('createGetRecords() Dappy node response is incorrect', async () => {
    const encodedZone = JSON.stringify({
      foo: 'bar',
    });
    const fakeRequest = () => Promise.resolve(encodedZone);

    let throwExp;
    try {
      const r = await createGetRecords(fakeRequest)(
        'foo',
        getFakeDappyNetworkMember(),
      );
      console.log(r);
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      `Name packet is incorrect: ${JSON.stringify({
        foo: 'bar',
      })}`,
    );
  });

  xit('createGetRecords() returns http error code ', async () => {});

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
  it('coResolveRequest with 3 network members (absolute: 2, accuracy: 66%): success scenario (3:abb => b) ', async () => {
    const namePacket1 = createNamePacketSuccessResponse();
    const namePacket2 = createNamePacketSuccessResponse({
      answers: [
        {
          name: '@',
          data: '192.168.1.1',
          type: RecordType.A,
          ttl: 60,
          class: 'IN',
        },
      ],
    });

    const fakeRequest = spyFns([
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket2)),
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];
    const zone = await coResolve('foo', {
      dappyNetwork,
    });

    expect(zone).to.eql(namePacket2);
    expect(fakeRequest).to.have.been.called.exactly(3);
  });

  it('coResolveRequest with 9 network members (absolute: 4, accuracy: 66%): success scenario (9:baabaa => a)', async () => {
    const namePacket1 = createNamePacketSuccessResponse();
    const namePacket2 = createNamePacketSuccessResponse({
      answers: [
        {
          name: '@',
          data: '192.168.1.1',
          type: RecordType.A,
          ttl: 60,
          class: 'IN',
        },
      ],
    });

    const fakeRequest = spyFns([
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

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
    const zone = await coResolve('foo', {
      dappyNetwork,
    });

    expect(zone).to.eql(namePacket1);
    expect(fakeRequest).to.have.been.called.exactly(6);
  });

  it('coResolveRequest with 7 network members (absolute: 4, accuracy: 66%): failed scenario  (7:bbbaaaa => e)', async () => {
    const namePacket1 = createNamePacketSuccessResponse();
    const namePacket2 = createNamePacketSuccessResponse({
      answers: [
        {
          name: '@',
          data: '192.168.1.1',
          type: RecordType.A,
          ttl: 60,
          class: 'IN',
        },
      ],
    });

    const fakeRequest = spyFns([
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket2)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
      () => Promise.resolve(JSON.stringify(namePacket1)),
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

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
      /Name foo not resolved: Unaccurate state/,
    );
  });

  it('coResolveRequest with 3 network members (absolute: 2, accuracy: 66%): failed scenario  (3:eea => e)', async () => {
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

    const coResolve = createCoResolveRequest(fakeRequest);

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
      /Name foo not resolved: Out of nodes/,
    );
  });
});
