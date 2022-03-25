import { nodeRequest } from './utils/nodeRequest';

import { DappyLookupOptions } from './types';
import { RecordType } from './model/ResourceRecords';
import { createCoResolveQuery } from './coResolveQuery';
import { createDohQuery } from './queries/dohQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { CERT_QUERY_PATH } from './getCertificates';

export const lookup = (
  name: string,
  recordType: string,
  options?: DappyLookupOptions & any,
) => {
  switch (recordType) {
    case 'A':
    case 'AAAA':
      return createCoResolveQuery(createDohQuery(nodeRequest))(
        {
          name,
          recordType: RecordType[recordType as keyof typeof RecordType],
        },
        options,
      );
    case 'CERT':
      return createCoResolveQuery(
        createPostJSONQuery(nodeRequest, {
          path: CERT_QUERY_PATH,
        }),
      )({ names: [name] }, options);
    default:
      throw new Error(`Unsupported record type: ${recordType}`);
  }
};
