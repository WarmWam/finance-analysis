// Public Supabase config (anon key — safe to expose in the browser).
// The service-role key lives ONLY in Vercel env vars, never here.
// Fill these in after creating your Supabase project (see SETUP.md).
window.SUPABASE_URL      = "https://noiywrlzcpszlosrjqqd.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaXl3cmx6Y3Bzemxvc3JqcXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDI3OTEsImV4cCI6MjA5NTY3ODc5MX0.uzMGkVh0bGzEfcLzR09xq8M3XT4NP8ZPEIwIAPyqLO8";

// When true, the app renders from local mock data instead of the API.
// Phase 1 demo flag — set to false once Supabase + api/ are live.
window.USE_MOCK = false;
