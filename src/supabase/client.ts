import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabaseSecretKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!;

export const supabase = createClient(supabaseUrl, supabaseSecretKey);