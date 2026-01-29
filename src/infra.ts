import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// TODO: Ensure AWS_REGION environment variable is set or update the region below.
// The AWS SDK will automatically use credentials from the environment, EC2 instance metadata, or shared credentials file.

const S3_REGION = process.env.AWS_REGION || 'ap-south-1'; // Default region, adjust as needed

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let s3ClientConfig: S3ClientConfig = { region: S3_REGION };

if (accessKeyId && secretAccessKey) {
  s3ClientConfig.credentials = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  };
  console.log(
    'S3Client configured with explicit credentials from AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
  );
} else {
  console.log(
    'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not found in environment variables. S3Client will use the default credential provider chain (e.g., other AWS env vars, shared credentials file, or IAM role).'
  );
}

export const s3Client = new S3Client(s3ClientConfig);
