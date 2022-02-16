import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { internalCreateCachedNodeLookup } from './nodeLookup';
import { createDappyRecord } from './testUtils/fakeData';

chai.use(spies);

describe('nodeLookup', () => {
  it('create a cached version of dappy lookup for node', (done) => {
    const record = createDappyRecord();
    const fakeDappyLookup = () => Promise.resolve(record);
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
    const record = createDappyRecord();
    const fakeDappyLookup = chai.spy(() => Promise.resolve(record));
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
    const record = createDappyRecord({
      values: [
        { value: '127.0.0.1', kind: 'IPv4' },
        { value: '::1', kind: 'IPv6' },
        { value: '::2', kind: 'IPv6' },
      ],
    });
    const fakeDappyLookup = chai.spy(() => Promise.resolve(record));
    const { lookup } = internalCreateCachedNodeLookup(fakeDappyLookup)();

    lookup('foo', { family: 6 }, (err, address: string, family: string) => {
      try {
        expect(address).to.eql(record.values[1].value);
        expect(family).to.eql(6);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
