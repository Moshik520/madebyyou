export interface StorageProvider {
  readonly name: string;

  /** Store bytes under a key. Overwrites if the key already exists. */
  put(key: string, data: Buffer, mimeType: string): Promise<void>;

  /** Read stored bytes back. */
  read(key: string): Promise<Buffer>;

  /** Browser-reachable URL for a stored key. */
  publicUrl(key: string): string;
}
