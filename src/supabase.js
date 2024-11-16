import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://inrebhkeimbgngqlqvgf.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucmViaGtlaW1iZ25ncWxxdmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MTg3NTcsImV4cCI6MjA0NzA5NDc1N30.TXiJOnEuLp4fCGR7vrWz4hF_E0CdPXtQWJHh-nSn1aU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
