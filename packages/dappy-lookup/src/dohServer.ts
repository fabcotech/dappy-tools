import { DappyDohServerOptions } from './types';

export function dohServer(options: DappyDohServerOptions) {
  return {
    start() {
      console.log(`dohServer started on port ${options.port}`);
    },
  };
}
