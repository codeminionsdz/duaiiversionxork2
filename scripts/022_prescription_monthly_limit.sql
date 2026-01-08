-- =====================================================
-- Prescription Monthly Limit System
-- =====================================================
-- Adds a limit of 5 prescriptions per user per month

-- 1. Add tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS prescriptions_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_prescription_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_prescription_tracking 
ON profiles(id, prescriptions_this_month, last_prescription_reset_date);

-- 3. Create function to check and update monthly limit
CREATE OR REPLACE FUNCTION check_prescription_monthly_limit(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  current_count INTEGER;
  last_reset_date TIMESTAMP WITH TIME ZONE;
  current_month_start TIMESTAMP WITH TIME ZONE;
  limit_exceeded BOOLEAN;
  remaining_count INTEGER;
BEGIN
  -- Get current month start
  current_month_start := DATE_TRUNC('month', NOW());
  
  -- Get user's current count and last reset date
  SELECT prescriptions_this_month, last_prescription_reset_date
  INTO current_count, last_reset_date
  FROM profiles
  WHERE id = user_id_param;
  
  -- If last reset was in a previous month, reset the counter
  IF last_reset_date IS NULL OR DATE_TRUNC('month', last_reset_date) < current_month_start THEN
    UPDATE profiles
    SET prescriptions_this_month = 0,
        last_prescription_reset_date = NOW()
    WHERE id = user_id_param;
    
    current_count := 0;
  END IF;
  
  -- Check if limit exceeded
  limit_exceeded := current_count >= 5;
  remaining_count := GREATEST(0, 5 - current_count);
  
  RETURN jsonb_build_object(
    'can_upload', NOT limit_exceeded,
    'current_count', current_count,
    'monthly_limit', 5,
    'remaining', remaining_count,
    'resets_at', current_month_start + INTERVAL '1 month'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to increment prescription count
CREATE OR REPLACE FUNCTION increment_prescription_count(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_month_start TIMESTAMP WITH TIME ZONE;
  limit_status JSONB;
BEGIN
  current_month_start := DATE_TRUNC('month', NOW());
  
  -- Check if user can upload
  limit_status := check_prescription_monthly_limit(user_id_param);
  
  IF (limit_status->>'can_upload')::BOOLEAN = FALSE THEN
    RAISE EXCEPTION 'Monthly prescription limit reached'
      USING HINT = 'You have reached your monthly limit of 5 prescriptions';
  END IF;
  
  -- Increment counter
  UPDATE profiles
  SET prescriptions_this_month = prescriptions_this_month + 1,
      last_prescription_reset_date = CASE 
        WHEN DATE_TRUNC('month', last_prescription_reset_date) < current_month_start 
        THEN NOW() 
        ELSE last_prescription_reset_date 
      END
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to auto-increment on prescription creation
CREATE OR REPLACE FUNCTION trigger_increment_prescription_count()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_prescription_count(NEW.user_id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If limit exceeded, prevent insertion
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_check_prescription_limit ON prescriptions;
CREATE TRIGGER trigger_check_prescription_limit
  BEFORE INSERT ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_increment_prescription_count();

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_prescription_monthly_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_prescription_count(UUID) TO authenticated;

-- 7. Create view for admin monitoring
CREATE OR REPLACE VIEW admin_prescription_usage AS
SELECT 
  p.id,
  p.full_name,
  p.prescriptions_this_month,
  p.last_prescription_reset_date,
  (5 - p.prescriptions_this_month) as remaining_this_month,
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' as next_reset_date
FROM profiles p
ORDER BY p.prescriptions_this_month DESC;

COMMENT ON VIEW admin_prescription_usage IS 'View for admins to monitor prescription usage';

-- =====================================================
-- TESTING QUERIES (for verification)
-- =====================================================

-- Check limit for a specific user
-- SELECT check_prescription_monthly_limit('user_id_here');

-- View all users usage
-- SELECT * FROM admin_prescription_usage;

-- Reset a specific user's count (admin only)
-- UPDATE profiles 
-- SET prescriptions_this_month = 0, 
--     last_prescription_reset_date = NOW() 
-- WHERE id = 'user_id_here';
