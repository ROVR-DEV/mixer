FROM oven/bun:1 as base

WORKDIR /app


FROM base as install

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile


FROM node:20-alpine

WORKDIR /var/www

RUN npm install --global pm2

COPY --from=install /app/node_modules node_modules 
COPY . .

RUN yarn build && \
    chown -R node: /var/www/*

EXPOSE 3000

USER node

CMD [ "pm2-runtime", "npm", "--", "start" ]