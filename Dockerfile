# Based off of node:lts-alpine, but also installs node-gyp.
# This is necessary in order to install node-sass
FROM andreysenov/node-gyp
# The base image sets a user. Revert that for ease of use
USER root
# Git is neither installed nor configured yet. Since frameworks also initialize git repos, make sure both is done
# before installing anything
RUN apk add --no-cache git \
	&& git config --global user.email "docker@example.com" \
    && git config --global user.name "Docker"

# Set up GWA
WORKDIR /usr/src/generate-web-app
COPY package*.json ./
# Ignore scripts to not install husky
RUN npm ci --ignore-scripts
COPY . ./
RUN npm run build && npm link

ENTRYPOINT gwa
