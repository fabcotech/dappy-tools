import http from 'http';
import https from 'https';

export const nodeRequest = async (
  options: https.RequestOptions & { scheme: 'http' | 'https'; body?: any },
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

    if (options.body) req.write(JSON.stringify(options.body));

    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
};
