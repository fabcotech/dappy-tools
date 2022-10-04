import { z } from 'zod';
import { JSONArray } from './json';
import { base64, hostname, port } from './regexp';

const DappyNetworkMemberHTTPschema = z.object({
  scheme: z.literal('http'),
  hostname: z.string().regex(hostname, 'not a valid hostname'),
  port: z.string().regex(port),
  ip: z
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'not a ip address'),
});

const DappyNetworkMemberHTTPSschema = z.object({
  scheme: z.literal('https'),
  hostname: z.string().regex(hostname, 'not a valid hostname'),
  port: z.string().regex(port),
  ip: z
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'not a ip address'),
  caCert: z.string().regex(base64, 'not a base64 string'),
});

const DappyNetworkMemberSchema = z.discriminatedUnion('scheme', [
  DappyNetworkMemberHTTPschema,
  DappyNetworkMemberHTTPSschema,
]);
export type DappyNetworkMember = z.infer<typeof DappyNetworkMemberSchema>;

export const isDappyNetwork = (
  network: JSONArray
): network is DappyNetworkMember[] =>
  z.array(DappyNetworkMemberSchema).safeParse(network).success;
