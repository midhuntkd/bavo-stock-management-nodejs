import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from '../../configs/config';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const sanitizeFilename = (filename: string) => filename.replace(/[^a-zA-Z0-9._-]/g, '_');

export const uploadImageToS3 = async (file: Express.Multer.File) => {
  const key = `stocks/${Date.now()}-${sanitizeFilename(file.originalname)}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
  return { key, url };
};
