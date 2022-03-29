import { getNetwork, isDappyNetworkId } from './utils';
import { DappyLookupOptions, DappyNetwork, ReturnCode } from '../../types';
import { dedent } from '../utils/dedent';
import { asciiTable } from '../utils/asciiTable';
import { Command } from './command';

const MAX_RECORD_DISPLAY_LENGTH = 80;

const normalizeAnswerData = (data: string) => {
  const singleLineData = data.replace(/\n/, '');

  if (singleLineData.length > MAX_RECORD_DISPLAY_LENGTH) {
    return `${singleLineData.substring(0, MAX_RECORD_DISPLAY_LENGTH)}...`;
  }

  return singleLineData;
};

export const formatNetwork = (network: DappyNetwork): string => {
  if (isDappyNetworkId(network)) {
    return network;
  }
  return `custom with ${network.length} member(s) (${network[0].scheme}://${network[0].hostname}:${network[0].port}, ...)`;
};

export const lookupCommand: Command = {
  description: dedent`
    Lookup name records in dappy network.
    
    Positioned arguments:
      1. name: <name to lookup>
      2. record type: A, AAAA, CERT, TXT
    Optional arguments:
      --network=<network_id>
      --endpoint=<http_url>
      --hostname=<hostname>
      --cacert=<ca_cert_file_path>
      --network-file=<network_json_file_path>

    Built-in network ids are:
      - d
      - gamma

    Examples:
      # Lookup A records for example.dappy in dappy network (mainnet)
      dappy-lookup example.dappy A
      # Lookup A records for example.dappy in dappy gamma network
      dappy-lookup example.dappy A --network=gamma
      # Lookup A records for example.dappy using a custom dappy-node over http
      dappy-lookup example.dappy A --endpoint=http://127.0.0.1:8080
      # Lookup A records for example.dappy using a custom dappy-node over https
      dappy-lookup example.dappy A --endpoint=https://127.0.0.1:443 --hostname=localhost --cacert=./cert.pem
      # Lookup A records for example.dappy using a custom dappy-node network defined in a JSON config file
      dappy-lookup example.dappy A --network-file=./custom-network.json

      Here is the json config file scheme of a Dappy-node network:
      [
        {
          "ip": "<IP_ADDRESS>",
          "port": <PORT>,
          "hostname": "<HOSTNAME>",
          "scheme": "<HTTP | HTTPS>",
          "caCert": "<BASE_64_ENCODED_CA_CERTIFICATE>"
        }
      ]
  `,
  action: async ([name, recordType, ...rest], api) => {
    if (!name) {
      api.print('missing name');
      return 1;
    }

    if (!recordType || !['A', 'AAAA', 'CERT', 'TXT'].includes(recordType)) {
      api.print('missing record type');
      return 1;
    }

    const options: DappyLookupOptions = {
      dappyNetwork: await getNetwork(rest, api.readFile),
    };

    api.print(`Network used: ${formatNetwork(options.dappyNetwork)}`);
    api.print(`Looking up name ${name}`);
    api.print('');

    const packet = await api.lookup(name, recordType, options);

    if (packet.rcode !== ReturnCode.NOERROR) {
      api.print(`Error (${packet.rcode})`);
    }

    if (!packet.answers || packet.answers.length === 0) {
      api.print(`Record(s) ${name} not found`);
      return 1;
    }

    const responseTable = packet.answers.map((answer) => [
      answer.name,
      normalizeAnswerData(answer.data),
      recordType,
    ]);

    api.print(asciiTable(responseTable));

    return 0;
  },
};
