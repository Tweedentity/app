const express = require('express')
const router = express.Router()
const jsonParser = require('body-parser').json()
const Provider = require('../lib/Provider')


router.post('/eth-info', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)

  Promise.all([
    provider.gethEtherPrice(),
    provider.getGasInfo()
  ])
    .then(values => {
      res.status(200).json({
        price: values[0],
        gasInfo: values[1]
      })
    })
    .catch(err => {
      res.status(500)
    })

})

router.post('/wallet-stats', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)
  const address = req.body.address

  Promise.all([
    provider.walletStats('1', address),
    provider.walletStats('3', address)
  ])
    .then(values => {
      res.status(200).json({
        main: values[0],
        ropsten: values[1]
      })
    })
    .catch(err => {
      res.status(500)
    })
})

router.post('/get-txs', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)
  provider.getTxs(req.body)
    .then(results => {
      if (results.error) {
        throw(new Error(results.error))
      }
      res.status(200).json(results)
    })
    .catch(err => {
      console.log({error: err.message})
      res.status(200).json({error: 'Api not available'})
    })
})


router.post('/scan-tweets', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)

  provider.scanTweets(req.body.username, req.body.sig)
    .then(results => {
      if (results.error) {
        throw(new Error(results.error))
      }
      res.status(200).json(results)
    })
    .catch(err => {
      console.log({error: err.message})

      res.status(200).json({error: err.message})
    })

})

router.get('/gas-info', function (req, res, next) {

  const provider = new Provider(req.body.network)

  provider.getGasInfo()
    .then(results => {
      res.status(200).json(results)
    })
    .catch(err => {
      res.status(200).json({error: "Error retrieving gas info"})
    })

})

router.post('/contract-abi', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)

  let promises = []
  for (let a of req.body.addresses) {
    promises.push(provider.getAbi(req.body.network, a))
  }

  Promise.all(promises)
    .then(values => {
      res.status(200).json(values)
    })
    .catch(err => {
      res.status(200).json({error: "Error retrieving contract abi"})
    })

})

router.post('/twitter-user-id', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)

  provider.getUserId(req.body.username)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(200).json({error: err.message})
    })

})

router.post('/twitter-data', jsonParser, function (req, res, next) {

  const provider = new Provider(req.body.network)

  provider.getDataFromUserId(req.body.userId)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(500)
    })

})


module.exports = router
