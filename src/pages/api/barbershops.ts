import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   const { data, error } = await supabaseClient
    .from('barbershops')
    .select('*');

  if (error) {
    return res.status(500).json(error);
  }
  res.status(200).json({ barbershops: data });
}