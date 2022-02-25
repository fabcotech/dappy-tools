import { readFile as nodeReadFile } from 'fs';

import { lookup } from '..';

export function print(str: string) {
  // eslint-disable-next-line no-console
  console.log(str);
}

export const readFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    nodeReadFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

export interface Api {
  print: typeof print;
  lookup: typeof lookup;
  readFile: (path: string) => Promise<string>;
}
