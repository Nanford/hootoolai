import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  const { data, error } = await supabase.auth.getSession();
  res.status(200).json({ session: data.session, error });
}
