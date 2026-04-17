FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

EXPOSE $PORT

CMD ["node", "src/app.js"]
