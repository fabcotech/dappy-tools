/*
  GENERATED CODE
  Do not edit manually
  Check dappy-tools/packages/models/
*/

import { z } from "zod";

import { RRSchema } from "./ResourceRecords";
import { JSONObject } from "./json";
import { hostname } from "./regexp";

const NameZoneSchema = z.object({
  origin: z.string().regex(hostname),
  ttl: z.number(),
  records: z.array(RRSchema),
});
export type NameZone = z.infer<typeof NameZoneSchema>;

export const isNameZone = (nameZone: JSONObject): nameZone is NameZone =>
  NameZoneSchema.safeParse(nameZone).success;
