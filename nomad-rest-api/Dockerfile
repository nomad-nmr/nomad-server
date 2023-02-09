FROM node:18.14-slim

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run" , "dev-docker"]