#!/usr/bin/env bash

source docker/.default.env && docker run -it --rm \
  --name tweedentity-dev \
  --link tweedentity-redis:redis \
  -p 9094 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity \
  -e NODE_ENV=development \
  -e VIRTUAL_HOST=tweedentity.com.localhost \
  -w /usr/src/app node:6 npm run start
