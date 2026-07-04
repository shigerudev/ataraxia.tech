# Corpus de conocimiento (RAG)

Coloca aquí los estudios de psicología en archivos `.txt` o `.md`. El script de
ingesta los fragmenta, genera embeddings (OpenAI `text-embedding-3-small`) y los
carga en Supabase (`documents` / `document_sections`).

```bash
npm run ingest -w @ataraxia/backend -- ./knowledge
```

Notas:
- Usa contenido para el que tengas licencia/derecho de uso.
- Revisa la calidad clínica del material: alimenta directamente las respuestas del agente.
- Tras cargar >100k fragmentos, considera reindexar el índice HNSW.
