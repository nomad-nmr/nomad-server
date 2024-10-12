FROM node:20.11.0-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

EXPOSE 8080

CMD ["bash", "-c", "npm install && npm run dev-docker"]
