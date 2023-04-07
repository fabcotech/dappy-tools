import { DappyDohServerOptions } from './types';

export function dohServer(
  options: DappyDohServerOptions,
  print: (str: string) => void,
) {
  return {
    start() {
      print(`dohServer started on port ${options.port}`);
    },
  };
}
