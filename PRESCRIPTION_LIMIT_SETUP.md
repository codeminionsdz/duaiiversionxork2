# 🔒 Prescription Monthly Limit Setup Guide

## Overview
This feature limits users to uploading **5 prescriptions per month**. The system automatically:
- ✅ Tracks prescription count per user
- ✅ Resets counter on the 1st of each month
- ✅ Shows remaining quota in UI
- ✅ Blocks uploads when limit is reached
- ✅ Provides bilingual messages (Arabic/English)

---

## 📋 Setup Steps

### 1️⃣ Database Migration

Run the SQL migration to add tracking columns and triggers:

```bash
# Open Supabase SQL Editor and run:
cat scripts/022_prescription_monthly_limit.sql
```

**What this adds:**
- `prescriptions_this_month` column in `profiles` table
- `last_prescription_reset_date` column in `profiles` table
- Automatic counter increment trigger
- Monthly reset logic
- Admin view for monitoring

### 2️⃣ Verify Database Setup

Check that the migration was successful:

```sql
-- Check new columns exist
SELECT 
  id, 
  full_name, 
  prescriptions_this_month, 
  last_prescription_reset_date 
FROM profiles 
LIMIT 5;

-- Test the function
SELECT check_prescription_monthly_limit('USER_ID_HERE');
```

### 3️⃣ Test in Development

```bash
# 1. Start the dev server
npm run dev

# 2. Navigate to /upload page
# 3. Look for the green banner showing remaining prescriptions

# 4. Test limit enforcement:
# - Try uploading 5 prescriptions
# - The 6th upload should be blocked with an error message
```

---

## 🧪 Testing Scenarios

### Test Case 1: Normal Usage
```
✅ User uploads 1st prescription → Shows "4 remaining"
✅ User uploads 2nd prescription → Shows "3 remaining"
✅ User uploads 5th prescription → Shows "0 remaining"
❌ User tries 6th prescription → Blocked with message
```

### Test Case 2: Monthly Reset
```sql
-- Manually reset to test (simulates month change)
UPDATE profiles 
SET 
  prescriptions_this_month = 0,
  last_prescription_reset_date = CURRENT_DATE
WHERE id = 'USER_ID';

-- User should now be able to upload again
```

### Test Case 3: Admin Override
```typescript
import { resetUserPrescriptionCount } from '@/lib/prescription-limit'

// Admin can reset a user's count
await resetUserPrescriptionCount('USER_ID')
```

---

## 🎨 UI Components

### 1. Limit Banner Component
Location: `components/prescription-limit-banner.tsx`

**Shows:**
- ✅ Green success message when under limit
- ⚠️ Yellow warning when 2 or fewer remaining
- 🚫 Red error when limit exceeded
- 📊 Progress bar showing usage
- 📅 Reset date

### 2. Upload Page Integration
Location: `app/upload/page.tsx`

**Features:**
- Pre-upload limit check (prevents wasted storage)
- User-friendly Arabic error messages
- Real-time remaining count display

---

## 🔧 Configuration

### Change Monthly Limit

Edit the SQL function in `scripts/022_prescription_monthly_limit.sql`:

```sql
-- Change from 5 to another number
IF current_count >= 5 THEN  -- Change this number
  RETURN FALSE;
END IF;
```

Then re-run the migration.

### Change Reset Schedule

Current: Resets on the 1st of each month

To change (e.g., every 30 days):

```sql
-- In the trigger function, change:
IF p.last_prescription_reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
-- To:
IF p.last_prescription_reset_date < CURRENT_DATE - INTERVAL '30 days' THEN
```

---

## 📊 Monitoring

### Admin Dashboard Query

```sql
-- View all users approaching limit
SELECT 
  full_name,
  email,
  prescriptions_this_month,
  last_prescription_reset_date,
  5 - prescriptions_this_month as remaining
FROM profiles
WHERE prescriptions_this_month >= 3
ORDER BY prescriptions_this_month DESC;
```

### Analytics

```sql
-- Monthly statistics
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_prescriptions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(prescriptions_per_user) as avg_per_user
FROM (
  SELECT 
    user_id,
    created_at,
    COUNT(*) OVER (PARTITION BY user_id, DATE_TRUNC('month', created_at)) as prescriptions_per_user
  FROM prescriptions
) sub
GROUP BY month
ORDER BY month DESC;
```

---

## 🚨 Troubleshooting

### Issue: Limit not enforcing
**Check:**
1. SQL migration ran successfully
2. Trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'increment_prescription_count_trigger';`
3. API endpoint returns correct data: `curl http://localhost:3000/api/prescriptions/limit`

### Issue: Counter not resetting
**Fix:**
```sql
-- Manually trigger reset for all users
UPDATE profiles 
SET 
  prescriptions_this_month = 0,
  last_prescription_reset_date = CURRENT_DATE
WHERE last_prescription_reset_date < DATE_TRUNC('month', CURRENT_DATE);
```

### Issue: UI not showing banner
**Debug:**
1. Check console for fetch errors
2. Verify user is authenticated
3. Check if `prescriptions_this_month > 0` (banner hidden for new users)

---

## 🔐 Security Considerations

✅ **Server-side validation**: Limit enforced in database trigger (not just UI)
✅ **User isolation**: Row Level Security (RLS) prevents users from modifying other users' counts
✅ **Tamper-proof**: Counter lives in `profiles` table with restricted access
✅ **Admin tools**: Separate functions for admin overrides with proper authorization

---

## 📱 User Experience

### Arabic Messages
```typescript
// When limit reached:
"لقد وصلت إلى الحد الأقصى (5 وصفات) لهذا الشهر"

// When approaching limit:
"لديك 2 وصفات متبقية هذا الشهر"

// Normal state:
"3 وصفات متبقية هذا الشهر"
```

### Visual Indicators
- 🟢 Green: 3+ prescriptions remaining
- 🟡 Yellow: 1-2 prescriptions remaining
- 🔴 Red: 0 prescriptions remaining (blocked)

---

## 🎯 Next Steps

1. ✅ Run SQL migration
2. ✅ Test in development
3. ✅ Verify UI shows correctly
4. ✅ Test limit enforcement
5. ✅ Deploy to production
6. 📊 Monitor usage patterns
7. 📈 Adjust limit based on data

---

## 📄 Related Files

- **Database**: `scripts/022_prescription_monthly_limit.sql`
- **API Endpoint**: `app/api/prescriptions/limit/route.ts`
- **Utility Functions**: `lib/prescription-limit.ts`
- **UI Component**: `components/prescription-limit-banner.tsx`
- **Integration**: `app/upload/page.tsx`

---

## 📞 Support

If you need to:
- **Change the limit**: Edit SQL function + re-deploy
- **Reset a user**: Use admin function or SQL query
- **View statistics**: Use monitoring queries above
- **Disable feature**: Remove `<PrescriptionLimitBanner />` from upload page

**Emergency Override** (disable temporarily):
```sql
-- Set limit to 1000 (effectively unlimited)
CREATE OR REPLACE FUNCTION check_prescription_monthly_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN TRUE; -- Always allow uploads
END;
$$ LANGUAGE plpgsql;
```
