import { createClient } from '@supabase/supabase-js';

// 这里使用环境变量存储Supabase URL和匿名密钥
// 需要在.env.local文件中设置这些值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 