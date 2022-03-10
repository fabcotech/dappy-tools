import { DappyNetwork } from '..';
import { DappyLookupOptions, DappyNetworkId } from '../types';
import { Api } from './api';

import { dedent } from './utils/dedent';
import {
  isObjectWith,
  isStringNotEmpty,
  isHttpUrl,
  isHttpsUrl,
  isOptional,
} from '../utils/validation';
import { parseUrl, tryParseJSON } from '../utils/parse';
import { isDappyNetwork } from '../lookup';

export interface Command {
  description: string;
  action: (args: string[], api: Api) => Promise<number>;
}

export const createHelpCommand = (commands: {
  [key: string]: Command;
}): Command => ({
  description: dedent`
    Display help information.

    Examples:
    
      dappy-lookup help
  `,
  action: async (args, api) => {
    if (args.length === 0) {
      api.print(dedent`
      Available commands:\n${Object.keys(commands)
        .filter((cmdName) => cmdName !== 'default')
        .map((cmdName) => `        * ${cmdName}`)
        .join('\n')}
      `);
    } else if (commands[args[0]]) {
      api.print(commands[args[0]].description);
    } else {
      api.print('command not found');
      return 1;
    }
    return 0;
  },
});

export const getArg = (name: string, args: string[]): string | undefined => {
  return args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
};

export const isDappyNetworkId = (
  networkId?: string | DappyNetwork,
): networkId is DappyNetworkId => {
  return networkId === 'd' || networkId === 'gamma';
};

export const getArgsMap = (
  args: string[],
): Record<string, string | boolean> => {
  return args.reduce((acc: Record<string, string | boolean>, arg) => {
    const [key, value] = arg.split('=');
    acc[key.replace(/^--/, '')] = value || true;
    return acc;
  }, {});
};

export const isNetworkIdArgs = (
  args: Record<string, string | boolean>,
): args is {
  network: DappyNetworkId;
} =>
  isObjectWith({
    network: isDappyNetworkId,
  })(args);

export const isHttpArgs = (
  args: Record<string, string | boolean>,
): args is {
  endpoint: string;
  hostname: string;
} => {
  return isObjectWith({
    endpoint: isHttpUrl,
    hostname: isOptional(isStringNotEmpty),
  })(args);
};

export const isHttpsArgs = (
  args: Record<string, string | boolean>,
): args is {
  endpoint: string;
  hostname: string;
  cacert: string;
} =>
  isObjectWith({
    endpoint: isHttpsUrl,
    hostname: isStringNotEmpty,
    cacert: isStringNotEmpty,
  })(args);

export const getCA = async (
  readFile: (path: string) => Promise<string>,
  caFilePath: string,
) => {
  const caCert = await readFile(caFilePath);
  return Buffer.from(caCert).toString('base64');
};

export const isFileArgs = (
  args: Record<string, string | boolean>,
): args is {
  'network-file': string;
} =>
  isObjectWith({
    'network-file': isStringNotEmpty,
  })(args);

export const getNetwork = async (
  args: string[],
  readFile: (path: string) => Promise<string>,
): Promise<DappyNetwork> => {
  const argsMap = getArgsMap(args);
  if (isNetworkIdArgs(argsMap)) {
    return argsMap.network;
  }
  if (isHttpArgs(argsMap)) {
    const parsedUrl = parseUrl(argsMap.endpoint);
    if (!parsedUrl) return 'd';
    const { hostname: ip, port } = parsedUrl;
    return [
      {
        scheme: 'http',
        hostname: argsMap.hostname || ip,
        ip,
        port,
      },
    ];
  }

  if (isHttpsArgs(argsMap)) {
    const parsedUrl = parseUrl(argsMap.endpoint);
    if (!parsedUrl) return 'd';
    const { hostname: ip, port } = parsedUrl;
    const caCert = await getCA(readFile, argsMap.cacert);

    return [
      {
        scheme: 'https',
        hostname: argsMap.hostname,
        ip,
        port,
        caCert,
      },
    ];
  }

  if (isFileArgs(argsMap)) {
    const networkFileContent = await readFile(argsMap['network-file']);
    let rawNetwork = tryParseJSON(networkFileContent);
    if (!rawNetwork) {
      throw new Error('Could not parse network file');
    }
    rawNetwork = Array.isArray(rawNetwork) ? rawNetwork : [rawNetwork];
    if (!isDappyNetwork(rawNetwork)) {
      throw new Error('Invalid network file');
    }
    return rawNetwork;
  }

  return 'd';
};

const formatNetwork = (network: DappyNetwork): string => {
  if (isDappyNetworkId(network)) {
    return network;
  }
  return `custom with ${network.length} member(s) (${network[0].scheme}://${network[0].hostname}:${network[0].port}, ...)`;
};

export const lookupCommand: Command = {
  description: dedent`
    Lookup a name in dappy network.
    Built-in networks are:
      - d
      - gamma

    Examples:
      # Lookup name in dappy network (mainnet)
      dappy-lookup name
      # Lookup name in dappy gamma network
      dappy-lookup name --network=gamma
      # Lookup name using a custom dappy-node over http
      dappy-lookup name --endpoint=http://127.0.0.1:8080
      # Lookup name using a custom dappy-node over https
      dappy-lookup name --endpoint=https://127.0.0.1:443 --hostname=localhost --cacert=./cert.pem
      # Lookup name using a custom dappy-node network defined in a JSON config file
      dappy-lookup name --network-file=./custom-network.json

      Here is the json config file scheme of a Dappy-node network:
      [
        {
          "ip": "<IPV4_ADDRESS>",
          "port": <PORT>,
          "hostname": "<HOSTNAME>",
          "scheme": "<HTTP | HTTPS>",
          "caCert": "<BASE_64_ENCODED_CA_CERTIFICATE>"
        }
      ]
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
    api.print(`Looking up name ${name}`);
    api.print('');

    const record = await api.lookup(name, options);

    if (!record || !record.A) {
      api.print(`Record ${name} not found`);
      return 1;
    }
    api.print(`${name} => ${record.A[0].ip}`);
    return 0;
  },
};

export const getCommands = (): { [key: string]: Command } => {
  const commands = {
    lookup: lookupCommand,
    default: lookupCommand,
  } as { [key: string]: Command };

  commands.help = createHelpCommand(commands);

  return commands;
};
