import { DappyLookupOptions, DappyRecord, DappyNetwork } from './types';
import { nodeRequest } from './utils/nodeRequest';

// eslint-disable-next-line
const getDappyNode = (dappyNetwork?: DappyNetwork) => {
  return {
    hostname: '127.0.0.1',
    port: '3001',
  };
};

export const getXRecords =
  (request: typeof nodeRequest) =>
  async (name: string, options?: DappyLookupOptions): Promise<DappyRecord> => {
    const { hostname, port } = getDappyNode(options?.dappyNetwork);

    const rawResponse: any = await request({
      scheme: 'http',
      hostname,
      port,
      path: '/get-x-records',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        names: [name],
      },
    });

    const response = JSON.parse(Buffer.concat(rawResponse).toString());

    if (response.success === false) {
      throw new Error(response.error.message);
    }

    return JSON.parse(response.records[0].data);
  };

export const lookup = (name: string, options?: DappyLookupOptions) => {
  return getXRecords(nodeRequest)(name, options);
};
