FROM node:10.16-alpine as build-stage
MAINTAINER Nobuyuki Matsui <nobuyuki.matsui@gmail.com>

WORKDIR /opt/app
COPY ./vue-app/package.json /opt/app/
COPY ./vue-app/package-lock.json /opt/app/
COPY ./vue-app/babel.config.js /opt/app/
COPY ./vue-app/postcss.config.js /opt/app/
COPY ./vue-app/vue.config.js /opt/app/
COPY ./vue-app/.browserslistrc /opt/app/
COPY ./vue-app/.eslintrc.js /opt/app/
COPY ./vue-app/public/ /opt/app/public/
COPY ./vue-app/src/ /opt/app/src/
RUN npm install && npm run build


FROM python:3.7-alpine3.10 as production-stage
MAINTAINER Nobuyuki Matsui <nobuyuki.matsui@gmail.com>

ARG LISTEN_PORT
ENV LISTEN_PORT ${LISTEN_PORT:-3000}

COPY ./flask-app /opt/flask-app
COPY --from=build-stage /opt/app/dist /opt/vue-app/dist

WORKDIR /opt/flask-app

RUN apk update && \
    apk add --no-cache nginx supervisor && \
    apk add --no-cache --virtual .build python3-dev build-base linux-headers pcre-dev && \
    pip install pipenv uwsgi~=2.0 && \
    pipenv install --system && \
    rm /etc/nginx/nginx.conf && \
    apk del --purge .build && \
    rm -r /root/.cache

COPY docker-conf/nginx.conf /etc/nginx/nginx.conf
COPY docker-conf/flask-nginx.conf /etc/nginx/conf.d/flask-nginx.conf
COPY docker-conf/uwsgi.ini /etc/uwsgi/uwsgi.ini
COPY docker-conf/supervisord.conf /etc/supervisord.conf
COPY docker-conf/entrypoint.sh /opt

RUN chmod a+x /opt/entrypoint.sh

ENTRYPOINT /opt/entrypoint.sh
