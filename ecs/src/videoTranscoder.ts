import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import stream from 'stream';
import logger from './logger';
import { S3, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { getObject } from './s3Utils';

// Define the video resolutions to transcode to
export const videoResolutions = {
   FullHD: { width: 1920, height: 1080 },
   HD: { width: 1280, height: 720 },
   SD: { width: 640, height: 480 },
};

const checkForFfmpeg = async (): Promise<boolean> => {
   try {
      await promisify(exec)('ffmpeg -version');
      return true;
   } catch (error) {
      logger.error('ffmpeg is not installed');
      return false;
   }
};

const downloadVideo = async (s3: S3, params: GetObjectCommandInput) => {
   logger.info(`[S3] Downloading video from ${params.Bucket}/${params.Key}`);
   try {
      const getObjectResponse = await getObject(s3, params);
      const { Body } = getObjectResponse;

      let writeStream = fs.createWriteStream(`/tmp/${params.Key}`);

      await new Promise((resolve, reject) => {
         if (Body instanceof stream.Readable) {
            Body.pipe(writeStream).on('finish', resolve).on('error', reject);
         } else {
            reject('Body is not a readable stream');
         }
      });

      logger.info(`[S3] Successfully downloaded video to /tmp/${params.Key}`);
   } catch (error: Error | any) {
      logger.error(`[S3] Error downloading video: ${error.message}`);
      throw error;
   }
};

const transcodeVideo = async (
   resolution: keyof typeof videoResolutions,
   key: string,
) => {
   logger.info(`[Transcoder] Transcoding video to ${resolution}`);
   const { width, height } = videoResolutions[resolution];
   const fileName = key.split('.').shift();
   const command = `ffmpeg -i /tmp/${key} -y -c:v libx264 -vf "scale=${width}:${height}" -c:a aac -strict experimental /tmp/${fileName}_${resolution}.mkv`;
   try {
      await promisify(exec)(command);
      logger.info(`[Transcoder] Completed transcoding to ${resolution}`);
   } catch (error: Error | any) {
      logger.error(`[Transcoder] Error transcoding video: ${error.message}`);
      throw error;
   }
};

export { checkForFfmpeg, downloadVideo, transcodeVideo };
