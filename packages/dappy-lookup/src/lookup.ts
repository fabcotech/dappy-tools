import { nodeRequest } from './utils/nodeRequest';

import { DappyLookupOptions, NamePacket } from './types';
import { RecordType } from './model/ResourceRecords';
import { createCoResolveQuery } from './coResolveQuery';
import { createDohQuery } from './queries/dohQuery';
import { getCertificates } from './getCertificates';
import { createPostJSONQuery } from './queries/postJSONQuery';

export const lookup = (
  name: string,
  recordType: string,
  options?: DappyLookupOptions & any,
) => {
  switch (recordType) {
    case 'A':
    case 'AAAA':
    case 'CNAME':
    case 'TXT':
      return createCoResolveQuery(createDohQuery(nodeRequest))(
        {
          name,
          recordType: RecordType[recordType as keyof typeof RecordType],
        },
        options,
      ) as Promise<NamePacket>;

    // Don't execute a DNS overs HTTPS query for CERT or CSP records.
    // Rather execute a POST query to /dns-query-extended instead.
    case 'CERT':
      return getCertificates(name, options);
    case 'CSP':
      return createCoResolveQuery<any, NamePacket>(
        createPostJSONQuery(nodeRequest, { path: '/dns-query-extended' }),
      )(
        {
          type: 'question',
          id: 0,
          questions: [
            {
              name,
              type: 'CSP',
              class: 'IN',
            },
          ],
        },
        options,
      );
    default:
      throw new Error(`Unsupported record type: ${recordType}`);
  }
};
