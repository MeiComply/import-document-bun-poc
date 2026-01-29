import dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
// Based on PR #93: Import-documents-service should access documents from "non_prod" database
// Structure: Connection V3_DB > Database non_prod > Collection documents
const DB_NAME = 'non_prod';

/**
 * Global singleton pattern for MongoDB Import Documents Service connection
 * This prevents connection leaks during Hot Module Replacement (HMR) in development
 * @see https://github.com/vercel/next.js/discussions/26427
 */

// Extend globalThis for TypeScript support
declare global {
   
  var _importDocumentsConnection: Connection | null | undefined;
   
  var _importDocumentsConnectionPromise: Promise<Connection> | null | undefined;
}

// Use global singleton in development to survive HMR
const getImportDocumentsConnection = (): Connection | null => {
  if (process.env.NODE_ENV === 'development') {
    return global._importDocumentsConnection ?? null;
  }
  return documentsConnectionLocal;
};

const setImportDocumentsConnection = (conn: Connection | null): void => {
  if (process.env.NODE_ENV === 'development') {
    global._importDocumentsConnection = conn;
  } else {
    documentsConnectionLocal = conn;
  }
};

const getConnectionPromise = (): Promise<Connection> | null => {
  if (process.env.NODE_ENV === 'development') {
    return global._importDocumentsConnectionPromise ?? null;
  }
  return connectionPromiseLocal;
};

const setConnectionPromise = (promise: Promise<Connection> | null): void => {
  if (process.env.NODE_ENV === 'development') {
    global._importDocumentsConnectionPromise = promise;
  } else {
    connectionPromiseLocal = promise;
  }
};

// Local fallback for production
let documentsConnectionLocal: Connection | null = null;
let connectionPromiseLocal: Promise<Connection> | null = null;

// Log singleton initialization in development
if (process.env.NODE_ENV === 'development') {
  console.log(
    `🔧 [import-documents-service/database] Using global singleton cache (connection: ${getImportDocumentsConnection() ? 'connected' : 'disconnected'})`
  );
}

const connectDB = async (): Promise<Connection> => {
  try {
    let documentsConnection = getImportDocumentsConnection();
    let connectionPromise = getConnectionPromise();

    // If we already have a valid connection, return it
    if (documentsConnection && documentsConnection.readyState === 1) {
      const currentDb = documentsConnection.db?.databaseName;
      if (currentDb && currentDb !== DB_NAME) {
        console.warn(`Connected to wrong database: ${currentDb}. Reconnecting to ${DB_NAME}...`);
        await documentsConnection.close();
        setImportDocumentsConnection(null);
        setConnectionPromise(null);
        documentsConnection = null;
        connectionPromise = null;
      } else if (currentDb === DB_NAME) {
        console.log(`=> using existing Import-documents-service MongoDB connection to ${DB_NAME}`);
        return documentsConnection;
      }
    }

    // If connection is in progress, wait for it
    if (documentsConnection && documentsConnection.readyState === 2) {
      console.log('Import-documents-service MongoDB connection in progress, waiting...');
      return documentsConnection;
    }

    // If there's an existing connection promise, wait for it
    if (connectionPromise) {
      console.log('Import-documents-service MongoDB connection already in progress, waiting...');
      return await connectionPromise;
    }

    // Clean up invalid connection state
    if (
      documentsConnection &&
      documentsConnection.readyState !== 1 &&
      documentsConnection.readyState !== 2
    ) {
      console.log(
        'Import-documents-service MongoDB connection state was not connected or connecting, attempting to reconnect.'
      );
      setImportDocumentsConnection(null);
    }

    console.log(`Attempting to connect to MongoDB with database: ${DB_NAME}`);

    // Create connection promise to prevent multiple simultaneous connection attempts
    const newConnectionPromise = mongoose
      .createConnection(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // Increased from 10000 to 30000 to match other services
        socketTimeoutMS: 45000,
        maxPoolSize: 3,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        dbName: DB_NAME,
        readPreference: 'primaryPreferred', // Allow fallback to secondary if primary unavailable
        retryWrites: true,
        retryReads: true,
        heartbeatFrequencyMS: 10000,
        autoIndex: false,
        autoCreate: true,
      })
      .asPromise();

    setConnectionPromise(newConnectionPromise);
    const newConnection = await newConnectionPromise;

    console.log(`Import-documents-service MongoDB connected successfully to ${DB_NAME}`);

    // Handle connection events for better debugging
    newConnection.on('error', (error) => {
      console.error('Import-documents-service MongoDB connection error:', error);
      // Don't crash the service, just log the error
    });

    newConnection.on('disconnected', () => {
      console.log('Import-documents-service MongoDB disconnected');
      setImportDocumentsConnection(null);
      setConnectionPromise(null);
    });

    newConnection.on('reconnected', () => {
      console.log('Import-documents-service MongoDB reconnected');
    });

    setImportDocumentsConnection(newConnection);
    setConnectionPromise(null); // Clear the promise
    return newConnection;
  } catch (error: any) {
    console.error('Import-documents-service MongoDB initial connection error:', error);
    setImportDocumentsConnection(null);
    setConnectionPromise(null); // Clear the promise on error

    // Provide helpful error messages
    if (error?.reason?.type === 'ReplicaSetNoPrimary') {
      console.error('❌ MongoDB Replica Set Error: No primary server found. This could indicate:');
      console.error('   1. IP address not whitelisted in MongoDB Atlas');
      console.error('   2. Network connectivity issues');
      console.error('   3. MongoDB Atlas cluster is down or being upgraded');
      console.error(`   Connection URI: ${MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    } else if (error?.message?.includes('whitelist')) {
      console.error(
        '❌ IP Whitelist Error: Your IP address may not be whitelisted in MongoDB Atlas.'
      );
      console.error('   Please add your IP to the MongoDB Atlas IP whitelist:');
      console.error('   https://www.mongodb.com/docs/atlas/security-whitelist/');
    }

    // Don't crash the service, just log the error and return null
    // The service can continue without database connection for now
    console.warn(
      'Import-documents-service will continue without database connection. Some features may be limited.'
    );
    return null as any; // Return null but typed as Connection to prevent crashes
  }
};

// Safe connection function that doesn't crash the service
const safeConnectDB = async (): Promise<Connection | null> => {
  try {
    return await connectDB();
  } catch (error) {
    console.error('Safe connect failed:', error);
    return null;
  }
};

// Initialize connection without blocking the service startup
const initializeConnection = () => {
  // Use setTimeout to make the connection non-blocking
  setTimeout(async () => {
    try {
      // Only initialize if this service is hosted

      await safeConnectDB();
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      // Don't crash the service
    }
  }, 1000); // Delay connection by 1 second to let service start
};

// Graceful shutdown function
const closeConnection = async (): Promise<void> => {
  try {
    const documentsConnection = getImportDocumentsConnection();
    if (documentsConnection) {
      console.log('Closing Import-documents-service MongoDB connection...');
      await documentsConnection.close();
      setImportDocumentsConnection(null);
      setConnectionPromise(null);
      console.log('✅ Import-documents-service MongoDB connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing Import-documents-service MongoDB connection:', error);
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing Import-documents-service MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing Import-documents-service MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

// Export connectDB function and initialize connection safely
export { closeConnection, connectDB, safeConnectDB };
initializeConnection(); // Use the safe initialization
