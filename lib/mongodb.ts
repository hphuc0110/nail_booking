import { MongoClient, Db, ServerApiVersion } from 'mongodb'

// Get MongoDB URI from environment variables
// Next.js automatically loads .env, .env.local, .env.development, etc.
// Fallback to hardcoded value if env var is not available (for development/build)
// Add retryWrites and tls options to connection string
const baseUri = process.env.MONGODB_URI || 
                process.env.NEXT_PUBLIC_MONGODB_URI || 
                'mongodb+srv://cclemonchanh04_db_user:hQuEWZnebsLVvKRu@nail.94rxnva.mongodb.net/?appName=nail'

// Ensure connection string has proper SSL parameters
const uri = baseUri.includes('retryWrites') 
  ? baseUri 
  : baseUri.includes('?') 
    ? `${baseUri}&retryWrites=true&w=majority`
    : `${baseUri}?retryWrites=true&w=majority`

// Debug: Log environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('MongoDB URI check:', {
    hasMongoUri: !!uri,
    uriLength: uri?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('MONGO'))
  })
}

// URI should always be available now due to fallback
// But we'll keep this check for safety
if (!uri || uri === 'undefined') {
  const errorMsg = 
    'MongoDB URI not found!\n\n' +
    'Please create a .env or .env.local file in the root directory with:\n' +
    'MONGODB_URI=mongodb+srv://cclemonchanh04_db_user:hQuEWZnebsLVvKRu@nail.94rxnva.mongodb.net/?appName=nail\n\n' +
    'Then restart your development server completely (stop and start again).'
  console.error('MongoDB URI not found in environment variables')
  console.error('Available env keys:', Object.keys(process.env).slice(0, 10))
  throw new Error(errorMsg)
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false, // Set to false to allow more flexibility
    deprecationErrors: false, // Set to false to avoid deprecation errors
  },
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increase timeout
  socketTimeoutMS: 45000,
  // SSL/TLS options to fix connection issues
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Retry options
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().then(async (client) => {
      console.log('Successfully connected to MongoDB!')
      return client
    }).catch((error) => {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then(async (client) => {
    console.log('Successfully connected to MongoDB!')
    return client
  }).catch((error) => {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  })
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise
    
    // Use database name from connection string or default to 'nail-booking'
    const dbName = process.env.MONGODB_DB_NAME || 'nail-booking'
    const db = client.db(dbName)
    
    return db
  } catch (error) {
    console.error('Error getting MongoDB database:', error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

