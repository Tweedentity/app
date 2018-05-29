const express = require('express')
const router = express.Router()
const jsonParser = require('body-parser').json()
const provider = require('../lib/Provider')


router.post('/wallet-stats', jsonParser, function (req, res, next) {

  const network = req.body.network
  const address = req.body.address

  if (network == '1') {
    // we are in production

    provider.walletStats('1', address)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(500)
    })

  } else {

    Promise.all([
      provider.gethEtherPrice(),
      provider.walletStats('1', address),
      provider.walletStats('3', address)
    ])
    .then(values => {
      res.status(200).json({
        result: {
          price: values[0],
          main: values[1],
          ropsten: values[2]
        }
      })
    })
    .catch(err => {
      res.status(500)
    })

  }

})


router.post('/scan-tweets', jsonParser, function (req, res, next) {

  provider.scanTweets(req.body.screenName, req.body.sig)
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => {
    res.status(500)
  })

})


router.post('/twitter-user-id', jsonParser, function (req, res, next) {

  provider.getUserId(req.body.screenName)
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => {
    res.status(500)
  })

})

router.get('/', function (req, res, next) {

  res.json({
    success: true,
    message: 'Welcome!'
  })
})

module.exports = router
