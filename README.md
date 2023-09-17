# A Serverless Video Transcoder with AWS Lambda and ECS

This is a sample project to demonstrate how to build a serverless video transcoder with AWS Lambda and ECS.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [How it works](#how-it-works)
- [Folder Structure](#folder-structure)
- [License](#license)

## Architecture

![Architecture](./architecture.png)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- AWS account with necessary permissions
- Docker installed locally for building ECS containers
- Node.js and npm for Lambda function development

## Getting Started

To get started with this project, follow these steps:

1. Clone this repository to your local machine.
2. Configure AWS CLI with your credentials and default region.
3. Create S3 buckets for raw and transcoded videos (e.g., `RawBucket` and `TranscodedBucket`).
4. Build and deploy the Lambda function in the `./lambda` directory.
5. Build and deploy the ECS task using the Dockerfile and task definition in the `./ecs` directory.
6. Configure event triggers for the Lambda function to monitor the `RawBucket`.

## How it works

1. Upload a video file to S3 bucket (e.g. `RawBucket`)
2. S3 event triggers Lambda function (e.g. `TranscoderLambda`)
3. Lambda function starts ECS task (e.g. `TranscoderTask`) with the video bucket and key as environment variable
4. ECS downloads the video from S3 bucket (e.g. `RawBucket`) and transcodes it with [ffmpeg](https://ffmpeg.org/) to different resolutions (e.g. 1080p, 720p, 480p)
5. ECS uploads the transcoded videos to different S3 bucket (e.g. `TranscodedBucket`)

## Folder structure

- `./lambda`: Lambda function source code
- `./ecs`: ECS task definition and Dockerfile

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
