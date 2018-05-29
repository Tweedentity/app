#!/usr/bin/env bash

source docker/.default.env && docker run -it --rm \
  --name tweedentity-dev \
  --link tweedentity-redis:redis \
  -p 9094:9094 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity \
  -e VIRTUAL_HOST=felice0 \
  -w /usr/src/app node:6 npm test

