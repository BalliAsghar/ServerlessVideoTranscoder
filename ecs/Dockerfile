FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install ffmpeg and x265
RUN apt-get update && \
    apt-get install -y ffmpeg libavcodec-extra libmp3lame-dev libx264-dev

# Install app dependencies
COPY package*.json ./

RUN yarn install

# Bundle app source
COPY . .

RUN npm run build

CMD [ "node", "build/index.js" ]