import dnsPacket from 'dns-packet';

import { JSONObject } from '../utils/json';
import { nodeRequest } from '../utils/nodeRequest';
import { RecordType } from '../model/ResourceRecords';
import { DappyNetworkMember } from '../model/DappyNetwork';

const DNS_QUERY_PATH = '/dns-query';

export const tryParseDnsPacket = (raw: Buffer): JSONObject | undefined => {
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
    const { hostname, port, scheme, ip, caCert } = options;
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
    if (caCert) {
      reqOptions.ca = Buffer.from(caCert, 'base64').toString();
    }
    const rawResponse = await request(reqOptions);

    const jsonResponse = tryParseDnsPacket(Buffer.concat(rawResponse as any));

    if (!jsonResponse || Array.isArray(jsonResponse)) {
      throw new Error(
        `Could not parse response from ${scheme}://${hostname}:${port}/${DNS_QUERY_PATH}`,
      );
    }

    return jsonResponse;
  };
