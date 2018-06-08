#!/usr/bin/env bash

docker stop tweedentity-app
docker rm tweedentity-app

docker run -d \
  --name tweedentity-app \
  --link tweedentity-redis:redis \
  -p 9095 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity_app:/var/log/tweedentity_app \
  -e NODE_ENV=production \
  -e VIRTUAL_HOST=app.tweedentity.com \
  -e LETSENCRYPT_HOST=app.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -w /usr/src/app node:6 npm run start

