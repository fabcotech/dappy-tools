import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { isRRA, isRRAAAA, isRRCERT, isRRCNAME, isRRTXT } from './ResourceRecords';
import { createRRA, createRRAAAA, createRRCERT, createRRCNAME, createRRTXT } from './fakeData';

chai.use(spies);

describe('ResourceRecords', () => {
  it('isRRA()', () => {
    const recordA = createRRA();
    expect(isRRA(recordA)).to.eql(true);
    const notRecordA = {
      foo: 'bar',
    };
    expect(isRRA(notRecordA)).to.eql(false);
  });
  it('isRRAAAA()', () => {
    const recordAAAAA = createRRAAAA();
    expect(isRRAAAA(recordAAAAA)).to.eql(true);
    const notRecordAAAA = {
      foo: 'bar',
    };
    expect(isRRAAAA(notRecordAAAA)).to.eql(false);
  });
  it('isRRCERT()', () => {
    const recordCERT = createRRCERT();
    expect(isRRCERT(recordCERT)).to.eql(true);
    const notRecordCERT = {
      foo: 'bar',
    };
    expect(isRRCERT(notRecordCERT)).to.eql(false);
  });

  it('isRRTXT()', () => {
    const recordTXT = createRRTXT();
    expect(isRRTXT(recordTXT)).to.eql(true);
    const notRecordTXT = {
      foo: 'bar',
    };
    expect(isRRCERT(notRecordTXT)).to.eql(false);
  });

  it('isRRCNAME()', () => {
    const recordCNAME = createRRCNAME();
    console.log(recordCNAME)
    expect(isRRCNAME(recordCNAME)).to.eql(true);
    const notRecordCNAME = {
      foo: 'bar',
    };
    expect(isRRCERT(notRecordCNAME)).to.eql(false);
  });
});
