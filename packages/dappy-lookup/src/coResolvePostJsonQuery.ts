import { createCoResolveQuery } from './coResolveQuery';
import { createPostJSONQuery } from './queries/postJSONQuery';
import { DappyLookupOptions, JSONObject } from './types';
import { nodeRequest } from './utils/nodeRequest';

export const coResolvePostJsonQuery = (
  query: {
    path: string;
    body: JSONObject;
  },
  options?: DappyLookupOptions,
) => {
  return createCoResolveQuery(
    createPostJSONQuery(nodeRequest, { path: query.path }),
  )(query.body, options);
};
