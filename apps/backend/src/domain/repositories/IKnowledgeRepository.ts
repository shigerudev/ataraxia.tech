import type { KnowledgeChunk } from '../entities/Conversation.js';

export interface IKnowledgeRepository {
  search(embedding: number[], matchCount: number, matchThreshold: number): Promise<KnowledgeChunk[]>;
}
