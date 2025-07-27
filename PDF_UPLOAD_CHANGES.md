# PDF Upload Authentication Fix

## Problem Description

The PDF upload functionality was failing with multiple RLS (Row Level Security) policy errors:

### Error 1: Database Insertion
```
❌ Failed to upload PDF to Supabase: new row violates row-level security policy. Please check your connection and try again.
```

### Error 2: Storage Bucket Access
```
Error creating bucket: StorageApiError: new row violates row-level security policy
```

These errors occurred because:
1. The Row Level Security (RLS) policies in Supabase were not properly configured for authenticated users
2. The storage bucket policies were not set up to allow bucket creation and file operations
3. The client-side application was attempting to create storage buckets, which requires administrative permissions not available to the `anon` key
4. The authentication state was not being properly checked before attempting uploads
5. Users were not getting clear feedback about authentication requirements

## Root Cause

### Database RLS Policies
The RLS policies in `src/scripts/create-pdf-table.sql` were using `auth.role() = 'authenticated'`, which is not the correct way to check for authenticated users in Supabase. The correct approach is to use `auth.uid() IS NOT NULL` to check if a user is authenticated.

### Storage Bucket RLS Policies
The storage bucket access was failing because:
1. The `storage.objects` table didn't have the necessary RLS policies to allow authenticated users to upload files
2. The client-side application was attempting to create storage buckets, which requires administrative permissions not available to the `anon` key
3. Supabase Storage requires specific policies for bucket operations, and bucket creation is an administrative action

## Changes Made

### 1. Enhanced Authentication Handling in Chat Interface

**File: `src/pages/chatinterface.tsx`**

- **Double-check authentication before upload**: Added a fresh authentication check right before attempting PDF upload
- **Better error handling**: Added specific error messages for different authentication scenarios
- **Authentication state listener**: Added real-time authentication state monitoring
- **UI improvements**: Added authentication status indicators and better user feedback

### 2. Improved Error Messages

The error handling now provides specific guidance:
- Authentication required messages
- Session expiration warnings
- Clear instructions to sign in

### 3. Visual Authentication Indicators

- **Sidebar status indicator**: Shows current authentication status
- **Upload button states**: Disabled when not authenticated with clear messaging
- **Warning messages**: Yellow warning boxes when authentication is required

### 4. Fixed Database RLS Policies

**File: `src/scripts/fix-pdf-rls-policies.sql`**

Created a new SQL script that fixes the RLS policies for the `pdf_documents` table:
```sql
-- Old (incorrect) policy
CREATE POLICY "Allow authenticated users to insert pdf_documents" ON public.pdf_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- New (correct) policy
CREATE POLICY "Allow authenticated users to insert pdf_documents" ON public.pdf_documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 5. Modified Client-Side Bucket Handling

**File: `src/services/pdfService.ts`**

Modified the `initializeBucket` function to only check for bucket existence rather than attempting to create it:

```typescript
// Before: Attempted to create bucket (caused RLS policy errors)
if (!bucketExists) {
  const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {...});
  // This failed due to insufficient permissions
}

// After: Only check existence and provide clear guidance
if (!bucketExists) {
  throw new Error('PDF storage bucket "pdfdocument" does not exist. Please create it manually in the Supabase dashboard under Storage > Buckets, or run the setup script provided in the documentation.');
}
```

### 6. Added Storage Bucket RLS Policies

**File: `src/scripts/setup-storage-bucket-policies.sql`**

Created a new SQL script that sets up the necessary RLS policies for the storage bucket:
```sql
-- Create policy to allow authenticated users to upload files to the pdfdocument bucket
CREATE POLICY "Allow authenticated users to upload PDFs" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
        AND (storage.extension(name)) = ANY (ARRAY['pdf'])
    );

-- Create policy to allow authenticated users to view files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to view PDFs" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );
```

## How to Apply the Fix

### Step 1: Run the Database RLS Policy Fix

Execute the SQL script in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `src/scripts/fix-pdf-rls-policies.sql`

### Step 2: Run the Storage Bucket Policy Fix

Execute the storage bucket policies script:

1. In the same SQL Editor
2. Run the contents of `src/scripts/setup-storage-bucket-policies.sql`

### Step 3: Create the Storage Bucket (Required)

The storage bucket must be created manually in the Supabase dashboard:

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it `pdfdocument`
4. Set it as private (not public)
5. Set allowed MIME types to `application/pdf`
6. Set file size limit to 50MB (52428800 bytes)

**Important**: The client-side application cannot create storage buckets due to permission restrictions. The bucket must be created manually or through a backend service with administrative privileges.

### Step 4: Test the Authentication Flow

1. **Without authentication**: Try uploading a PDF - you should see a clear message about needing to sign in
2. **With authentication**: Sign in and try uploading a PDF - it should work successfully
3. **Session expiration**: If your session expires, you'll get a clear message to refresh and sign in again

### Step 5: Verify the Fix

The PDF upload should now work correctly when:
- User is properly authenticated
- Database RLS policies are correctly configured
- Storage bucket RLS policies are correctly configured
- Storage bucket exists and is properly configured
- Authentication state is properly maintained

## User Experience Improvements

### Before the Fix
- Confusing error messages about RLS policies
- No clear indication of authentication requirements
- Upload button appeared functional even when not authenticated

### After the Fix
- Clear authentication status indicators
- Specific error messages for different scenarios
- Disabled upload button when not authenticated
- Real-time authentication state updates
- Clear guidance on how to resolve authentication issues

## Technical Details

### Authentication Check Flow
1. User selects PDF file
2. System checks `isAuthenticated` state
3. Before upload, fresh authentication check with `supabase.auth.getUser()`
4. If authenticated, proceed with upload
5. If not authenticated, show clear error message

### Error Handling
- **RLS Policy Error**: "Your session may have expired. Please refresh the page and sign in again"
- **JWT Error**: "Please sign in again and try uploading the PDF"
- **General Error**: Standard error message with specific details

### Database RLS Policy Changes
- Changed from `auth.role() = 'authenticated'` to `auth.uid() IS NOT NULL`
- This properly checks if a user is authenticated rather than checking their role
- All CRUD operations now use the correct authentication check

### Storage Bucket RLS Policy Changes
- Added policies for `storage.objects` table to allow authenticated users to:
  - Upload PDF files to the `pdf_document` bucket
  - View files in the bucket
  - Update files in the bucket
  - Delete files from the bucket
- Policies include file type restrictions (PDF only) and authentication checks

## Testing Checklist

- [ ] Upload PDF without authentication (should show warning)
- [ ] Upload PDF with authentication (should work)
- [ ] Session expiration handling (should prompt re-authentication)
- [ ] Authentication state indicators (should show correct status)
- [ ] Error messages (should be clear and actionable)
- [ ] Storage bucket access (should work with proper policies)
- [ ] Storage bucket policies (should allow authenticated users to upload/view files)
- [ ] Bucket existence check (should provide clear guidance if bucket doesn't exist)

## Future Considerations

If you want to restrict users to only their own PDF documents, you can:

1. Add a `user_id` column to the `pdf_documents` table
2. Modify the RLS policies to use `auth.uid() = user_id`
3. Update the PDF service to include the user ID when inserting records

This would provide better data isolation between users. 