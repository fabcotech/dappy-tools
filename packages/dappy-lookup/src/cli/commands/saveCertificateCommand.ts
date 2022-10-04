import { DappyLookupOptions } from '../../types';
import { isObjectWith, isStringNotEmpty } from '../../utils/validation';
import { dedent } from '../utils/dedent';
import { Command } from './command';
import { formatNetwork } from './lookupCommand';
import { getArgsMap, getNetwork } from './utils';

export const isOutArgs = (
  args: Record<string, string | boolean>,
): args is {
  out: string;
} =>
  isObjectWith({
    out: isStringNotEmpty,
  })(args);

const getBaseFilename = (args: string[], name: string) => {
  const argsMap = getArgsMap(args);

  if (isOutArgs(argsMap)) {
    return argsMap.out.replace(/\.pem$/, '');
  }

  return name;
};

export const saveCertificateCommand: Command = {
  description: dedent`
    Retrieve certificates from Dappy name system.
    They are saved as PEM format in the local file system.
    If multiple certificates are found, they are suffixed with a number.

    Positioned arguments:
      1. name: <certificate name>

    Optional arguments:
      --out=<certificate_path>
      --network=<network_id>
      --endpoint=<http_url>
      --hostname=<hostname>
      --cacert=<ca_cert_file_path>
      --network-file=<network_json_file_path>

    Built-in network ids are:
      - d
      - gamma

    Examples:
      # Download example.dappy certificate(s) using dappy network (mainnet)
      dappy-lookup savecertificate example.dappy
      # Download example.dappy certificate(s) using gamma network, save it/them to custom path
      dappy-lookup savecertificate example.dappy --out=customname.pem --network=gamma
      # Download example.dappy certificate(s) using a custom dappy-node network defined in a JSON config file
      dappy-lookup savecertificate example.dappy --network-file=./custom-network.json
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
      packet.rcode === 'NXDOMAIN' ||
      packet.rcode === 'NOTZONE' ||
      !packet.answers ||
      packet.answers.length === 0
    ) {
      api.print(`Certificate(s) ${name} not found`);
      return 1;
    }

    const baseFileName = getBaseFilename(rest, name);

    for (let i = 0; i < packet.answers.length; i += 1) {
      const answer = packet.answers[i];
      const filename = `${baseFileName}${
        packet.answers.length > 1 ? `-${i + 1}` : ''
      }.pem`;
      // eslint-disable-next-line no-await-in-loop
      await api.writeFile(filename, answer.data);
      api.print(`Certificate ${name} found and saved to ${filename}`);
    }

    return 0;
  },
};
