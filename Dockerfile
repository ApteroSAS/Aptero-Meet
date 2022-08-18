FROM node:16-alpine
RUN apk add git openssh
RUN npm i -g cross-env
COPY ./package.json .
COPY ./yarn.lock .

COPY ./modules/ ./modules/
RUN yarn --cwd ./modules/basic-modules run setup && \
    yarn --cwd ./modules/basic-modules run build
RUN yarn --cwd ./modules/teams-module run setup && \
    yarn --cwd ./modules/teams-module run build
RUN yarn install
COPY . .
RUN yarn run build

FROM nginx:1.21.3-alpine
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 ./dist/ /usr/share/nginx/html/