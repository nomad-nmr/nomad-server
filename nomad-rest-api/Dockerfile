FROM node:20.11.0-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run" , "dev-docker"]