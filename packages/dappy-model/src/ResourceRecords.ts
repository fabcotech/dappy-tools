import { z } from 'zod';

import { JSONObject } from './json';

export const RecordTypeSchema = z.enum(['A', 'AAAA', 'CERT', 'TXT', 'CNAME']);
export type RecordType = z.infer<typeof RecordTypeSchema>;

export const recordTypeRegExp = /^(A|AAAA|CNAME|CERT|TXT)$/;

const ResourceRecordSchema = z.object({
  name: z.string(),
  ttl: z.number().optional(),
});
export type ResourceRecord = z.infer<typeof ResourceRecordSchema>;

// Simplified version of A RR from RFC 1035
const RRASchema = ResourceRecordSchema.extend({
  data: z.string(),
  type: z.literal('A'),
});
export type RRA = z.infer<typeof RRASchema>;

export const isRRA = (data: JSONObject): data is RRA =>
  RRASchema.safeParse(data).success;

// Simplified version of AAAA RR from RFC 1035
const RRAAAASchema = ResourceRecordSchema.extend({
  data: z.string(),
  type: z.literal('AAAA'),
});
export type RRAAAA = z.infer<typeof RRAAAASchema>;
export const isRRAAAA = (data: JSONObject): data is RRAAAA =>
  RRAAAASchema.safeParse(data).success;

const RRCERTSchema = ResourceRecordSchema.extend({
  data: z.string(),
  type: z.literal('CERT'),
});
export type RRCERT = z.infer<typeof RRCERTSchema>;
export const isRRCERT = (data: JSONObject): data is RRCERT =>
  RRCERTSchema.safeParse(data).success;

const RRTXTSchema = ResourceRecordSchema.extend({
  data: z.string(),
  type: z.literal('TXT'),
});
export type RRTXT = z.infer<typeof RRTXTSchema>;
export const isRRTXT = (data: JSONObject): data is RRTXT =>
  RRTXTSchema.safeParse(data).success;

const RRCNAMESchema = ResourceRecordSchema.extend({
  data: z.string(),
  type: z.literal('CNAME'),
});
export type RRCNAME = z.infer<typeof RRCNAMESchema>;
export const isRRCNAME = (data: JSONObject): data is RRCNAME =>
  RRCNAMESchema.safeParse(data).success;

export const RRSchema = z.discriminatedUnion('type', [
  RRASchema,
  RRAAAASchema,
  RRCERTSchema,
  RRTXTSchema,
  RRCNAMESchema,
]);
export type RR = z.infer<typeof RRSchema>;

const RRADataSchema = z.string();
export type RRAData = z.infer<typeof RRADataSchema>;
const RRAAAADataSchema = z.string();
export type RRAAAAData = z.infer<typeof RRAAAADataSchema>;
const RRRCERTDataSchema = z.string();
export type RRCERTData = z.infer<typeof RRRCERTDataSchema>;
const RRTXTDataSchema = z.string();
export type RRTXTData = z.infer<typeof RRTXTDataSchema>;
const RRCNAMEDataSchema = z.string();
export type RRCNAMEData = z.infer<typeof RRCNAMEDataSchema>;

export const RRDataSchema = z.union([
  RRADataSchema,
  RRAAAADataSchema,
  RRRCERTDataSchema,
  RRTXTDataSchema,
  RRCNAMEDataSchema,
]);
export type RRData = z.infer<typeof RRDataSchema>;
