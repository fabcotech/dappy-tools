import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { DappyNetworkId } from '.';
import {
  createGetXRecord,
  createCoResolveRequest,
  getDappyNetworkMembers,
  validateDappyNetworkInfo,
} from './lookup';
import { createDappyRecord, getFakeDappyNetworkInfo } from './utils/fakeData';

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
  it('coResolveRequest on all network members with 100% accuracy', async () => {
    const fakeRecord = createDappyRecord();
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(fakeRecord),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = chai.spy(() => Promise.resolve(encodedRecord));

    const coResolve = createCoResolveRequest(fakeRequest);

    const dappyNetwork = [
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
      getFakeDappyNetworkInfo(),
    ];
    const dappyRecord = await coResolve('foo', {
      dappyNetwork,
    });

    expect(dappyRecord).to.eql(fakeRecord);
    expect(fakeRequest).to.have.been.called.exactly(dappyNetwork.length);
  });
});
