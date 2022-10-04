import { DappyNetwork, DappyNetworkId, isDappyNetwork } from '../../model';

import {
  isObjectWith,
  isStringNotEmpty,
  isHttpUrl,
  isHttpsUrl,
  isOptional,
} from '../../utils/validation';
import { parseUrl, tryParseJSON } from '../../utils/parse';

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
