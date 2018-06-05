#!/usr/bin/env bash

docker stop app-tweedentity-app-debug
docker rm app-tweedentity-app-debug

docker stop tweedentity-app
docker rm tweedentity-app

source docker/.default.env && docker run -it \
  --name tweedentity-app-debug \
  --link tweedentity-redis:redis \
  -p 9095 \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity_app:/var/log/tweedentity_app \
  -e VIRTUAL_HOST=tweedentity.com,www.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -w /usr/src/app node:6 npm run start

