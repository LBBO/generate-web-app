FROM node:lts-alpine
RUN apk add git python make g++
WORKDIR /usr/src/generate-web-app
COPY package*.json ./
# Ignore scripts to not install husky
RUN npm ci --ignore-scripts
COPY . ./
RUN npm run build
RUN npm link
