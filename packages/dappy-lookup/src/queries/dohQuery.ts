import dnsPacket, { Packet } from 'dns-packet';

import {
  DappyNetworkMember,
  isDappyNetworkMemberHTTPS,
  NamePacket,
  RecordType,
} from '../model';
import { JSONObject } from '../utils/json';
import { nodeRequest } from '../utils/nodeRequest';

const DNS_QUERY_PATH = '/dns-query';

export const tryParseDnsPacket = (raw: Buffer): Packet | undefined => {
  try {
    return dnsPacket.decode(raw) as JSONObject;
  } catch (e) {
    return undefined;
  }
};

export const createDohQuery =
  (request: typeof nodeRequest) =>
  async (
    { name, recordType }: { name: string; recordType: RecordType },
    options: DappyNetworkMember,
  ) => {
    const { hostname, port, scheme, ip } = options;
    const dnsQuery = dnsPacket.encode({
      type: 'query',
      id: 0,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          name,
          type: recordType,
        },
      ],
    });
    const reqOptions: Parameters<typeof request>[0] = {
      scheme,
      host: ip,
      port,
      path: DNS_QUERY_PATH,
      method: 'POST',
      headers: {
        Host: hostname,
        'content-type': 'application/dns-message',
        'content-length': dnsQuery.length,
      },
      body: dnsQuery,
    };
    if (isDappyNetworkMemberHTTPS(options)) {
      reqOptions.ca = Buffer.from(options.caCert, 'base64').toString();
    }
    const rawResponse = await request(reqOptions);

    const jsonResponse = tryParseDnsPacket(Buffer.concat(rawResponse as any));

    if (!jsonResponse || Array.isArray(jsonResponse)) {
      throw new Error(
        `Could not parse response from ${scheme}://${hostname}:${port}/${DNS_QUERY_PATH}`,
      );
    }

    const packet = {
      ...jsonResponse,
      answers: (jsonResponse.answers || []).map((answer: any) => ({
        ...answer,
        data:
          answer.type === 'TXT'
            ? Buffer.from(answer.data[0] as string).toString('utf8')
            : answer.data,
      })),
    };

    return packet as NamePacket;
  };
