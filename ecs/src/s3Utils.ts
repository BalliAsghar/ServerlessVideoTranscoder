import { GetObjectCommandInput, S3 } from '@aws-sdk/client-s3';

const initializeS3Client = (
   region: string,
   accessKeyId: string,
   secretAccessKey: string,
) => {
   return new S3({
      region,
      credentials: {
         accessKeyId,
         secretAccessKey,
      },
   });
};

const getObject = async (s3: S3, params: GetObjectCommandInput) => {
   try {
      return await s3.getObject(params);
   } catch (error: Error | any) {
      throw new Error(`Error downloading video from S3: ${error.message}`);
   }
};

const putObject = async (s3: S3, bucket: string, key: string, body: Buffer) => {
   try {
      await s3.putObject({
         Bucket: bucket,
         Key: key,
         Body: body,
      });
   } catch (error: Error | any) {
      throw new Error(`Error uploading to S3: ${error.message}`);
   }
};

export { initializeS3Client, getObject, putObject };
