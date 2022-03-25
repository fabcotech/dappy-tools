import { tryParseJSON } from '../utils/parse';
import { nodeRequest } from '../utils/nodeRequest';
import { DappyNetworkMember } from '../model/DappyNetwork';

type PostJSONQueryOptions = {
  path: string;
};

export const createPostJSONQuery =
  (request: typeof nodeRequest, queryOptions: PostJSONQueryOptions) =>
  async (queryArgs: { names: string[] }, options: DappyNetworkMember) => {
    const { hostname, port, scheme, ip, caCert } = options;
    const { path } = queryOptions;

    const reqOptions: Parameters<typeof request>[0] = {
      scheme,
      host: ip,
      port,
      path,
      method: 'POST',
      headers: {
        Host: hostname,
      },
      body: JSON.stringify(queryArgs),
    };
    if (caCert) {
      reqOptions.ca = Buffer.from(caCert, 'base64').toString();
    }
    const rawResponse = await request(reqOptions);

    const jsonResponse = tryParseJSON(rawResponse.join(''));

    if (!jsonResponse || Array.isArray(jsonResponse)) {
      throw new Error(
        `Could not parse response from ${scheme}://${hostname}:${port}${path}`,
      );
    }

    return jsonResponse;
  };
