import { DappyLookupOptions, ReturnCode } from '../../types';
import { dedent } from '../utils/dedent';
import { Command } from './command';
import { formatNetwork } from './lookupCommand';
import { getNetwork } from './utils';

export const saveCertificateCommand: Command = {
  description: dedent`
    Retrieve certificates from Dappy name system.
    They are saved as PEM format in the local file system.
    If multiple certificates are found, they are suffixed with a number.

    Positioned arguments:
    1. name: <certificate name>

    Optional arguments:
    --out=<relative_path>

    Examples:
    
      dappy-lookup save-certificate example
  `,
  action: async ([name, ...rest], api) => {
    if (!name) {
      api.print('missing name');
      return 1;
    }

    const options: DappyLookupOptions = {
      dappyNetwork: await getNetwork(rest, api.readFile),
    };

    api.print(`Network used: ${formatNetwork(options.dappyNetwork)}`);
    api.print(`Looking up certificate ${name}`);
    api.print('');

    const packet = await api.lookup(name, 'CERT', options);

    if (
      packet.rcode === ReturnCode.NXDOMAIN ||
      packet.rcode === ReturnCode.NOTZONE ||
      !packet.answers ||
      packet.answers.length === 0
    ) {
      api.print(`Certificate(s) ${name} not found`);
      return 1;
    }

    for (let i = 0; i < packet.answers.length; i += 1) {
      const answer = packet.answers[i];
      const filename = `${answer.name}${
        packet.answers.length > 1 ? `-${i + 1}` : ''
      }.pem`;
      // eslint-disable-next-line no-await-in-loop
      await api.writeFile(
        filename,
        Buffer.from(answer.data, 'base64').toString('utf8'),
      );
      api.print(`Certificate ${name} found and saved to ./${filename}`);
    }

    return 0;
  },
};
