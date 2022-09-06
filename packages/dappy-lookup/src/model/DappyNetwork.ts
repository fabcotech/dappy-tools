import {
  isStringNotEmpty,
  match,
  isOptional,
  isBase64String,
  isArrayNotEmptyOf,
  isObjectWith,
  isIP,
} from '../utils/validation';
import { JSONArray } from '../utils/json';

export type DappyNetworkId = 'd' | 'gamma';

export type DappyNetwork = DappyNetworkId | DappyNetworkMember[];

export type DappyNetworkMember = {
  scheme: 'https' | 'http';
  hostname: string;
  port: string;
  caCert?: string;
  ip: string;
};

export const isDappyNetwork = (
  network: JSONArray | string,
): network is DappyNetworkMember[] => {
  return isArrayNotEmptyOf(
    isObjectWith({
      hostname: isStringNotEmpty,
      ip: isIP,
      port: match(/^\d{1,5}$/),
      scheme: match(/^http(s)?$/),
      caCert: isOptional(isBase64String),
    }),
  )(network);
};
