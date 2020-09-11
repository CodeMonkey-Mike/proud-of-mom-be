FROM node:lts-slim

# Creating app dir.

WORKDIR /usr/netishop-services

# Copy files

COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
COPY src ./src/

#COPY . .

# Installing Dependencies and build

RUN yarn install
RUN yarn build

ENV SERVER_PORT 4000
EXPOSE 4000

CMD ["node", "dist/server.js"]
