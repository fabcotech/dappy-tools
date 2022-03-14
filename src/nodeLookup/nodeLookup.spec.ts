import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { internalCreateCachedNodeLookup } from './nodeLookup';
import {
  createNamePacketErrorResponse,
  createNamePacketSuccessResponse,
} from '../model/fakeData';
import { ReturnCode } from '../model/NamePacket';
import { RecordType } from '../model/ResourceRecords';

chai.use(spies);

describe('nodeLookup', () => {
  it('create a cached version of dappy lookup for node', (done) => {
    const namePacket = createNamePacketSuccessResponse();
    const fakeDappyLookup = () => Promise.resolve(namePacket);
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('foo', {}, (err, address, family) => {
      try {
        expect(err).to.equal(null);
        expect(address).to.equal('127.0.0.1');
        expect(family).to.equal(4);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  it('dappy lookup should be called once', (done) => {
    const namePacket = createNamePacketSuccessResponse({
      answers: [
        {
          type: RecordType.CERT,
          class: 'IN',
          ttl: 3600,
          data: 'foo',
          name: '@',
        },
      ],
    });
    const fakeDappyLookup = chai.spy(() => Promise.resolve(namePacket));
    const { lookup, getCA } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    getCA('example.com')
      .then(() => {
        lookup('example.com', {}, () => {
          try {
            expect(fakeDappyLookup).to.have.been.called.exactly(1);
            done();
          } catch (e) {
            done(e);
          }
        });
      })
      .catch((e) => {
        done(e);
      });
  });

  it('should returns all IPv6 addresses', (done) => {
    const namePacket = createNamePacketSuccessResponse({
      answers: [
        { name: '@', class: 'IN', ttl: 60, type: RecordType.AAAA, data: '::1' },
        { name: '@', class: 'IN', ttl: 60, type: RecordType.AAAA, data: '::2' },
      ],
    });
    const fakeDappyLookup = chai.spy(() => Promise.resolve(namePacket));
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('foo', { family: 6 }, (err, address: string, family: string) => {
      try {
        expect(address).to.eql(namePacket.answers[0].data);
        expect(family).to.eql(6);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('lookup() should throw error on unknown name', (done) => {
    const fakeDappyLookup = () =>
      Promise.resolve(
        createNamePacketErrorResponse({
          rcode: ReturnCode.NXDOMAIN,
        }),
      );
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('example.com', {}, (err) => {
      try {
        expect(err.message).to.equal(
          'No address found for name example.com (format: IPv4)',
        );
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  it('getCA() should throw error on unknown name', async () => {
    const fakeDappyLookup = () =>
      Promise.resolve(
        createNamePacketErrorResponse({
          rcode: ReturnCode.NXDOMAIN,
        }),
      );
    const { getCA } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    let throwExp;
    try {
      await getCA('foo');
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as any).message).to.equal('No cert found for name foo');
  });
});
