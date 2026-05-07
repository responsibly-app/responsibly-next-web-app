-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Requires pgvector to already be enabled (done in rag-setup.sql).

-- 1. Stores one row per tool with its embedding and description text
--    (description is stored so the sync script can detect changes without re-embedding unchanged tools)
create table if not exists tool_index (
  tool_name   text primary key,
  description text not null,
  embedding   vector(1536) not null,
  synced_at   timestamptz default now()
);

-- 2. Similarity search function called at query time by tool-selector.ts
create or replace function match_tools(
  query_embedding  vector(1536),
  match_count      int     default 15,
  match_threshold  float   default 0.3
)
returns table (
  tool_name   text,
  similarity  float
)
language sql stable as $$
  select
    tool_name,
    1 - (embedding <=> query_embedding) as similarity
  from tool_index
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 3. HNSW index for fast approximate nearest-neighbour search
create index if not exists tool_index_embedding_idx
  on tool_index
  using hnsw (embedding vector_cosine_ops);
