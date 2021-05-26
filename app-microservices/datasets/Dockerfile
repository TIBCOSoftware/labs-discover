FROM node:14.16.0-alpine3.13

RUN mkdir -p /usr/tibco-labs

WORKDIR /usr/tibco-labs

COPY package.json ./
COPY tsconfig.json ./
RUN npm set unsafe-perm true
RUN npm config set @tibco-discover:registry https://npm.labs.tibcocloud.com/
RUN npm run preinstall
RUN npm install --production

CMD tsc
# RUN ./node_modules/.bin/tsc --build tsconfig.json
COPY dist ./
RUN mkdir config
COPY config ./config

EXPOSE 8080 8558
CMD ["node", "./app.js"]