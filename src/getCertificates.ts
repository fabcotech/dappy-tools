import { createCoResolveQuery } from './coResolveQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { DappyLookupOptions } from './types';
import { nodeRequest } from './utils/nodeRequest';

export const CERT_QUERY_PATH = '/get-certificates';

export const getCertificates = async (
  name: string,
  options?: DappyLookupOptions,
) => {
  const r = await createCoResolveQuery(
    createPostJSONQuery(nodeRequest, { path: CERT_QUERY_PATH }),
  )(
    {
      names: [name],
    },
    options,
  );
  return {
    ...r,
    answers: r.answers.map((a) => ({
      ...a,
      data: Buffer.from(a.data, 'base64').toString('utf8'),
    })),
  };
};
