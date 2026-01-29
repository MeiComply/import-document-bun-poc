import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { Connection, Model, Schema } from 'mongoose';

import { s3Client } from '../infra';

const deleteS3Objects = async (s3Keys: string[]) => {
  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: `v3-${process.env.INFRA_ENV}-excel-imports`,
      Delete: {
        Objects: s3Keys.map((s3Key) => ({ Key: s3Key })),
      },
    })
  );
};

// TypeScript interface for the import history document
export interface IImportHistory {
  batchId: string;
  clientId: string;
  userId: string;
  platformEnv: string; // Added for platform environment tracking
  batchStatus: 'processing' | 'completed' | 'failed' | 'validation_completed';
  documentsCount: number;
  files: Array<{
    fileId: string;
    fileName: string;
    fileStatus: 'processing' | 'completed' | 'rejected' | 'failed' | 'deleted';
    uploadedDateTime: Date;
    documentsCount: number;
    hasDuplicatesWith: string[];
    s3Key?: string; // Optional S3 key for cleanup reference (not present for rejected files)
  }>;
  documentNumberMap: Record<string, string[]>; // documentNumber -> array of fileIds
  documentType: 'invoice' | 'receipt'; // Added for collection naming
  country: string; // Added for collection naming
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // TTL field - documents will be automatically deleted after this date
}

// MongoDB Schema definition
const ImportHistorySchema = new Schema<IImportHistory>(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    platformEnv: {
      type: String,
      required: true,
      index: true,
    },
    batchStatus: {
      type: String,
      enum: ['processing', 'completed', 'failed', 'validation_completed'],
      required: true,
      default: 'processing',
    },
    documentsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    files: [
      {
        fileId: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileStatus: {
          type: String,
          enum: ['processing', 'completed', 'rejected', 'failed', 'deleted'],
          required: true,
          default: 'processing',
        },
        uploadedDateTime: {
          type: Date,
          required: true,
          default: Date.now,
        },
        documentsCount: {
          type: Number,
          required: true,
          default: 0,
        },
        hasDuplicatesWith: [
          {
            type: String,
          },
        ],
        s3Key: {
          type: String,
          required: false, // Optional - not present for rejected files
        },
      },
    ],
    documentNumberMap: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    documentType: {
      type: String,
      enum: ['invoice', 'receipt'],
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1, // Descending index for recent-first queries
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
      expires: 0, // MongoDB TTL - documents expire when expiresAt is reached
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, // Mongoose will handle these automatically
    collection: 'import_history', // This will be overridden when creating models
  }
);

// Compound indexes for better query performance
ImportHistorySchema.index({ clientId: 1, createdAt: -1 });
ImportHistorySchema.index({ userId: 1, createdAt: -1 });
ImportHistorySchema.index({ batchId: 1, clientId: 1 });
ImportHistorySchema.index({ batchStatus: 1, createdAt: -1 });
ImportHistorySchema.index({ country: 1, documentType: 1, createdAt: -1 });
ImportHistorySchema.index({ clientId: 1, country: 1, documentType: 1, createdAt: -1 }); // For getImportHistory API
ImportHistorySchema.index({ clientId: 1, 'files.uploadedDateTime': -1 }); // For efficient file sorting in aggregation
ImportHistorySchema.index({ clientId: 1, platformEnv: 1, 'files.uploadedDateTime': -1 }); // For platformEnv filtering with file sorting

// Pre-save middleware to update the updatedAt field
ImportHistorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
});

// Pre-update middleware to update the updatedAt field
ImportHistorySchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function (next) {
  this.set({ updatedAt: new Date() });
});

// Helper function to extract S3 keys from files array
const extractS3Keys = (files: any[]): string[] => {
  return files
    .filter((file) => file.s3Key) // Only files with s3Key (uploaded to S3)
    .map((file) => file.s3Key);
};

// Pre-delete middleware for S3 cleanup
ImportHistorySchema.pre('deleteOne', async function () {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.files) {
      const filesWhichAreNotRejected = doc.files.filter(
        (file: any) => file.fileStatus !== 'rejected'
      );
      const s3Keys = extractS3Keys(filesWhichAreNotRejected);
      if (s3Keys.length > 0) {
        await deleteS3Objects(s3Keys);
      }
    }
  } catch (error) {
    console.error('Error during S3 cleanup in deleteOne:', error);
    // Don't throw error to prevent deletion failure
  }
});

ImportHistorySchema.pre('deleteMany', async function () {
  try {
    const docs = await this.model.find(this.getQuery());
    const allS3Keys: string[] = [];

    for (const doc of docs) {
      if (doc.files) {
        const filesWhichAreNotRejected = doc.files.filter(
          (file: any) => file.fileStatus !== 'rejected'
        );
        const s3Keys = extractS3Keys(filesWhichAreNotRejected);
        allS3Keys.push(...s3Keys);
      }
    }

    if (allS3Keys.length > 0) {
      await deleteS3Objects(allS3Keys);
    }
  } catch (error) {
    console.error('Error during S3 cleanup in deleteMany:', error);
    // Don't throw error to prevent deletion failure
  }
});

ImportHistorySchema.pre('findOneAndDelete', async function () {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.files) {
      const filesWhichAreNotRejected = doc.files.filter(
        (file: any) => file.fileStatus !== 'rejected'
      );
      const s3Keys = extractS3Keys(filesWhichAreNotRejected);
      if (s3Keys.length > 0) {
        await deleteS3Objects(s3Keys);
      }
    }
  } catch (error) {
    console.error('Error during S3 cleanup in findOneAndDelete:', error);
    // Don't throw error to prevent deletion failure
  }
});

// Static methods for the model
ImportHistorySchema.statics.getCollectionName = function (
  country: string,
  documentType: string
): string {
  return `${country}_${documentType.toLowerCase()}_imports`;
};

// Instance methods
ImportHistorySchema.methods.addFile = function (fileData: {
  fileId: string;
  fileName: string;
  fileStatus?: string;
  documentsCount?: number;
  s3Key?: string; // Optional - not present for rejected files
}) {
  this.files.push({
    ...fileData,
    fileStatus: fileData.fileStatus || 'processing',
    documentsCount: fileData.documentsCount || 0,
    uploadedDateTime: new Date(),
    hasDuplicatesWith: [],
  });
  return this.save();
};

ImportHistorySchema.methods.updateFileStatus = function (
  fileId: string,
  status: string,
  documentsCount?: number
) {
  const file = this.files.find((f: any) => f.fileId === fileId);
  if (file) {
    file.fileStatus = status;
    if (documentsCount !== undefined) {
      file.documentsCount = documentsCount;
    }
  }
  return this.save();
};

ImportHistorySchema.methods.updateDuplicates = function () {
  // Clear existing duplicates
  this.files.forEach((file: any) => {
    file.hasDuplicatesWith = [];
  });

  // Find duplicates based on documentNumberMap
  for (const [documentNumber, fileIds] of Object.entries(this.documentNumberMap)) {
    if ((fileIds as string[]).length > 1) {
      (fileIds as string[]).forEach((currentFileId) => {
        const file = this.files.find((f: any) => f.fileId === currentFileId);
        if (file) {
          file.hasDuplicatesWith = (fileIds as string[]).filter((id) => id !== currentFileId);
        }
      });
    }
  }
  return this.save();
};

// Export the schema and model creation function
export { ImportHistorySchema };

// Dynamic model creation function for different collections
export function getImportHistoryModel(
  connection: Connection,
  country: string,
  documentType: 'invoice' | 'receipt'
): Model<IImportHistory> {
  const collectionName = `${country}_${documentType.toLowerCase()}_imports`;

  // Check if model already exists to avoid re-compilation
  if (connection.models[collectionName]) {
    return connection.models[collectionName] as Model<IImportHistory>;
  }

  console.log(
    '🚀🚀👀👀👀👀🚀🚀 ~ getImportHistoryModel ~ connection.model<IImportHistory>(collectionName, ImportHistorySchema, collectionName):',
    connection.model<IImportHistory>(collectionName, ImportHistorySchema, collectionName)
  );
  return connection.model<IImportHistory>(collectionName, ImportHistorySchema, collectionName);
}

// Default export for backwards compatibility
export default ImportHistorySchema;
