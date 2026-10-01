FROM node:24-alpine AS builder

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run 'build:es'

FROM node:24-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD [ "npm", "run", "start" ]
