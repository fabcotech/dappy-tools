import { createNameZone } from '@fabcotech/dappy-model';
import chai from 'chai';
import spies from 'chai-spies';

import { getTLDs, normalizeRecords } from './utils';

const { expect } = chai;
chai.use(spies);

describe('dns-query', () => {
  it('normalizeRecords() returns records with zone data', () => {
    const zone = createNameZone();
    zone.records = [
      { name: '@', type: 'A', data: '127.0.0.1' },
      { name: '', type: 'A', data: '127.0.0.1' },
      {
        name: 'foo',
        type: 'A',
        data: '127.0.0.1',
        ttl: 300,
      },
    ];

    expect(normalizeRecords(zone, zone.records, 'fakeNetwork')).to.eql([
      {
        name: zone.origin,
        type: 'A',
        data: '127.0.0.1',
        ttl: 3600,
      },
      {
        name: zone.origin,
        type: 'A',
        data: '127.0.0.1',
        ttl: 3600,
      },
      {
        name: `foo.${zone.origin}`,
        type: 'A',
        data: '127.0.0.1',
        ttl: 300,
      },
    ]);
  });
  it('getTLDs()', () => {
    expect(getTLDs(['foo.bar.baz'], 'baz')).to.eql(['bar']);
    expect(getTLDs(['hello.world.foo.bar.baz'], 'd')).to.eql(['baz']);
    expect(getTLDs(['hello.world.foo.bar.baz'], 'bar')).to.eql(['baz']);
    expect(getTLDs(['hello.world.foo.bar.baz'], 'baz')).to.eql(['bar']);
    expect(getTLDs(['foo'], 'd')).to.eql(['foo']);
    expect(getTLDs(['foo.d'], 'd')).to.eql(['foo']);
    expect(getTLDs(['foo.bar.d'], 'd')).to.eql(['bar']);
    expect(getTLDs(['foo.bar.gamma'], 'd')).to.eql(['gamma']);
    expect(getTLDs(['foo.bar.gamma'], 'gamma')).to.eql(['bar']);
    expect(getTLDs(['default.dappy.gamma'], 'gamma')).to.eql(['dappy']);
    expect(getTLDs(['default.dappy.d'], 'gamma')).to.eql(['d']);
    expect(getTLDs(['default.dappy.d'], 'd')).to.eql(['dappy']);
  });
});
