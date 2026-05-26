import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Groq Whisper transcription endpoint.
// Accepts multipart/form-data with `file` (audio blob) and optional `language`.
// Returns: { text: string }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const inForm = await req.formData();
    const file = inForm.get('file');
    if (!(file instanceof File) && !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const language = (inForm.get('language') as string | null) || undefined;

    // Cap at ~20MB to avoid abuse
    const size = (file as File).size ?? 0;
    if (size > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Audio too large (max 20MB)' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const outForm = new FormData();
    outForm.append('file', file, (file as File).name || 'audio.webm');
    outForm.append('model', 'whisper-large-v3-turbo');
    outForm.append('response_format', 'json');
    outForm.append('temperature', '0');
    if (language) outForm.append('language', language);

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: outForm,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', groqRes.status, errText);
      return new Response(JSON.stringify({ error: 'Transcription failed', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await groqRes.json();
    return new Response(JSON.stringify({ text: data.text || '' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('groq-transcribe error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
