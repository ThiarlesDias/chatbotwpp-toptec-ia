FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

RUN pip3 install --no-cache-dir --break-system-packages faster-whisper

COPY . .

CMD ["npm", "start"]
