import { NamePacket } from '@fabcotech/dappy-model';
import { createCoResolveQuery } from './coResolveQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { DappyLookupOptions } from './types';
import { nodeRequest } from './utils/nodeRequest';

export const CERT_QUERY_PATH = '/dns-query-extended';

export const decodeCertificates = (packet: NamePacket): NamePacket => {
  return {
    ...packet,
    answers: packet.answers.map((a) => ({
      ...a,
      data: Buffer.from(a.data, 'base64').toString('utf8'),
    })),
  };
};

type GetCertificatesArgs = {
  options?: DappyLookupOptions;
} & Partial<NamePacket>;

export const getCertificates = async (
  name: string,
  options?: DappyLookupOptions,
) => {
  const packet = await createCoResolveQuery<GetCertificatesArgs, NamePacket>(
    createPostJSONQuery(nodeRequest, { path: CERT_QUERY_PATH }),
  )(
    {
      type: 'query',
      id: 0,
      questions: [
        {
          name,
          type: 'CERT',
          class: 'IN',
        },
      ],
    },
    options,
  );
  return decodeCertificates(packet);
};
