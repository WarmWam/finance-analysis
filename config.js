// Public Supabase config (anon key — safe to expose in the browser).
// The service-role key lives ONLY in Vercel env vars, never here.
// Fill these in after creating your Supabase project (see SETUP.md).
window.SUPABASE_URL      = "";
window.SUPABASE_ANON_KEY = "";

// When true, the app renders from local mock data instead of the API.
// Phase 1 demo flag — set to false once Supabase + api/ are live.
window.USE_MOCK = true;
