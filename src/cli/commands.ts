import { Api } from './api';

import { lookup } from '../lookup';
import { dedent } from './utils/dedent';

export interface Command {
  description: string;
  action: (args: string[], api: Api) => Promise<void>;
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
    }
  },
});

export const lookupCommand: Command = {
  description: dedent`
    Lookup a name in dappy network.
    Built-in networks are:
      - mainnet
      - gamma

    Examples:

      dappy-lookup foo                                # Lookup name in dappy network (mainnet)
      dappy-lookup foo --network=gamma                # Lookup name in dappy gamma network
      dappy-lookup foo --network-file=./custom.json   # Lookup name in dappy network defined in local.json
  `,
  action: async ([name], api) => {
    if (!name) {
      throw new Error('missing parameter name');
    }
    const record = await lookup(name);
    if (record) {
      api.print(record.values[0].value);
    }
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
