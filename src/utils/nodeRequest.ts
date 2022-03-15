import http from 'http';
import https from 'https';

import { JSONObject } from './json';

export const nodeRequest = async (
  options: https.RequestOptions & {
    scheme: 'http' | 'https';
    body?: JSONObject | Buffer | string;
  },
) => {
  const schemes = {
    http,
    https,
  };
  return new Promise<string>((resolve, reject) => {
    const req = schemes[options.scheme].request(options, (res) => {
      const data: Uint8Array[] = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('error', (err) => {
        reject(err);
      });

      res.on('end', () => {
        resolve(Buffer.concat(data).toString());
      });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
};
