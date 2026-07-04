import type { SupabaseClient } from '@supabase/supabase-js';
import type { KnowledgeChunk } from '../../domain/entities/Conversation.js';
import type { IKnowledgeRepository } from '../../domain/repositories/IKnowledgeRepository.js';

interface MatchRow {
  id: number;
  document_id: number;
  content: string;
  similarity: number;
}

export class SupabaseKnowledgeRepository implements IKnowledgeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async search(
    embedding: number[],
    matchCount: number,
    matchThreshold: number,
  ): Promise<KnowledgeChunk[]> {
    const { data, error } = await this.client.rpc('match_documents', {
      query_embedding: embedding,
      match_count: matchCount,
      match_threshold: matchThreshold,
    });
    if (error) throw new Error(`match_documents failed: ${error.message}`);
    return (data as MatchRow[]).map((row) => ({
      id: row.id,
      documentId: row.document_id,
      content: row.content,
      similarity: row.similarity,
    }));
  }
}
