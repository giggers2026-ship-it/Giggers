import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://npvumnhdswjuymqgqzoi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdnVtbmhkc3dqdXltcWdxem9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY4MzYzNywiZXhwIjoyMDk3MjU5NjM3fQ.7Np9s63EBu7LmAKXz6S043253q5ReI-PWkT5AKG6d7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  console.log('Checking jobs table...');
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('need_location_based_workers, nature_of_work, client_name, mode_of_payment, dos_and_donts')
    .limit(1);
    
  if (jobsError) {
    console.error('Error fetching jobs:', jobsError.message);
  } else {
    console.log('Jobs table columns verified! Data:', jobs);
  }

  console.log('\nChecking applications table...');
  const { data: apps, error: appsError } = await supabase
    .from('applications')
    .select('reporting_completed, selfie_completed, tshirt_completed, shoes_completed, pipeline_status')
    .limit(1);

  if (appsError) {
    console.error('Error fetching applications:', appsError.message);
  } else {
    console.log('Applications table columns verified! Data:', apps);
  }
}

checkSchema();
