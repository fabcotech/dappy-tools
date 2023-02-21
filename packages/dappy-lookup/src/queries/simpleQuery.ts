import {
  DappyNetworkMember,
  isDappyNetworkMemberHTTPS,
  RecordType,
  RR,
} from '../model';
import { nodeRequest } from '../utils/nodeRequest';

export const createSimpleQuery =
  (request: typeof nodeRequest) =>
  async (
    { name, recordType }: { name: string; recordType: RecordType },
    options: DappyNetworkMember,
  ) => {
    const { hostname, port, scheme, ip } = options;
    const reqOptions: Parameters<typeof request>[0] = {
      scheme,
      host: ip,
      port,
      path: `/${name}/${recordType}`,
      method: 'POST',
      headers: {
        Host: hostname,
        'content-type': 'application/json',
      },
    };
    if (isDappyNetworkMemberHTTPS(options)) {
      reqOptions.ca = Buffer.from(options.caCert, 'base64').toString();
    }
    const rawResponse = await request(reqOptions);
    if (recordType === 'CERT') {
      return {
        records: (
          JSON.parse(rawResponse[0].toString('utf8')).records as RR[]
        ).map((r) => {
          return {
            ...r,
            data: Buffer.from(r.data, 'base64').toString('utf8'),
          };
        }),
      };
    }
    return JSON.parse(rawResponse[0].toString('utf8')) as { records: RR[] };
  };
