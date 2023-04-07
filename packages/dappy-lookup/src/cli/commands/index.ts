import { Command } from './command';
import { dohServerCommand } from './dohServerCommand';
import { createHelpCommand } from './helpCommand';
import { lookupCommand } from './lookupCommand';
import { saveCertificateCommand } from './saveCertificateCommand';

export { Command } from './command';

export const getCommands = (): { [key: string]: Command } => {
  const commands = {
    lookup: lookupCommand,
    savecertificate: saveCertificateCommand,
    dohServer: dohServerCommand,
    default: lookupCommand,
  } as { [key: string]: Command };

  commands.help = createHelpCommand(commands);

  return commands;
};
