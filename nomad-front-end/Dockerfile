FROM node:16

WORKDIR /app

COPY package.json /app/

#--legacy-peer-deps for CRACO being able to use react-scripts@4.0.0 as dev dependency 
RUN npm install --legacy-peer-deps

## next line allows to avoid overwriting node_modules using anonymous volume
RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

COPY . .

EXPOSE 3003

CMD ["npm", "run" , "dev-docker"]