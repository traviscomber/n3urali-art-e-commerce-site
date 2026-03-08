import { createClient } from "@/lib/supabase/server"

// Mark this page as dynamic since it queries the database
export const dynamic = 'force-dynamic'

export default async function DebugUrlsPage() {
  const supabase = await createClient()

  const { data: images } = await supabase
    .from("images")
    .select("id, title, original_url, upscaled_url, thumbnail_medium_url, file_path, created_at")
    .eq("active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl mb-8">Debug: All Image URLs</h1>
      
      {images?.map((img) => (
        <div key={img.id} className="mb-8 p-4 border border-gray-700 rounded">
          <h2 className="text-xl font-bold mb-2">{img.title}</h2>
          <p className="text-sm text-gray-400 mb-4">Created: {new Date(img.created_at).toLocaleString()}</p>
          
          <div className="space-y-3 font-mono text-xs">
            <div>
              <p className="text-cyan-400">file_path:</p>
              <p className="break-all text-gray-300 bg-gray-900 p-2 rounded">{img.file_path}</p>
            </div>
            
            <div>
              <p className="text-cyan-400">original_url:</p>
              <p className="break-all text-gray-300 bg-gray-900 p-2 rounded">{img.original_url}</p>
            </div>
            
            <div>
              <p className="text-cyan-400">upscaled_url:</p>
              <p className="break-all text-gray-300 bg-gray-900 p-2 rounded">{img.upscaled_url}</p>
            </div>
            
            <div>
              <p className="text-cyan-400">thumbnail_medium_url:</p>
              <p className="break-all text-gray-300 bg-gray-900 p-2 rounded">{img.thumbnail_medium_url}</p>
            </div>
          </div>
          
          {/* Test if URL is accessible */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-yellow-400 mb-2">URL Access Test:</p>
            <div className="space-y-2 text-xs">
              {img.original_url && (
                <div>
                  <p>original_url status: 
                    <a href={img.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline ml-2">
                      test link
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
