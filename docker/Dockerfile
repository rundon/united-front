FROM node:lts-alpine

ENV LANG zh_CN.UTF-8
RUN npm install -g http-server

COPY app /app
COPY run.sh /run.sh
WORKDIR /app
RUN npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm rebuild node-sass
RUN chmod +x /run.sh \
  && dos2unix -u /run.sh

ENTRYPOINT ["sh", "/run.sh"]
