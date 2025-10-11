import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clrjcjuotgwrssjcwzxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscmpjanVvdGd3cnNzamN3enhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTAzNTYsImV4cCI6MjA3NTYyNjM1Nn0.BfUr9xSCKNv7v75_BVm7gTWhk08qHH-Nyr99h86CrRQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);