import { createCoResolveQuery } from './coResolveQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { DappyLookupOptions } from './types';
import { nodeRequest } from './utils/nodeRequest';

export const CERT_QUERY_PATH = '/get-certificates';

export const getCertificates = (name: string, options?: DappyLookupOptions) =>
  createCoResolveQuery(
    createPostJSONQuery(nodeRequest, { path: CERT_QUERY_PATH }),
  )(
    {
      names: [name],
    },
    options,
  );
