import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function isPhotoStorageConfigured(): boolean {
  return Boolean(
    getR2Client() &&
      process.env.R2_BUCKET_NAME?.trim() &&
      process.env.R2_PUBLIC_URL?.trim()
  );
}

export type ProcessedPhotoBuffers = {
  mainJpeg: Buffer;
  thumbnailJpeg: Buffer;
  width: number | undefined;
  height: number | undefined;
  format: string | undefined;
  mainBytes: number;
};

export async function processImageForUpload(file: Buffer): Promise<ProcessedPhotoBuffers> {
  const metadata = await sharp(file).metadata();
  const mainJpeg = await sharp(file)
    .rotate()
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  const thumbnailJpeg = await sharp(file)
    .rotate()
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();
  return {
    mainJpeg,
    thumbnailJpeg,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format ?? "jpeg",
    mainBytes: mainJpeg.length,
  };
}

export async function uploadPhotoToR2(
  userId: string,
  originalName: string,
  mainJpeg: Buffer,
  thumbnailJpeg: Buffer
): Promise<{ publicUrl: string; thumbnailUrl: string; storageKey: string }> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicBase = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "");
  if (!client || !bucket || !publicBase) {
    throw new Error("Photo storage is not configured (R2 env vars).");
  }

  const timestamp = Date.now();
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "photo.jpg";
  const key = `photos/${userId}/${timestamp}_${safe}`;
  const thumbKey = `thumbnails/${userId}/${timestamp}_${safe}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: mainJpeg,
      ContentType: "image/jpeg",
    })
  );
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumbnailJpeg,
      ContentType: "image/jpeg",
    })
  );

  const publicUrl = `${publicBase}/${key}`;
  const thumbnailUrl = `${publicBase}/${thumbKey}`;
  return { publicUrl, thumbnailUrl, storageKey: key };
}
