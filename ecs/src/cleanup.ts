import fs from 'fs';
import logger from './logger';

const cleanupTempFile = async (filePath: string) => {
   try {
      await fs.promises.unlink(filePath); // Remove the temporary file
      logger.info(`[Cleanup] Removed temporary file: ${filePath}`);
   } catch (error: Error | any) {
      logger.error(`[Cleanup] Error removing temporary file: ${error.message}`);
   }
};

export { cleanupTempFile };
