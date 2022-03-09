import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId, DappyZone } from '.';
import {
  createGetZone,
  createCoResolveRequest,
  getDappyNetworkMembers,
  isDappyNodeResponse,
  isDappyNodeResponseError,
  isDappyZone,
  isDappyNetwork,
  createGetDappyNetworkMembers,
} from './lookup';
import { spyFns } from './testUtils/spyFns';
import {
  fakeDappyNodeSuccessResponse,
  createDappyZone,
  getFakeDappyNetworkMember,
  fakeDappyNodeErrorResponse,
} from './testUtils/fakeData';

chai.use(spies);

describe('lookup', () => {
  it('isDappyNodeResponse()', () => {
    const dappyNodeResponse = fakeDappyNodeSuccessResponse();
    expect(isDappyNodeResponse(dappyNodeResponse)).to.eql(true);
    const notDappyDappyResponse = {
      foo: 'bar',
    };
    expect(isDappyNodeResponse(notDappyDappyResponse)).to.eql(false);
  });

  it('isDappyNodeResponseError()', () => {
    const errorResponse = fakeDappyNodeErrorResponse();
    expect(isDappyNodeResponseError(errorResponse)).to.eql(true);
    const successResponse = fakeDappyNodeSuccessResponse();
    expect(isDappyNodeResponseError(successResponse)).to.eql(false);
  });

  it('isDappyZone()', () => {
    const dappyZone = createDappyZone();
    expect(isDappyZone(dappyZone)).to.eql(true);
    const notDappyZone = {
      foo: 'bar',
    };
    expect(isDappyZone(notDappyZone)).to.eql(false);
  });

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

  it('getZone() should return a DappyZone for an existing name', async () => {
    const zone = createDappyZone();
    const encodedZone = JSON.stringify({
      success: true,
      records: [
        {
          data: JSON.stringify(zone),
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedZone);

    const r = await createGetZone(fakeRequest)(
      'foo',
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(zone);
  });

  it('getZone() return undefined for an unknown name', async () => {
    const encodedZone = JSON.stringify({
      success: true,
      records: [
        {
          id: 'foo',
          notfound: 'true',
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedZone);

    const r = await createGetZone(fakeRequest)(
      'foo',
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(undefined, "Expected 'undefined' to be returned");
  });

  it('getZone() throw an error on rchain error', async () => {
    const encodedZone = JSON.stringify({
      success: false,
      error: {
        message: 'unknown error',
      },
    });

    const fakeRequest = () => Promise.resolve(encodedZone);

    let throwExp = false;
    try {
      await createGetZone(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = true;
      expect((e as Error).message).to.eql('unknown error');
    }

    expect(throwExp).to.equal(true, 'Expected an error to be thrown');
  });

  it('getZone() network connectivity issue', async () => {
    const fakeRequest = () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:31000');
    };

    let throwExp;
    try {
      await createGetZone(fakeRequest)(
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

  it('getZone() return non JSON value', async () => {
    const fakeRequest = () => Promise.resolve('NOT PARSABLE JSON');

    let throwExp;
    try {
      await createGetZone(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse response from/,
    );
  });

  it('getZone() Dappy node response is incorrect', async () => {
    const encodedZone = JSON.stringify({
      foo: 'bar',
    });
    const fakeRequest = () => Promise.resolve(encodedZone);

    let throwExp;
    try {
      const r = await createGetZone(fakeRequest)(
        'foo',
        getFakeDappyNetworkMember(),
      );
      console.log(r);
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      `Dappy node response is incorrect: ${JSON.stringify({
        foo: 'bar',
      })}`,
    );
  });

  xit('getZone() returns http error code ', async () => {});

  it('getZone() could not parse dappy response data', async () => {
    const encodedZone = JSON.stringify({
      success: true,
      records: [
        {
          data: 'NOT PARSABLE JSON',
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedZone);

    let throwExp;
    try {
      await createGetZone(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse zone data from/,
    );
  });

  it('getZone() Dappy zone is incorrect', async () => {
    const encodedZone = JSON.stringify({
      success: true,
      records: [
        {
          data: JSON.stringify({ foo: 'bar' }),
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedZone);

    let throwExp;
    try {
      await createGetZone(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      `Dappy zone is incorrect: ${JSON.stringify({ foo: 'bar' })}`,
    );
  });

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
    const fakeZone1 = createDappyZone();
    const fakeZone2 = createDappyZone({
      a: [{ name: '@', ip: '192.168.1.1' }],
    });
    const createEncodedZone = (zone: DappyZone) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(zone),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone2)),
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

    expect(zone).to.eql(fakeZone2);
    expect(fakeRequest).to.have.been.called.exactly(3);
  });

  it('coResolveRequest with 9 network members (absolute: 4, accuracy: 66%): success scenario (9:baabaa => a)', async () => {
    const fakeZone1 = createDappyZone();
    const fakeZone2 = createDappyZone({
      a: [{ name: '@', ip: '192.168.1.1' }],
    });
    const createEncodedZone = (zone: DappyZone) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(zone),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
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

    expect(zone).to.eql(fakeZone1);
    expect(fakeRequest).to.have.been.called.exactly(6);
  });

  it('coResolveRequest with 7 network members (absolute: 4, accuracy: 66%): failed scenario  (7:bbbaaaa => e)', async () => {
    const fakeZone1 = createDappyZone();
    const fakeZone2 = createDappyZone({
      a: [{ name: '@', ip: '192.168.1.1' }],
    });
    const createEncodedZone = (zone: DappyZone) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify({ ...zone }),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone2)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
      () => Promise.resolve(createEncodedZone(fakeZone1)),
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
    const fakeZone = createDappyZone();
    const createEncodedZone = () => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify({ ...fakeZone }),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => {
        throw new Error('fake error');
      },
      () => {
        throw new Error('fake error');
      },
      () => Promise.resolve(createEncodedZone()),
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
