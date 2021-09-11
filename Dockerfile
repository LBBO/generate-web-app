FROM node:latest
WORKDIR /usr/src/generate-web-app
COPY package*.json ./
# Ignore scripts to not install husky
RUN npm ci --ignore-scripts
COPY . ./
RUN npm run build
RUN npm link
