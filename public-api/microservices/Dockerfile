# FROM node:14.16.0-alpine3.13

# RUN npm i -g nodemon npm-run-all rimraf

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# COPY package.json /usr/src/app/package.json
# RUN npm install

# COPY . /usr/src/app

# EXPOSE 8080

# CMD ["npm", "run", "dev2"]

FROM node:14.16.0-alpine3.13

RUN mkdir -p /usr/tibco-labs/discover

WORKDIR /usr/tibco-labs/discover

COPY package.json ./
COPY tsconfig.json ./
RUN npm config set @tibco-discover:registry http://npm.labs.tibcocloud.com/
RUN npm run preinstall
RUN npm install --production
CMD tsc

# RUN ./node_modules/.bin/tsc --build tsconfig.json
COPY dist ./
COPY src/api.yaml ./
RUN mkdir -p config
COPY config ./config

EXPOSE 8080 8558
CMD ["node", "./app.js"]