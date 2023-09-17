import logger from './logger';
import { initializeS3Client, putObject } from './s3Utils';
import {
   checkForFfmpeg,
   downloadVideo,
   transcodeVideo,
   videoResolutions,
} from './videoTranscoder';
import fs from 'fs';
import { cleanupTempFile } from './cleanup';

interface TranscodeJob {
   bucket: string;
   key: string;
}

// Main function
(async () => {
   try {
      // Read environment variables
      const job = process.env.JOB;
      const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_UPLOADING_BUCKET } = process.env;

      // Check if necessary environment variables are set
      if (!job || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_UPLOADING_BUCKET) {
         throw new Error('Missing environment variables');
      }

      // Parse the job variable as a TranscodeJob object
      const { bucket, key } = JSON.parse(job) as TranscodeJob;

      // Check if ffmpeg is installed on the system
      const ffmpegInstalled = await checkForFfmpeg();

      if (!ffmpegInstalled) {
         throw new Error('ffmpeg is not installed');
      }

      // Initialize S3 client
      const s3 = initializeS3Client('eu-west-2', S3_ACCESS_KEY, S3_SECRET_KEY);

      // Download the video file from S3
      const params = {
         Bucket: bucket,
         Key: key,
      };
      await downloadVideo(s3, params);

      // Transcode the video file into multiple resolutions
      await Promise.all(
         Object.keys(videoResolutions).map(async resolution => {
            await transcodeVideo(
               resolution as keyof typeof videoResolutions,
               key,
            );
         }),
      );

      // Upload the transcoded files to the specified S3 bucket
      await Promise.all(
         Object.keys(videoResolutions).map(async resolution => {
            const fileName = key.split('.').shift();
            const fileContent = fs.readFileSync(
               `/tmp/${fileName}_${resolution}.mkv`,
            );
            await putObject(
               s3,
               S3_UPLOADING_BUCKET!,
               `${fileName}_${resolution}.mkv`,
               fileContent,
            );
         }),
      );

      // Clean up temporary transcoded files
      await Promise.all(
         Object.keys(videoResolutions).map(async resolution => {
            const fileName = key.split('.').shift();
            cleanupTempFile(`/tmp/${fileName}_${resolution}.mkv`);
         }),
      );

      // Clean up temporary original file
      await cleanupTempFile(`/tmp/${key}`);

      logger.info('[Transcoder] Transcoding complete');
   } catch (error: Error | any) {
      logger.error(`[Main] An error occurred: ${error.message}`);
   }
})();
