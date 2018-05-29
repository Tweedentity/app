#!/usr/bin/env bash

docker stop tweedentity-web-debug
docker rm tweedentity-web-debug

docker stop tweedentity-web
docker rm tweedentity-web

source docker/.default.env && docker run -it \
  --name tweedentity-web-debug \
  --link tweedentity-redis:redis \
  -p 9094 \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity:/var/log/tweedentity \
  -e VIRTUAL_HOST=tweedentity.com,www.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -w /usr/src/app node:6 npm run start

