import type { ErpData } from "@/types/erp";

export interface ErpRepository {
  load(): ErpData;
  save(data: ErpData): void;
  clear(): void;
  export(): string;
  restore(json: string): ErpData;
}

export interface FileStorageProvider {
  saveMetadata(data: ErpData): void;
  upload?(file: File, relatedDocument: string): Promise<{ storageKey: string }>;
  remove?(storageKey: string): Promise<void>;
}
