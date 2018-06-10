#!/usr/bin/env bash

source ../.default.env && docker run -it --rm \
  --name tweedentity-app-dev \
  --link tweedentity-redis:redis \
  -p 9095 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity_app \
  -e INFURA_ID=$INFURA_ID \
  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
  -e NODE_ENV=development \
  -e VIRTUAL_HOST=app.tweedentity.com.localhost \
  -w /usr/src/app node:carbon npm run start
