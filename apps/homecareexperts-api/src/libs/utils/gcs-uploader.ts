import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { getSerialForImage, validMimeTypes } from '../config';
import { Message } from '../enums/common.enum';

// Initialize GCS client
// In Cloud Run, authentication happens automatically via the service account
// For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'homecareexperts-media';
const bucket = storage.bucket(bucketName);

export interface UploadResult {
    publicUrl: string;
    gcsPath: string;
}

/**
 * Upload a file to Google Cloud Storage
 * @param stream - Readable stream of the file
 * @param filename - Original filename
 * @param mimetype - MIME type of the file
 * @param target - Target folder (e.g., 'member', 'service', 'article')
 * @returns Object with publicUrl and gcsPath
 */
export async function uploadToGCS(
    stream: Readable,
    filename: string,
    mimetype: string,
    target: string,
): Promise<UploadResult> {
    if (!validMimeTypes.includes(mimetype)) {
        throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
    }

    const imageName = getSerialForImage(filename);
    const gcsPath = `uploads/${target}/${imageName}`;
    const file = bucket.file(gcsPath);

    return new Promise((resolve, reject) => {
        const writeStream = file.createWriteStream({
            resumable: false,
            contentType: mimetype,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        stream
            .pipe(writeStream)
            .on('finish', async () => {
                try {
                    // Make file publicly accessible
                    await file.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsPath}`;
                    console.log(`File uploaded to GCS: ${publicUrl}`);
                    resolve({ publicUrl, gcsPath });
                } catch (err) {
                    reject(new Error(`Failed to make file public: ${err}`));
                }
            })
            .on('error', (err) => {
                console.error(`GCS upload error: ${err.message}`);
                reject(new Error(`Upload failed: ${err.message}`));
            });
    });
}

/**
 * Delete a file from Google Cloud Storage
 * @param gcsPath - The path of the file in the bucket
 */
export async function deleteFromGCS(gcsPath: string): Promise<void> {
    try {
        await bucket.file(gcsPath).delete();
        console.log(`File deleted from GCS: ${gcsPath}`);
    } catch (err) {
        console.error(`Failed to delete file from GCS: ${err}`);
    }
}
