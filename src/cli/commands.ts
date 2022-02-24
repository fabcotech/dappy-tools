import { DappyLookupOptions, DappyNetworkId } from '../types';
import { Api } from './api';

import { dedent } from './utils/dedent';

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
  networkId?: string,
): networkId is DappyNetworkId => {
  return networkId === 'd' || networkId === 'gamma';
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
      dappy-lookup name --endpoint=http://127.0.0.1:8080 --hostname=localhost
      # Lookup name using a custom dappy-node over https
      dappy-lookup name --endpoint=https://127.0.0.1:443 --hostname=localhost --cacert=./cert.pem
      # Lookup name using a custom dappy-node defined in a JSON config file
      dappy-lookup name --network-file=./custom.json

      JSON Config file example:
      {
        ip: <IPV4_ADDRESS>,
        port: <PORT>,
        hostname: <HOSTNAME>,
        scheme: <HTTP | HTTPS>,
        caCert: <BASE_64_ENCODED_CA_CERTIFICATE>
      }
  `,
  action: async ([name, ...rest], api) => {
    if (!name) {
      api.print('missing name');
      return 1;
    }
    const options: DappyLookupOptions = {
      dappyNetwork: 'd',
    };

    const network = getArg('network', rest);
    if (isDappyNetworkId(network)) {
      options.dappyNetwork = network;
    }
    const record = await api.lookup(name, options);

    if (!record) {
      api.print(`Record ${name} not found`);
      return 1;
    }
    api.print(record.values[0].value);
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
