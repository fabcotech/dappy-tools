import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { internalCreateCachedNodeLookup } from './nodeLookup';
import { createDappyZone } from './testUtils/fakeData';

chai.use(spies);

describe('nodeLookup', () => {
  it('create a cached version of dappy lookup for node', (done) => {
    const zone = createDappyZone();
    const fakeDappyLookup = () => Promise.resolve(zone);
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
    const zone = createDappyZone();
    const fakeDappyLookup = chai.spy(() => Promise.resolve(zone));
    const { lookup, getCA } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    getCA('foo').then(() => {
      lookup('foo', {}, () => {
        try {
          expect(fakeDappyLookup).to.have.been.called.exactly(1);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  it('should returns all IPv6 addresses', (done) => {
    const zone = createDappyZone({
      A: [{ name: '@', ip: '127.0.0.1' }],
      AAAA: [
        { name: '@', ip: '::1' },
        { name: '@', ip: '::2' },
      ],
    });
    const fakeDappyLookup = chai.spy(() => Promise.resolve(zone));
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('foo', { family: 6 }, (err, address: string, family: string) => {
      try {
        expect(address).to.eql(zone.AAAA![0].ip);
        expect(family).to.eql(6);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('lookup() should throw error on unknown name', (done) => {
    const fakeDappyLookup = () => Promise.resolve(undefined);
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('foo', {}, (err) => {
      try {
        expect(err.message).to.equal(
          'No address found for name foo (format: IPv4)',
        );
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  it('getCA() should throw error on unknown name', async () => {
    const fakeDappyLookup = () => Promise.resolve(undefined);
    const { getCA } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    let throwExp;
    try {
      await getCA('foo');
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as any).message).to.equal('No zone found for name foo');
  });
});
