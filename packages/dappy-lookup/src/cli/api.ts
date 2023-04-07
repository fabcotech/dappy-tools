import { readFile as nodeReadFile, writeFile as nodeWriteFile } from 'fs';

import { lookup } from '..';
import { dohServer } from '../dohServer';

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

export const writeFile = (path: string, data: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    nodeWriteFile(path, data, { encoding: 'utf8' }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export interface Api {
  print: typeof print;
  lookup: typeof lookup;
  dohServer: typeof dohServer;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<void>;
}
