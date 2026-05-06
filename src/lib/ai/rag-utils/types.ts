export interface StorageFile {
  path: string;
  updated_at: string;
  size: number;
  mimetype: string;
}

export interface TextChunk {
  text: string;
  heading?: string;
  page?: number;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  source_path: string;
  topic: string;
  similarity: number;
}
