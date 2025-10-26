-- Drop old signup function
DROP FUNCTION IF EXISTS public.complete_user_signup(uuid, text, text, text, text);

-- Function to handle new user signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_full_name text;
BEGIN
  -- Extract data from user metadata
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Only proceed if we have the user's name
  IF v_full_name IS NOT NULL THEN
    -- Insert company with placeholder name
    INSERT INTO public.companies (name, industry)
    VALUES (v_full_name || '''s Company', NULL)
    RETURNING id INTO v_company_id;
    
    -- Insert user profile
    INSERT INTO public.user_profiles (id, company_id, email, full_name)
    VALUES (NEW.id, v_company_id, NEW.email, v_full_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();