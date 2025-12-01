import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DIRECTUS_URL = Deno.env.get('DIRECTUS_URL')!;
const DIRECTUS_TOKEN = Deno.env.get('DIRECTUS_TOKEN')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/items';
    
    // Forward request to Directus
    const directusResponse = await fetch(`${DIRECTUS_URL}${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    });

    const data = await directusResponse.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: directusResponse.status,
      },
    );
  } catch (error) {
    console.error('Directus proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
