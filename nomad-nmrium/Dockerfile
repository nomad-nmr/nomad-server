FROM node:16

WORKDIR /app

COPY package.json /app/
COPY package-lock.json .


RUN npm install 

## next line allows to avoid overwriting node_modules using anonymous volume
## the trick used in nomad-react Dockerfile allows faster build but does not work with vite
RUN chown -R node.node /app/node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]