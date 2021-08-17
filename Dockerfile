FROM node:latest
WORKDIR /usr/src/generate-web-app
COPY package*.json ./
RUN npm i
# Necessary due to incorrect dependencies of @types/inquirer.
# See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/54885
RUN rm -rf node_modules/@types/inquirer/node_modules
COPY . ./
RUN npm run build
RUN npm link
# Linking can cause this faulty dependency to be reinstalled
RUN rm -rf node_modules/@types/inquirer/node_modules
