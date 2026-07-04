/**
 * Ingesta del corpus psicológico para el RAG.
 *
 * Uso:
 *   npm run ingest -w @ataraxia/backend -- ./knowledge
 *
 * Lee archivos .txt/.md de la carpeta indicada (por defecto ./knowledge),
 * los divide en fragmentos, genera embeddings con OpenAI y los inserta en
 * las tablas `documents` / `document_sections` de Supabase.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { getServiceClient } from '../infrastructure/persistence/supabase/supabaseClient.js';
import { OpenAiEmbeddingService } from '../infrastructure/ai/OpenAiEmbeddingService.js';
import { assertOpenAiConfigured, assertSupabaseConfigured } from '../infrastructure/config/env.js';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (clean.length <= CHUNK_SIZE) return clean ? [clean] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function main(): Promise<void> {
  assertSupabaseConfigured();
  assertOpenAiConfigured();

  const dir = process.argv[2] ?? './knowledge';
  const client = getServiceClient();
  const embeddings = new OpenAiEmbeddingService();

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    console.error(`No se pudo leer el directorio "${dir}". Crea la carpeta y coloca archivos .txt/.md.`);
    process.exit(1);
  }

  const files = entries.filter((f) => ['.txt', '.md'].includes(extname(f).toLowerCase()));
  if (files.length === 0) {
    console.error(`No hay archivos .txt/.md en "${dir}".`);
    process.exit(1);
  }

  for (const file of files) {
    const raw = await readFile(join(dir, file), 'utf-8');
    const chunks = chunkText(raw);
    if (chunks.length === 0) continue;

    const { data: doc, error: docErr } = await client
      .from('documents')
      .insert({ title: basename(file), source: file })
      .select()
      .single();
    if (docErr) throw new Error(`insert document failed: ${docErr.message}`);

    const vectors = await embeddings.embedBatch(chunks);
    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      content,
      embedding: vectors[i],
    }));

    const { error: secErr } = await client.from('document_sections').insert(rows);
    if (secErr) throw new Error(`insert sections failed: ${secErr.message}`);

    console.log(`[ingest] ${file}: ${chunks.length} fragmentos`);
  }

  console.log('[ingest] completado');
}

main().catch((error) => {
  console.error('[ingest] error', error);
  process.exit(1);
});
