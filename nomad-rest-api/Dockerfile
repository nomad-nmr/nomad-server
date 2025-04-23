FROM node:22-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev-docker"]
