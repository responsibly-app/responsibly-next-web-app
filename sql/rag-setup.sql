-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Order matters: extension first, then tables, then function, then index.

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Tracks which storage files have been indexed (for delta sync)
create table if not exists knowledge_sources (
  id                  uuid primary key default gen_random_uuid(),
  storage_path        text not null unique,   -- e.g. "objection-handling/price.md"
  storage_updated_at  timestamptz not null,   -- last_modified from Supabase Storage
  file_size           bigint not null,
  chunk_count         int not null default 0,
  indexed_at          timestamptz default now()
);

-- 3. Stores the actual text chunks + their vector embeddings
create table if not exists knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  source_id    uuid not null references knowledge_sources(id) on delete cascade,
  content      text not null,
  embedding    vector(1536) not null,
  chunk_index  int not null,
  metadata     jsonb,   -- { topic, heading, page }
  created_at   timestamptz default now()
);

-- 4. Similarity search function called at query time
-- Uses negative inner product (<#>) since OpenAI embeddings are normalized —
-- faster than cosine distance and equivalent for unit vectors.
create or replace function match_chunks(
  query_embedding  vector(1536),
  match_count      int     default 5,
  match_threshold  float   default 0.7,
  filter_metadata  jsonb   default '{}'
)
returns table (
  id          uuid,
  content     text,
  source_path text,
  topic       text,
  similarity  float
)
language sql stable as $$
  select
    kc.id,
    kc.content,
    ks.storage_path               as source_path,
    kc.metadata->>'topic'         as topic,
    -(kc.embedding <#> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_sources ks on ks.id = kc.source_id
  where (filter_metadata = '{}' or kc.metadata @> filter_metadata)
    and kc.embedding <#> query_embedding < -match_threshold
  order by kc.embedding <#> query_embedding asc
  limit match_count;
$$;

-- 5. HNSW index using inner-product ops (matches the <#> operator above)
create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks
  using hnsw (embedding vector_ip_ops);
