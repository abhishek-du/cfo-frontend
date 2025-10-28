import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { companyId, periodId } = await req.json();

    if (!companyId || !periodId) {
      return new Response(
        JSON.stringify({ error: 'Missing companyId or periodId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Computing KPIs for company ${companyId}, period ${periodId}`);

    // Step 1: Compute period summary
    console.log('Step 1: Computing period summary...');
    const { error: summaryError } = await supabaseClient.rpc('compute_period_summary', {
      p_company_id: companyId,
      p_period_id: periodId,
    });

    if (summaryError) {
      console.error('Error computing period summary:', summaryError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute period summary', 
          details: summaryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Period summary computed successfully');

    // Step 2: Compute KPIs
    console.log('Step 2: Computing KPIs...');
    const { error: kpisError } = await supabaseClient.rpc('compute_kpis', {
      p_company_id: companyId,
      p_period_id: periodId,
    });

    if (kpisError) {
      console.error('Error computing KPIs:', kpisError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute KPIs', 
          details: kpisError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('KPIs computed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Period summary and KPIs computed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
