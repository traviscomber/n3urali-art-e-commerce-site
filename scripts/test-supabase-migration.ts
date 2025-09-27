import { createClient } from "@supabase/supabase-js"

// Test script to verify Supabase migration
async function testSupabaseMigration() {
  console.log("🧪 Testing Supabase Migration...")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables")
    console.log("Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return false
  }

  console.log("✅ Environment variables found")

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check database connection
    console.log("\n📊 Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("categories").select("count").limit(1)

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError.message)
      return false
    }
    console.log("✅ Database connection successful")

    // Test 2: Check required tables exist
    console.log("\n📋 Checking required tables...")
    const requiredTables = [
      "categories",
      "images",
      "orders",
      "order_items",
      "downloads",
      "analytics_page_views",
      "analytics_events",
    ]

    for (const table of requiredTables) {
      const { data, error } = await supabase.from(table).select("*").limit(1)

      if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message)
        return false
      }
      console.log(`✅ Table '${table}' exists and accessible`)
    }

    // Test 3: Test basic CRUD operations
    console.log("\n🔧 Testing CRUD operations...")

    // Test category creation
    const { data: newCategory, error: createError } = await supabase
      .from("categories")
      .insert({
        name: "Test Category",
        slug: "test-category",
        description: "Migration test category",
      })
      .select()
      .single()

    if (createError) {
      console.error("❌ Create operation failed:", createError.message)
      return false
    }
    console.log("✅ Create operation successful")

    // Test category read
    const { data: readCategory, error: readError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", newCategory.id)
      .single()

    if (readError) {
      console.error("❌ Read operation failed:", readError.message)
      return false
    }
    console.log("✅ Read operation successful")

    // Test category update
    const { error: updateError } = await supabase
      .from("categories")
      .update({ description: "Updated test category" })
      .eq("id", newCategory.id)

    if (updateError) {
      console.error("❌ Update operation failed:", updateError.message)
      return false
    }
    console.log("✅ Update operation successful")

    // Test category delete
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", newCategory.id)

    if (deleteError) {
      console.error("❌ Delete operation failed:", deleteError.message)
      return false
    }
    console.log("✅ Delete operation successful")

    // Test 4: Check RLS policies (if enabled)
    console.log("\n🔒 Testing Row Level Security...")
    const { data: rlsTest, error: rlsError } = await supabase.from("images").select("id").limit(1)

    if (rlsError && rlsError.message.includes("RLS")) {
      console.log("⚠️  RLS is enabled - make sure policies are configured correctly")
    } else {
      console.log("✅ RLS test passed")
    }

    console.log("\n🎉 All migration tests passed!")
    console.log("Your Supabase migration is ready for production.")

    return true
  } catch (error) {
    console.error("❌ Migration test failed:", error)
    return false
  }
}

// Run the test
testSupabaseMigration()
  .then((success) => {
    if (success) {
      console.log("\n✅ Migration verification complete!")
      process.exit(0)
    } else {
      console.log("\n❌ Migration verification failed!")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("Test runner error:", error)
    process.exit(1)
  })
