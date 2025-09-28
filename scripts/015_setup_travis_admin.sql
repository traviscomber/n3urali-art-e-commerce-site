-- Ensure travis@nuanu.com has admin privileges
-- This script creates a profile record that will be linked when the user signs up

-- Simplified approach - create profile record directly without depending on auth.users
DO $$
BEGIN
    -- Insert or update profile for travis@nuanu.com
    -- We'll use a deterministic UUID based on the email for consistency
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role, 
        is_active, 
        created_at, 
        updated_at
    ) VALUES (
        gen_random_uuid(), -- Generate a random UUID for now
        'travis@nuanu.com',
        'Travis Admin',
        'admin',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET 
        role = 'admin',
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Created/updated admin profile for travis@nuanu.com';
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
END $$;

-- Updated trigger function to handle user signup and link to existing profile
CREATE OR REPLACE FUNCTION handle_travis_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is travis@nuanu.com
    IF NEW.email = 'travis@nuanu.com' THEN
        -- Update existing profile with the auth user ID
        UPDATE public.profiles 
        SET 
            id = NEW.id,
            updated_at = NOW()
        WHERE email = 'travis@nuanu.com';
        
        -- If no existing profile, create one
        IF NOT FOUND THEN
            INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
            VALUES (
                NEW.id, 
                NEW.email, 
                COALESCE(NEW.raw_user_meta_data->>'full_name', 'Travis Admin'), 
                'admin',
                true,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically handle travis@nuanu.com signup
DROP TRIGGER IF EXISTS handle_travis_admin_signup_trigger ON auth.users;
CREATE TRIGGER handle_travis_admin_signup_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email = 'travis@nuanu.com')
    EXECUTE FUNCTION handle_travis_admin_signup();

-- Verification
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Check profiles table
    SELECT COUNT(*) INTO profile_count 
    FROM public.profiles 
    WHERE email = 'travis@nuanu.com' AND role = 'admin';
    RAISE NOTICE 'Found % admin profile(s) for travis@nuanu.com in profiles table', profile_count;
END $$;
