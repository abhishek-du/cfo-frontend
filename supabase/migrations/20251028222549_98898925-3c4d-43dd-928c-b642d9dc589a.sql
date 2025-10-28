-- Drop the old unique constraint that only uses company_id and client_account_code
ALTER TABLE public.account_mappings 
DROP CONSTRAINT IF EXISTS account_mappings_company_id_client_account_code_key;

-- Add new unique constraint that includes client_account_name
-- This allows the same account code to be used with different account names
ALTER TABLE public.account_mappings 
ADD CONSTRAINT account_mappings_company_account_unique 
UNIQUE (company_id, client_account_code, client_account_name);