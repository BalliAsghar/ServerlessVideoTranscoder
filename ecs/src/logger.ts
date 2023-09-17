import winston from 'winston';

const logger = winston.createLogger({
   level: 'info',
   format: winston.format.json(),
   transports: [
      new winston.transports.Console(), // Log to the console
      new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
   ],
});

export default logger;
