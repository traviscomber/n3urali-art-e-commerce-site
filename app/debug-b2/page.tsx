// Mark as dynamic to prevent prerender issues
export const dynamic = 'force-dynamic'

export default function DebugB2Page() {
  const bucketName = process.env.BACKBLAZE_BUCKET_NAME
  const bucketId = process.env.BACKBLAZE_BUCKET_ID
  const apiKey = process.env.BACKBLAZE_API_KEY ? '✓ SET' : '✗ NOT SET'
  const appKey = process.env.BACKBLAZE_APPLICATION_KEY ? '✓ SET' : '✗ NOT SET'
  
  return (
    <div className="p-8 bg-black text-white min-h-screen font-mono">
      <h1 className="text-3xl mb-8">Backblaze Credentials Debug</h1>
      
      <div className="space-y-4 text-lg">
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-cyan-400">BACKBLAZE_BUCKET_NAME:</p>
          <p className="text-xl font-bold">{bucketName || '❌ NOT SET'}</p>
        </div>
        
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-cyan-400">BACKBLAZE_BUCKET_ID:</p>
          <p className="text-xl font-bold">{bucketId || '❌ NOT SET'}</p>
        </div>
        
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-cyan-400">BACKBLAZE_API_KEY:</p>
          <p className="text-xl font-bold">{apiKey}</p>
        </div>
        
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-cyan-400">BACKBLAZE_APPLICATION_KEY:</p>
          <p className="text-xl font-bold">{appKey}</p>
        </div>
        
        {bucketName && (
          <div className="p-4 bg-green-900 rounded border border-green-700 mt-8">
            <p className="text-green-400">Expected URL format:</p>
            <p className="text-xl font-bold">https://f005.backblazeb2.com/file/{bucketName}/PICS/Theatre/[filename]</p>
          </div>
        )}
      </div>
    </div>
  )
}
