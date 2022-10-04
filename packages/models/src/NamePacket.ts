/*
  GENERATED CODE
  Do not edit manually
  Check dappy-tools/packages/models/
*/

import { z } from "zod";
import { JSONObject } from "./json";
import { hostname } from "./regexp";
import { RecordTypeSchema, RRDataSchema } from "./ResourceRecords";

const NameQuestionSchema = z.object({
  type: RecordTypeSchema,
  class: z.literal("IN"),
  name: z.string().regex(hostname),
});

export type NameQuestion = z.infer<typeof NameQuestionSchema>;

const NameAnswerSchema = z.object({
  type: RecordTypeSchema,
  class: z.literal("IN"),
  name: z.string().regex(hostname),
  ttl: z.number(),
  data: RRDataSchema,
});

export type NameAnswer = z.infer<typeof NameAnswerSchema>;

// DNS RCODEs in https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
const ReturnCode = [
  "NOERROR", // DNS Query completed successfully
  "FORMERR", //  DNS Query Format Error
  "SERVFAIL", // Server failed to complete the DNS request
  "NXDOMAIN", //  Domain name does not exist.
  "NOTIMP", //  Function not implemented
  "REFUSED", // The server refused to answer for the query
  "YXDOMAIN", //  Name that should not exist, does exist
  "YXDOMAIN", //  RRset that should not exist, does exist
  "NOTAUTH", //  Server not authoritative for the zone
  "NOTZONE", //  Name not in zone
] as const;

const PacketType = ["query", "response"] as const;

// As described in https://datatracker.ietf.org/doc/html/rfc1035#section-4.1
const NamePacketSchema = z.object({
  version: z.string().optional(),
  type: z.enum(PacketType),
  rcode: z.enum(ReturnCode),
  id: z.number(),
  flags: z.number(),
  questions: z.array(NameQuestionSchema),
  answers: z.array(NameAnswerSchema),
  additionals: z.array(undefined),
  authorities: z.array(undefined),
});

export type NamePacket = z.infer<typeof NamePacketSchema>;

export const isNamePacket = (packet: JSONObject): packet is NamePacket =>
  NamePacketSchema.safeParse(packet).success;
