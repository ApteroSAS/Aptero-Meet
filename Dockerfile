FROM node:16-alpine
RUN apk add git openssh

# Authorize SSH Host
RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    ssh-keyscan github.com > /root/.ssh/known_hosts

# Add the keys and set permissions
COPY ./docker/github/admin@aptero.co_ghkey /root/.ssh/id_rsa
COPY ./docker/github/admin@aptero.co_ghkey.pub /root/.ssh/id_rsa.pub
RUN chmod 600 /root/.ssh/id_rsa && \
    chmod 600 /root/.ssh/id_rsa.pub
RUN echo "    IdentityFile ~/.ssh/id_rsa" >> /etc/ssh/ssh_config

COPY ./package.json .
RUN sed -i 's|git+https://github.com/|git+ssh://git@github.com/|g' ./package.json
COPY ./yarn.lock .

RUN yarn install
COPY . .
RUN yarn run build

FROM nginx:1.21.3-alpine
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 ./dist/ /usr/share/nginx/html/