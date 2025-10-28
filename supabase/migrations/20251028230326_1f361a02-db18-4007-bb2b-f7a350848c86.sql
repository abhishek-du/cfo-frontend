-- Drop the current unique constraint that includes client_account_name
ALTER TABLE account_mappings 
DROP CONSTRAINT IF EXISTS account_mappings_company_account_unique;

-- Restore the original constraint on (company_id, client_account_code) only
ALTER TABLE account_mappings 
ADD CONSTRAINT account_mappings_company_id_client_account_code_key 
UNIQUE (company_id, client_account_code);

-- Create new detailed view for mapped trial balance
CREATE OR REPLACE VIEW v_mapped_trial_balance_detail AS
SELECT 
  tb.company_id,
  tb.period_id,
  tb.account_code AS client_account_code,
  tb.account_name AS client_account_name,
  sa.id AS std_account_id,
  sa.code AS std_account_code,
  sa.name AS std_account_name,
  sa.category,
  SUM(tb.debit) AS total_debit,
  SUM(tb.credit) AS total_credit,
  SUM(tb.balance) AS net_balance
FROM trial_balance_rows tb
LEFT JOIN account_mappings am 
  ON am.company_id = tb.company_id 
  AND am.client_account_code = tb.account_code
LEFT JOIN std_accounts sa 
  ON sa.id = am.std_account_id
GROUP BY 
  tb.company_id, 
  tb.period_id, 
  tb.account_code,
  tb.account_name,
  sa.id, 
  sa.code, 
  sa.name, 
  sa.category
ORDER BY sa.code NULLS LAST, tb.account_code;