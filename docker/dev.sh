#!/usr/bin/env bash

source docker/.default.env && docker run -it --rm \
  --name tweedentity-dev \
  --link tweedentity-redis:redis \
  -p 9095 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity_app \
  -e NODE_ENV=development \
  -e VIRTUAL_HOST=app.tweedentity.com.localhost \
  -w /usr/src/app node:6 npm run start
