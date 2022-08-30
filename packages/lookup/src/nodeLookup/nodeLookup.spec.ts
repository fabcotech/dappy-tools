import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { nodeLookup } from './nodeLookup';
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
    const lookup = nodeLookup(fakeDappyLookup);

    lookup('example.dappy', {}, (err, address, family) => {
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

  it('should returns first IPv6 address', (done) => {
    const namePacket = createNamePacketSuccessResponse({
      answers: [
        { name: '@', class: 'IN', ttl: 60, type: RecordType.AAAA, data: '::1' },
        { name: '@', class: 'IN', ttl: 60, type: RecordType.AAAA, data: '::2' },
      ],
    });
    const fakeDappyLookup = chai.spy(() => Promise.resolve(namePacket));
    const lookup = nodeLookup(fakeDappyLookup);

    lookup(
      'example.dappy',
      { family: 6 },
      (err, address: string, family: string) => {
        try {
          expect(address).to.eql(namePacket.answers[0].data);
          expect(family).to.eql(6);
          done();
        } catch (e) {
          done(e);
        }
      },
    );
  });

  it('lookup() should throw error on unknown name', (done) => {
    const fakeDappyLookup = () =>
      Promise.resolve(
        createNamePacketErrorResponse({
          rcode: ReturnCode.NXDOMAIN,
        }),
      );
    const lookup = nodeLookup(fakeDappyLookup);

    lookup('example.dappy', {}, (err) => {
      try {
        expect(err.message).to.equal(
          'No address found for name example.dappy (format: IPv4)',
        );
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
