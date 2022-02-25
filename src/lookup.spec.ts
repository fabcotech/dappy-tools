import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId, DappyRecord } from '.';
import {
  createGetXRecord,
  createCoResolveRequest,
  getDappyNetworkMembers,
  isDappyNodeResponse,
  isDappyNodeResponseError,
  isDappyRecord,
  isDappyNetwork,
  createGetDappyNetworkMembers,
  // lookup,
} from './lookup';
// import { nodeRequest } from './utils/nodeRequest';
import { spyFns } from './testUtils/spyFns';
import {
  fakeDappyNodeSuccessResponse,
  createDappyRecord,
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

  it('isDappyRecord()', () => {
    const dappyRecord = createDappyRecord();
    expect(isDappyRecord(dappyRecord)).to.eql(true);
    const notDappyRecord = {
      foo: 'bar',
    };
    expect(isDappyRecord(notDappyRecord)).to.eql(false);
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

  it('getXRecord() should return a DappyRecord for an existing name', async () => {
    const record = createDappyRecord();
    const encodedRecord = JSON.stringify({
      success: true,
      records: [
        {
          data: JSON.stringify(record),
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedRecord);

    const r = await createGetXRecord(fakeRequest)(
      'foo',
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(record);
  });

  it('getXRecord() return undefined for an unknown name', async () => {
    const encodedRecord = JSON.stringify({
      success: true,
      records: [
        {
          id: 'foo',
          notfound: 'true',
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedRecord);

    const r = await createGetXRecord(fakeRequest)(
      'foo',
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(undefined, "Expected 'undefined' to be returned");
  });

  it('getXRecord() throw an error on rchain error', async () => {
    const encodedRecord = JSON.stringify({
      success: false,
      error: {
        message: 'unknown error',
      },
    });

    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp = false;
    try {
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = true;
      expect((e as Error).message).to.eql('unknown error');
    }

    expect(throwExp).to.equal(true, 'Expected an error to be thrown');
  });

  it('getXRecord() network connectivity issue', async () => {
    const fakeRequest = () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:31000');
    };

    let throwExp;
    try {
      await createGetXRecord(fakeRequest)(
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

  it('getXRecord() return non JSON value', async () => {
    const fakeRequest = () => Promise.resolve('NOT PARSABLE JSON');

    let throwExp;
    try {
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse response from/,
    );
  });

  it('getXRecord() Dappy node response is incorrect', async () => {
    const encodedRecord = JSON.stringify({
      foo: 'bar',
    });
    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp;
    try {
      const r = await createGetXRecord(fakeRequest)(
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

  xit('getXRecord() returns http error code ', async () => {});

  it('getXRecord() could not parse dappy response data', async () => {
    const encodedRecord = JSON.stringify({
      success: true,
      records: [
        {
          data: 'NOT PARSABLE JSON',
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp;
    try {
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse record data from/,
    );
  });

  it('getXRecord() Dappy record is incorrect', async () => {
    const encodedRecord = JSON.stringify({
      success: true,
      records: [
        {
          data: JSON.stringify({ foo: 'bar' }),
        },
      ],
    });

    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp;
    try {
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkMember());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      `Dappy record is incorrect: ${JSON.stringify({ foo: 'bar' })}`,
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
  // it.only('lookup', async () => {
  //   const dappyRecord = await lookup('myrecord', {
  //     dappyNetwork: [
  //       {
  //         scheme: 'http',
  //         hostname: 'dappy.dev',
  //         port: '3001',
  //         ip: '127.0.0.1',
  //         // caCert: 'a',
  //       },
  //     ],
  //   });
  //   console.log(dappyRecord);
  // });
  it('coResolveRequest with 3 network members (absolute: 2, accuracy: 66%): success scenario (3:abb => b) ', async () => {
    const fakeRecord1 = createDappyRecord();
    const fakeRecord2 = createDappyRecord({
      values: [
        {
          value: '192.168.0.1',
          kind: 'IPv4',
        },
      ],
    });
    const createEncodedRecord = (record: DappyRecord) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(record),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
      getFakeDappyNetworkMember(),
    ];
    const dappyRecord = await coResolve('foo', {
      dappyNetwork,
    });

    expect(dappyRecord).to.eql(fakeRecord2);
    expect(fakeRequest).to.have.been.called.exactly(3);
  });

  it('coResolveRequest with 9 network members (absolute: 4, accuracy: 66%): success scenario (9:baabaa => a)', async () => {
    const fakeRecord1 = createDappyRecord();
    const fakeRecord2 = createDappyRecord({
      values: [
        {
          value: '192.168.0.1',
          kind: 'IPv4',
        },
      ],
    });
    const createEncodedRecord = (record: DappyRecord) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(record),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
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
    const dappyRecord = await coResolve('foo', {
      dappyNetwork,
    });

    expect(dappyRecord).to.eql(fakeRecord1);
    expect(fakeRequest).to.have.been.called.exactly(6);
  });

  it('coResolveRequest with 7 network members (absolute: 4, accuracy: 66%): failed scenario  (7:bbbaaaa => e)', async () => {
    const fakeRecord1 = createDappyRecord();
    const fakeRecord2 = createDappyRecord({
      values: [
        {
          value: '192.168.0.1',
          kind: 'IPv4',
        },
      ],
    });
    const createEncodedRecord = (record: DappyRecord) => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify({ ...record }),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = spyFns([
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
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
    const fakeRecord = createDappyRecord();
    const createEncodedRecord = () => [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify({ ...fakeRecord }),
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
      () => Promise.resolve(createEncodedRecord()),
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
