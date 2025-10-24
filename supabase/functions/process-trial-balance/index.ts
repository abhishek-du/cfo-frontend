import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

interface TrialBalanceRow {
  account_code: string
  account_name: string
  debit: number
  credit: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileContent, periodId, companyId, importId, userId } = await req.json()

    console.log('Processing trial balance:', { periodId, companyId, importId })

    // Parse CSV content
    const lines = fileContent.trim().split('\n')
    const headers = lines[0].toLowerCase().split(',').map((h: string) => h.trim())
    
    // Validate headers
    const requiredHeaders = ['account_code', 'account_name', 'debit', 'credit']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
    }

    const rows: TrialBalanceRow[] = []
    const errors: { row: number; message: string }[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map((v: string) => v.trim())
      const rowData: any = {}
      
      headers.forEach((header: string, index: number) => {
        rowData[header] = values[index] || ''
      })

      // Validate row
      if (!rowData.account_code || !rowData.account_name) {
        errors.push({ row: i + 1, message: 'Missing account_code or account_name' })
        continue
      }

      const debit = parseFloat(rowData.debit) || 0
      const credit = parseFloat(rowData.credit) || 0

      if (isNaN(debit) || isNaN(credit)) {
        errors.push({ row: i + 1, message: 'Invalid debit or credit value' })
        continue
      }

      rows.push({
        account_code: rowData.account_code,
        account_name: rowData.account_name,
        debit,
        credit,
      })
    }

    console.log(`Parsed ${rows.length} rows with ${errors.length} errors`)

    // Update import status to processing
    await supabase
      .from('file_imports')
      .update({ 
        status: 'processing',
        total_rows: rows.length + errors.length,
      })
      .eq('id', importId)

    // Insert trial balance rows
    if (rows.length > 0) {
      const trialBalanceData = rows.map((row, index) => ({
        import_id: importId,
        company_id: companyId,
        period_id: periodId,
        account_code: row.account_code,
        account_name: row.account_name,
        debit: row.debit,
        credit: row.credit,
        row_number: index + 1,
      }))

      const { error: insertError } = await supabase
        .from('trial_balance_rows')
        .insert(trialBalanceData)

      if (insertError) throw insertError
    }

    // Update import status
    await supabase
      .from('file_imports')
      .update({
        status: errors.length === 0 ? 'succeeded' : 'failed',
        successful_rows: rows.length,
        error_rows: errors.length,
        error_details: errors.length > 0 ? { errors } : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importId)

    // Compute period summary after successful import
    if (errors.length === 0) {
      await supabase.rpc('compute_period_summary', {
        p_company_id: companyId,
        p_period_id: periodId,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length + errors.length,
        successfulRows: rows.length,
        errorRows: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing trial balance:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
