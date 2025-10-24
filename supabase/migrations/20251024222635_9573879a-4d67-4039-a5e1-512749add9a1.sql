-- Fix search_path for security
DROP FUNCTION IF EXISTS app.update_updated_at_column CASCADE;

CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON app.companies
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at_column();