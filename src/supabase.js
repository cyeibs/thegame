import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ynhoukviuzbgwqtyenxx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaG91a3ZpdXpiZ3dxdHllbnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Nzc0ODUsImV4cCI6MjA2MDM1MzQ4NX0.7dFobTQQPeL-zL7x40nArXvQTOlpj4dJ9PVqvO83fDY";
export const supabase = createClient(supabaseUrl, supabaseKey);
