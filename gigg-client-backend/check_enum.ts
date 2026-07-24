import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnum() {
  const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'kyc_doc_type' });
  console.log('RPC result:', data, error);
  
  // Alternative: raw query using REST if rpc doesn't exist
  const { data: enumData, error: enumError } = await supabase.from('kyc_documents').select('type').limit(1);
  console.log('kyc_documents sample:', enumData, enumError);

}

checkEnum();
