export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadResponse {
  success: boolean ;
  port?: string;
  metadata?: FileMetadata;
  error?: string;
}