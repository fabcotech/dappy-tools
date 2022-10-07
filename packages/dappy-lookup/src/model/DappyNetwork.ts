import z from 'zod';
import { JSONValue } from './json';
import { base64, hostname, port } from './regexp';

const DappyNetworkMemberHTTPschema = z.object({
  scheme: z.literal('http'),
  hostname: z.string().regex(hostname, 'not a valid hostname'),
  port: z.string().regex(port),
  ip: z
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'not a ip address'),
});

export type DappyNetworkMemberHTTP = z.infer<
  typeof DappyNetworkMemberHTTPschema
>;
export const isDappyNetworkMemberHTTP = (
  v: JSONValue,
): v is DappyNetworkMemberHTTP =>
  DappyNetworkMemberHTTPschema.safeParse(v).success;

const DappyNetworkMemberHTTPSschema = z.object({
  scheme: z.literal('https'),
  hostname: z.string().regex(hostname, 'not a valid hostname'),
  port: z.string().regex(port),
  ip: z
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/, 'not a ip address'),
  caCert: z.string().regex(base64, 'not a base64 string'),
});

export type DappyNetworkMemberHTTPS = z.infer<
  typeof DappyNetworkMemberHTTPSschema
>;
export const isDappyNetworkMemberHTTPS = (
  v: JSONValue,
): v is DappyNetworkMemberHTTPS =>
  DappyNetworkMemberHTTPSschema.safeParse(v).success;

const DappyNetworkMemberSchema = z.discriminatedUnion('scheme', [
  DappyNetworkMemberHTTPschema,
  DappyNetworkMemberHTTPSschema,
]);
export type DappyNetworkMember = z.infer<typeof DappyNetworkMemberSchema>;

const DappyNetworkMembersSchema = z.array(DappyNetworkMemberSchema);

export const isDappyNetworkMembers = (
  members: JSONValue,
): members is z.infer<typeof DappyNetworkMembersSchema> =>
  DappyNetworkMembersSchema.safeParse(members).success;

const DappyNetworkIdSchema = z.enum(['d', 'gamma']);
export type DappyNetworkId = z.infer<typeof DappyNetworkIdSchema>;
export const isDappyNetworkId = (id: JSONValue): id is DappyNetworkId =>
  DappyNetworkIdSchema.safeParse(id).success;

const DappyNetworkSchema = z.union([
  DappyNetworkIdSchema,
  z.array(DappyNetworkMemberSchema),
]);
export type DappyNetwork = z.infer<typeof DappyNetworkSchema>;
export const isDappyNetwork = (v: JSONValue): v is DappyNetwork =>
  DappyNetworkSchema.safeParse(v).success;
