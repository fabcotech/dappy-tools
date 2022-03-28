import { nodeRequest } from './utils/nodeRequest';

import { DappyLookupOptions } from './types';
import { RecordType } from './model/ResourceRecords';
import { createCoResolveQuery } from './coResolveQuery';
import { createDohQuery } from './queries/dohQuery';
import { getCertificates } from './getCertificates';

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

    // Don't execute a DNS overs HTTPS query for CERT records.
    // Rather execute a POST query to /get-certificates instead.
    case 'CERT':
      return getCertificates(name, options);
    default:
      throw new Error(`Unsupported record type: ${recordType}`);
  }
};
