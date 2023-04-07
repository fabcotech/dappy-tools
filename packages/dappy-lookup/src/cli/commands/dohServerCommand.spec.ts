import chai, { expect } from 'chai';
import spies from 'chai-spies';

chai.use(spies);

describe('cli command: dohServer', () => {
  it('should works', async () => {
    expect(1).to.equal(1);
  });
});
