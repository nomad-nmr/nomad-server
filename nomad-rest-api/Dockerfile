FROM node:20.13.1-bookworm-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

EXPOSE 8080

CMD ["bash", "-c", "npm install && npm run dev-docker"]
