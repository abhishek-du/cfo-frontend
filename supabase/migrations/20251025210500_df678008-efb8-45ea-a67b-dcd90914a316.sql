-- Function to handle complete signup flow securely
CREATE OR REPLACE FUNCTION public.complete_user_signup(
  p_user_id uuid,
  p_company_name text,
  p_industry text,
  p_full_name text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Check if user already has a profile (prevent duplicate signups)
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already has a profile'
    );
  END IF;
  
  -- Insert company
  INSERT INTO companies (name, industry)
  VALUES (p_company_name, p_industry)
  RETURNING id INTO v_company_id;
  
  -- Insert user profile
  INSERT INTO user_profiles (id, company_id, email, full_name)
  VALUES (p_user_id, v_company_id, p_email, p_full_name);
  
  -- Return success with company_id
  RETURN jsonb_build_object(
    'success', true,
    'company_id', v_company_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;