import { Api } from './api';

import { lookup } from '../lookup';
import { dedent } from './utils/dedent';

export interface Command {
  description: string;
  action: (args: string[], api: Api) => Promise<void>;
}

export const helpCommand: Command = {
  description: dedent`
    Display help information.

    Examples:
    
      dappy-lookup --help
  `,
  action: async (args, api) => {
    api.print(helpCommand.description);
  },
};

export const lookupCommand: Command = {
  description: dedent`
    Lookup a name in dappy network.

    Examples:

      dappy-lookup foo            # Lookup name in dappy network (mainnet)
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

export const getCommands = (): { [key: string]: Command } => ({
  help: helpCommand,
  lookup: lookupCommand,
  default: lookupCommand,
});
