import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId, DappyRecord } from '.';
import {
  createGetXRecord,
  createCoResolveRequest,
  getDappyNetworkMembers,
  validateDappyNetworkInfo,
} from './lookup';
import { spyFns } from './testUtils/spyFns';
import {
  createDappyRecord,
  getFakeDappyNetworkInfo,
} from './testUtils/fakeData';

chai.use(spies);

describe('lookup', () => {
  it('getXRecord() should resolve a name', async () => {
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

  xit('getXRecord() application http error (wrong path)', () => {});
  xit('getXRecord() network connectivity issue', () => {});
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
