`Does your application collect, store, log, or retain Zoom user data, including Zoom OAuth Tokens?` Yes


Zoom OAuth access tokens and refresh tokens are stored in PostgreSQL (hosted on Supabase) using Better Auth's encryptOAuthTokens: true option, which applies AES-256 encryption at the application layer before writing to the database. Decrypted tokens are never logged or persisted in plaintext. The encryption key is stored exclusively as a Vercel Environment Variable and is never committed to source code.
