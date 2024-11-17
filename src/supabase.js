import { createClient } from "@supabase/supabase-js";
import supabaseKey from "./apikey";

const supabaseUrl = "https://inrebhkeimbgngqlqvgf.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
