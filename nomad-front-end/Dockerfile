FROM node:16

WORKDIR /app

COPY package.json /app/

RUN npm install 

## next line allows to avoid overwriting node_modules using anonymous volume
RUN chown -R node.node /app/node_modules

COPY . .

EXPOSE 3003

CMD ["npm", "run" , "dev-docker"]