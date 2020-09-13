# Use the base App Engine Docker image, based on Ubuntu 16.0.4.
FROM node:12-slim

# Creating app dir.

WORKDIR /usr/proudofmom/services

# Copy files

COPY package.json ./
COPY tsconfig.json ./
COPY yarn.lock ./
# COPY .env ./
COPY src ./src/

#COPY . .

# Installing Dependencies and build

RUN yarn install --only=production
RUN yarn build

ENV SERVER_PORT 4000
EXPOSE 4000

CMD ["node", "dist/server.js"]
