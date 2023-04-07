import { getNetwork } from './utils';
import { dedent } from '../utils/dedent';
import { Command } from './command';
import { formatNetwork } from './lookupCommand';
import { DappyDohServerOptions } from '../../types';

export const dohServerCommand: Command = {
  description: dedent`
    Start a DoH server.

    Optional arguments:
      --port=<port>
      --network=<network_id>
      --endpoint=<http_url>
      --hostname=<hostname>
      --cacert=<ca_cert_file_path>
      --network-file=<network_json_file_path>

    Built-in network ids are:
      - d
      - gamma

    Examples:
      # Start a DoH server on port 9446 in dappy network (mainnet)
      dappy-lookup dohServer
      # Start a DoH server on port 9446 in dappy gamma network
      dappy-lookup dohServer --network=gamma
      # Start a DoH server on port 9446 using a custom dappy-node over http
      dappy-lookup dohServer --endpoint=http://127.0.0.1:8080
      # Start a DoH server on port 9446 using a custom dappy-node over https
      dappy-lookup dohServer --endpoint=https://127.0.0.1:443 --hostname=localhost --cacert=./cert.pem
      # Start a DoH server on port 9446 using a custom dappy-node network defined in a JSON config file
      dappy-lookup dohServer --network-file=./custom-network.json
    `,
  action: async ([port, ...rest], api) => {
    const options: DappyDohServerOptions = {
      dappyNetwork: await getNetwork(rest, api.readFile),
      port: port ? parseInt(port, 10) : 9446,
    };

    api.print(`Network used: ${formatNetwork(options.dappyNetwork)}`);
    api.print('');

    const server = api.dohServer(options, api);
    await server.start();
    return 0;
  },
};
