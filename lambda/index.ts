import { S3Event, APIGatewayProxyResult, Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
// Configure AWS
AWS.config.update({ region: 'eu-west-2' });

type Job = {
   bucket: string;
   key: string;
};

export const handler: Handler = async (
   event: S3Event,
): Promise<APIGatewayProxyResult> => {
   // if event is not an S3 event, return
   if (!event.Records || !event.Records.length) {
      return {
         statusCode: 400,
         body: JSON.stringify({
            message: 'Bad Request',
         }),
      };
   }

   // Get the bucket name and key from the event
   const { bucket, object } = event.Records[0].s3;

   // if the bucket or key is missing, return
   if (!bucket || !object) {
      return {
         statusCode: 400,
         body: JSON.stringify({
            message: 'Bad Request',
         }),
      };
   }

   // Create a job object
   const job: Job = {
      bucket: bucket.name,
      key: object.key,
   };

   // Run the ECS task
   await runECSTask(job);

   return {
      statusCode: 200,
      body: JSON.stringify({
         message: 'Hello, TypeScript!',
      }),
   };
};

const runECSTask = async (job: Job) => {
   const ecs = new AWS.ECS();
   console.log('Starting task');
   const params: AWS.ECS.RunTaskRequest = {
      cluster: process.env.CLUSTER_NAME,
      taskDefinition: process.env.TASK_DEFINITION ?? 'transcoder:1',
      count: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
         awsvpcConfiguration: {
            subnets: [
               'subnet-054b619e6704b3926',
               'subnet-0aa2a4e51924dac47',
               'subnet-0766fda82b803d122',
            ],
            assignPublicIp: 'ENABLED',
         },
      },
      overrides: {
         containerOverrides: [
            {
               name: 'transcoder',
               environment: [
                  {
                     name: 'JOB',
                     value: JSON.stringify(job),
                  },
               ],
            },
         ],
      },
   };

   try {
      await ecs.runTask(params).promise();
      console.log('Task Execution Started');
   } catch (error) {
      console.log(error);
      throw new Error('Failed to start task');
   }
};
