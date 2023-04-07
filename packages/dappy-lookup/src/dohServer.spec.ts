import chai, { expect } from 'chai';
import spies from 'chai-spies';
import dnsPacket from 'dns-packet';
import {
  dnsErrorPacket,
  dnsQuery,
  getResponseData,
  hasDnsAnswer,
  hasDnsQuery,
} from './dohServer';
import { createNamePacketQuery } from './model';
import { fakeApi } from './cli/utils/test.spec';
import { DappyDohServerOptions } from './types';

chai.use(spies);

describe('dohServer', () => {
  it('hasDnsQuery()', () => {
    expect(
      hasDnsQuery({
        questions: [
          {
            name: 'test',
            type: 'A',
          },
        ],
      }),
    ).to.eql(true);

    expect(
      hasDnsQuery({
        questions: [],
      }),
    ).to.eql(false);
    expect(hasDnsQuery({})).to.eql(false);
  });
  it('hasDnsAnswer()', () => {
    expect(
      hasDnsAnswer({
        answers: [
          {
            name: 'test',
            type: 'A',
            data: '',
          },
        ],
      }),
    ).to.eql(true);

    expect(
      hasDnsAnswer({
        answers: [],
      }),
    ).to.eql(false);
    expect(hasDnsAnswer({})).to.eql(false);
  });

  it('dnsErrorPacket()', () => {
    expect(
      dnsErrorPacket({
        id: 1,
      }) !== undefined,
    ).to.equal(true);
  });

  it('getResponseData()', () => {
    expect(getResponseData({})).to.eql(undefined);
    expect(getResponseData({ answers: [] })).to.eql(undefined);
    expect(
      getResponseData({
        answers: [{ data: 'test', name: 'test', type: 'A' }],
      }),
    ).to.eql('test');
  });

  it('dnsQuery()', async () => {
    const api = fakeApi();
    const packet = createNamePacketQuery();
    const options: DappyDohServerOptions = { dappyNetwork: 'd' };
    await dnsQuery(api, options)(dnsPacket.encode(packet as dnsPacket.Packet));
    expect(api.lookup).to.have.been.called.with(
      packet.questions[0].name,
      packet.questions[0].type,
      options,
    );
  });
});
