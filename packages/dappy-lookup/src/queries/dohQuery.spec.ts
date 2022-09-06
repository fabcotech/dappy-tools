import chai, { expect } from 'chai';
import spies from 'chai-spies';

import dnsPacket, { Packet } from 'dns-packet';

import { DappyNetworkMember } from '..';

import { createDohQuery } from './dohQuery';

import {
  createNamePacketSuccessResponse,
  getFakeDappyNetworkMember,
} from '../model/fakeData';
import { RecordType } from '../model/ResourceRecords';

chai.use(spies);

describe('dohQuery', () => {
  it('createDohQuery() should make a DoH compliant request', async () => {
    const namePacket = createNamePacketSuccessResponse();
    const fakeRequest = chai.spy(() =>
      Promise.resolve([dnsPacket.encode(namePacket as Packet)]),
    );
    const fakeMember = getFakeDappyNetworkMember() as DappyNetworkMember & {
      caCert: string;
    };
    await createDohQuery(fakeRequest)(
      {
        name: 'example.dappy',
        recordType: RecordType.A,
      },
      fakeMember,
    );

    const dnsQuery = dnsPacket.encode({
      type: 'query',
      id: 0,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          name: 'example.dappy',
          type: 'A',
        },
      ],
    });

    expect(fakeRequest).to.have.been.called.with({
      scheme: fakeMember.scheme,
      host: fakeMember.ip,
      port: fakeMember.port,
      path: '/dns-query',
      method: 'POST',
      headers: {
        Host: fakeMember.hostname,
        'content-type': 'application/dns-message',
        'content-length': dnsQuery.length,
      },
      body: dnsQuery,
      ca: Buffer.from(fakeMember.caCert, 'base64').toString(),
    });
  });

  it('createDohQuery() should return NamePacket for an existing name', async () => {
    const namePacket = dnsPacket.encode(
      createNamePacketSuccessResponse() as Packet,
    );
    const fakeRequest = () => Promise.resolve([namePacket]);

    const r = await createDohQuery(fakeRequest)(
      {
        name: 'example.dappy',
        recordType: RecordType.A,
      },
      getFakeDappyNetworkMember(),
    );
    expect(r).to.eql(dnsPacket.decode(namePacket));
  });

  it('createDohQuery() network connectivity issue', async () => {
    const fakeRequest = () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:31000');
    };

    let throwExp;
    try {
      await createDohQuery(fakeRequest)(
        {
          name: 'example.dappy',
          recordType: RecordType.A,
        },
        getFakeDappyNetworkMember({
          ip: '127.0.0.1',
          port: '31000',
        }),
      );
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.eql(
      'connect ECONNREFUSED 127.0.0.1:31000',
    );
  });

  it('createDohQuery() return non JSON value', async () => {
    const fakeRequest = () => Promise.resolve([Buffer.from('not json')]);

    let throwExp;
    try {
      await createDohQuery(fakeRequest)(
        {
          name: 'example.dappy',
          recordType: RecordType.A,
        },
        getFakeDappyNetworkMember(),
      );
    } catch (e) {
      throwExp = e;
    }

    expect((throwExp as Error).message).to.match(
      /^Could not parse response from/,
    );
  });
});
