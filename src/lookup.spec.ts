import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId, DappyRecord } from '.';
import {
  createGetXRecord,
  createCoResolveRequest,
  getDappyNetworkMembers,
  validateDappyNetworkInfo,
  isDappyNodeResponse,
  isDappyNodeResponseError,
} from './lookup';
// import { nodeRequest } from './utils/nodeRequest';
import { spyFns } from './testUtils/spyFns';
import {
  fakeDappyNodeSuccessResponse,
  createDappyRecord,
  getFakeDappyNetworkInfo,
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

  it('getXRecord() should return a DappyRecord for an existing name', async () => {
    const record = createDappyRecord();
    const encodedRecord = [
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

    const fakeRequest = () => Promise.resolve(encodedRecord);

    const r = await createGetXRecord(fakeRequest)(
      'foo',
      getFakeDappyNetworkInfo(),
    );
    expect(r).to.eql(record);
  });

  it('getXRecord() return undefined for an unknown name', async () => {
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              id: 'foo',
              notfound: 'true',
            },
          ],
        }),
      ),
    ];

    const fakeRequest = () => Promise.resolve(encodedRecord);

    const r = await createGetXRecord(fakeRequest)(
      'foo',
      getFakeDappyNetworkInfo(),
    );
    expect(r).to.eql(undefined, "Expected 'undefined' to be returned");
  });

  it('getXRecord() throw an error on rchain error', async () => {
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          success: false,
          error: {
            message: 'unknown error',
          },
        }),
      ),
    ];

    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp = false;
    try {
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkInfo());
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
        getFakeDappyNetworkInfo({
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
      await createGetXRecord(fakeRequest)('foo', getFakeDappyNetworkInfo());
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse response from/,
    );
  });

  it('getXRecord() Dappy node response is incorrect', async () => {
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          foo: 'bar',
        }),
      ),
    ];
    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp;
    try {
      const r = await createGetXRecord(fakeRequest)(
        'foo',
        getFakeDappyNetworkInfo(),
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

  it('getXRecord() returns http error code ', async () => {});

  it('unknown dappy network', async () => {
    let exp;
    try {
      await getDappyNetworkMembers('unknown' as DappyNetworkId);
    } catch (e) {
      exp = e;
    }
    expect((exp as Error).message).to.eql('unknown dappy network: unknown');
  });

  it('validateDappyNetworkInfo() should throws validation errors', async () => {
    expect(() => validateDappyNetworkInfo({ hostname: '' } as any)).to.throw(
      /missing or malformed hostname: /,
    );
    expect(() =>
      validateDappyNetworkInfo({ hostname: 'hostname', ip: 'notanip' } as any),
    ).to.throw(/missing or malformed ip: notanip/);

    expect(() =>
      validateDappyNetworkInfo({
        hostname: 'hostname',
        ip: '127.0.0.1',
        port: 'wrong_port',
      } as any),
    ).to.throw(/missing or malformed port: wrong_port/);

    expect(() =>
      validateDappyNetworkInfo({
        hostname: 'hostname',
        ip: '127.0.0.1',
        port: '123',
        scheme: 'wrong_scheme',
      } as any),
    ).to.throw(/missing or malformed scheme: wrong_scheme/);

    expect(() =>
      validateDappyNetworkInfo({
        hostname: 'hostname',
        ip: '127.0.0.1',
        port: '123',
        scheme: 'https',
        caCert: 'wrong_ca_cert',
      } as any),
    ).to.throw(/missing or malformed caCert: wrong_ca_cert/);
  });
  it('getDappyNetworkInfo() should return custom valid DappyNetworkInfo[]', async () => {
    const customValidNetwork = [
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
    ];
    expect(await getDappyNetworkMembers(customValidNetwork)).to.eql(
      customValidNetwork,
    );
  });

  it('getDappyNetworkInfo() should throw on invalid DappyNetworkInfo[]', async () => {
    const customValidNetwork = [
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      {} as any,
    ];
    let exp;
    try {
      await getDappyNetworkMembers(customValidNetwork);
    } catch (e) {
      exp = e;
    }
    expect((exp as Error).message).to.match(/missing or malformed/);
  });
  it('coResolveRequest on half network members with minimum 66% accuracy: success scenario', async () => {
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
      () => {
        throw new Error('fake error');
      },
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
    ];
    const dappyRecord = await coResolve('foo', {
      dappyNetwork,
    });

    expect(dappyRecord).to.eql(fakeRecord2);
    expect(fakeRequest).to.have.been.called.exactly(4);
  });

  it('coResolveRequest on half network members with minimum 66% accuracy: failed scenario (different responses)', async () => {
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
      () => Promise.resolve(createEncodedRecord(fakeRecord1)),
      () => Promise.resolve(createEncodedRecord(fakeRecord2)),
      () => {
        throw new Error('fake error');
      },
    ]);

    const coResolve = createCoResolveRequest(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
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

  it('coResolveRequest on half network members with 66% accuracy: failed scenario (not enough members not responding)', async () => {
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
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
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
