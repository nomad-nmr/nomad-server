FROM node:20.13.1-bookworm-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev-docker"]
