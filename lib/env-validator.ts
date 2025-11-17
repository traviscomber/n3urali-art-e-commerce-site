// Environment variables validation for production readiness
// Run this during build to ensure all required variables are set

const requiredEnvVars = {
  // Supabase - Required for database and auth
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (server-side only)',
  
  // Database - Auto-configured by Supabase integration
  POSTGRES_URL: 'PostgreSQL connection string',
  POSTGRES_HOST: 'PostgreSQL host',
  
  // Storage - Required for file uploads
  BACKBLAZE_BUCKET_NAME: 'Backblaze B2 bucket name',
  BACKBLAZE_API_KEY: 'Backblaze API key',
  BACKBLAZE_APPLICATION_KEY: 'Backblaze application key',
  B2_ENDPOINT: 'Backblaze B2 endpoint URL',
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: 'Production app URL',
} as const

const optionalEnvVars = {
  // Payment (only if using Stripe)
  STRIPE_SECRET_KEY: 'Stripe secret key for payments',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  
  // Cryptocurrency (only if accepting crypto)
  NEXT_PUBLIC_USDT_WALLET_ADDRESS: 'USDT wallet address for crypto payments',
  
  // Development
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: 'Development redirect URL for Supabase',
} as const

export function validateEnvironmentVariables() {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key} (${description})`)
    }
  }
  
  // Check optional variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key} (${description})`)
    }
  }
  
  // Validate production URL format
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      errors.push('NEXT_PUBLIC_APP_URL cannot contain "localhost" in production')
    }
    if (!process.env.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_APP_URL must use HTTPS in production')
    }
  }
  
  // Check for common mistakes
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL should point to Supabase cloud, not localhost')
  }
  
  return { errors, warnings }
}

export function printEnvironmentValidation() {
  const { errors, warnings } = validateEnvironmentVariables()
  
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables for production deployment')
    }
  } else {
    console.log('\n✅ All required environment variables are set')
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Optional Environment Variables:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  
  return errors.length === 0
}

// Run validation during build
if (process.env.NODE_ENV === 'production') {
  printEnvironmentValidation()
}
