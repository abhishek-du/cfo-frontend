import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { companyId, periodId } = await req.json()

    console.log('Generating insights for:', { companyId, periodId })

    // Fetch financial summary
    const { data: summary, error: summaryError } = await supabase
      .from('v_revenue_cost_summary')
      .select('*')
      .eq('company_id', companyId)
      .eq('period_id', periodId)
      .single()

    if (summaryError) throw summaryError

    // Fetch KPI values
    const { data: kpis, error: kpisError } = await supabase
      .from('kpi_values')
      .select(`
        value,
        previous_period_value,
        change_percent,
        kpi_catalog (
          name,
          category,
          description
        )
      `)
      .eq('company_id', companyId)
      .eq('period_id', periodId)

    if (kpisError) throw kpisError

    // Prepare context for AI - convert to positive values for business interpretation
    const financialContext = {
      revenue: Math.abs(summary.total_revenue || 0),
      cogs: Math.abs(summary.total_cogs || 0),
      opex: Math.abs(summary.total_opex || 0),
      netProfit: summary.net_profit, // Keep as-is (can be negative)
      margin: summary.margin_percent,
      kpis: kpis?.map(k => ({
        name: (k.kpi_catalog as any).name,
        value: k.value,
        previousValue: k.previous_period_value,
        change: k.change_percent,
        category: (k.kpi_catalog as any).category
      })) || []
    }

    const prompt = `As a CFO advisor, analyze this financial data and provide 3-5 actionable insights:

NOTE: Revenue, COGS, and Operating Expenses are shown as POSITIVE amounts (standard business reporting format).

Revenue: $${financialContext.revenue.toLocaleString()}
COGS: $${financialContext.cogs.toLocaleString()}
Operating Expenses: $${financialContext.opex.toLocaleString()}
Net Profit: $${financialContext.netProfit?.toLocaleString() || 0}
Margin: ${financialContext.margin}%

Key Performance Indicators:
${financialContext.kpis.map(kpi => 
  `- ${kpi.name}: ${kpi.value} (${kpi.change >= 0 ? '+' : ''}${kpi.change}% vs previous)`
).join('\n')}

Provide insights in this exact JSON format:
{
  "insights": [
    {
      "title": "Brief insight title",
      "description": "2-3 sentence explanation with specific numbers",
      "priority": "high|medium|low",
      "category": "profitability|liquidity|efficiency|risk"
    }
  ]
}

Focus on actionable recommendations based on trends and ratios.`

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a CFO advisor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices[0].message.content

    // Parse JSON response
    let insights
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        insights = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      // Fallback insights
      insights = {
        insights: [
          {
            title: "Financial Analysis Available",
            description: "Review your financial metrics above for detailed insights.",
            priority: "medium",
            category: "general"
          }
        ]
      }
    }

    return new Response(
      JSON.stringify(insights),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating insights:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
