// Health check endpoint for Vercel deployment
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'OK',
      message: 'Cursalo API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
