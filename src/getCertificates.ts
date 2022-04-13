import { createCoResolveQuery } from './coResolveQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { DappyLookupOptions, NamePacket } from './types';
import { nodeRequest } from './utils/nodeRequest';

export const CERT_QUERY_PATH = '/get-certificates';

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
  names: string[];
  options?: DappyLookupOptions;
};

export const getCertificates = async (
  name: string,
  options?: DappyLookupOptions,
) => {
  const packet = await createCoResolveQuery<GetCertificatesArgs, NamePacket>(
    createPostJSONQuery(nodeRequest, { path: CERT_QUERY_PATH }),
  )(
    {
      names: [name],
    },
    options,
  );
  return decodeCertificates(packet);
};
