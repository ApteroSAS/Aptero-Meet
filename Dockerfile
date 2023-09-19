FROM node:18-alpine
RUN apk add git openssh
RUN npm i -g cross-env

COPY ./modules/basic-modules/package.json ./modules/basic-modules/package.json
COPY ./modules/basic-modules/yarn.lock ./modules/basic-modules/yarn.lock
RUN yarn --cwd ./modules/basic-modules
COPY ./modules/basic-modules/ ./modules/basic-modules/
RUN yarn --cwd ./modules/basic-modules run build

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install

COPY . .
RUN yarn run build

FROM nginx:1.21.3-alpine
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 ./dist/ /usr/share/nginx/html/
