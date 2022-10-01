import { Router } from 'express';
import { NameZone } from '../model/NameZone';

export interface ZoneProvider {
  getZonesPaginated: (a: { offset: number; limit: number }) => Promise<{
    count: number;
    tables: any;
  }>;
  getHash: (each: boolean) => Promise<string>;
  getZones: (names: string[]) => Promise<NameZone[]>;
  saveZone: (zone: NameZone) => Promise<void>;
  start(): Promise<void>;
  getRoutes(): Router;
}
