const db = require('./db').redis
const _ = require('lodash')
const Web3 = require('web3')
const request = require('superagent')
const gasUrl = 'https://ethgasstation.info/json/ethgasAPI.json'
const fs = require('./fs')
const path = require('path')
const cheerio = require('cheerio')

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/' + process.env.INFURA_ID))

const etherscanApiKey = process.env.ETHERSCAN_TWEEDENTITY_API_KEY

const config = require('../../client/js/config')

class Provider {

  constructor() {


  }

  getApiUrl(action, network, address) {
    return `http://api${network == '3' ? '-ropsten' : ''}.etherscan.io/api?module=account&action=${action}&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`
  }

  gethEtherPrice() {
    return db.getAsync('etherPrice')
    .then(price => {
      if (price) {
        return Promise.resolve(price)
      } else {
        return request
        .get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
        .then(res => {
          price = res.body.USD
          db.set('etherPrice', price, 'EX', 300)
          return Promise.resolve(price)
        })
      }
    })
  }

  scanTx(result, address) {

    let txs = 0
    let froms = {}
    let tos = {}
    let valueFrom = 0
    let valueTo = 0
    let execs = 0
    let deployes = 0

    for (let r of result) {
      txs++
      if (r.from == address) {
        if (r.value != '0') {
          valueTo += parseInt(r.value.replace(/\d{12}$/, ''), 10) / 1e6
          tos[r.to] = 1
        } else {
          if (r.to) {
            execs++
          } else {
            deployes++
          }
        }
      } else if (r.to == address) {
        if (r.value != '0') {
          froms[r.from] = 1
          valueFrom += parseInt(r.value.replace(/\d{12}$/, ''), 10) / 1e6
        }
      }
    }

    return {
      txs,
      froms: _.keys(froms).length,
      tos: _.keys(tos).length,
      valueFrom: valueFrom,
      valueTo: valueTo,
      execs,
      deployes
    }
  }

  walletStats(network, address) {

    const apiUrl = this.getApiUrl('txlist', network, address)
    const apiUrl2 = this.getApiUrl('balance', network, address)

    return this.gethEtherPrice()
    .then(price => {
      return request
      .get(apiUrl)
      .set('Accept', 'application/json')
      .then(res2 => {

        let stats = this.scanTx(res2.body.result, address)
        stats.price = price

        return Promise.resolve(stats)
      })
    })
    .then(result => {

      return request
      .get(apiUrl2)
      .set('Accept', 'application/json')
      .then(res3 => {
        result.balance = parseInt(res3.body.result.replace(/\d{12}$/, ''), 10) / 1e6
        return Promise.resolve(result)
      })

    })
    .catch(err => {
      console.error(err)
      Promise.reject(err)
    })

  }

  scanTweets(screenName, sig) {
    return request
    .get(`https://twitter.com/${screenName}`)
    .then(tweet => {
      if (tweet.text) {

        const $ = cheerio.load(tweet.text)

        let data
        $('div.tweet').each((index, elem) => {
          if (!data && $(elem).attr('data-screen-name') &&
          $(elem).attr('data-screen-name').toLowerCase() === screenName.toLowerCase()
          && $('p.TweetTextSize', $(elem)).text() === sig) {
            data = $(elem)
          }
        })
        if (data) {
          return Promise.resolve({
            result: {
              tweetId: data.attr('data-tweet-id')
            }
          })
        } else {
          throw(new Error('Tweet not found'))
        }
      } else {
        throw(new Error('User not found'))
      }
    })
    .catch((err) => {
      console.log(err)
      return Promise.resolve({
        result: {
          error: 'User not found'
        }
      })
    })
  }

  getUserId(screenName) {
    return request
    .get(`https://twitter.com/${screenName}`)
    .then(tweet => {
      if (tweet.text) {

        const $ = cheerio.load(tweet.text)

        let data
        $('div.tweet').each((index, elem) => {
          if (!data && $(elem).attr('data-screen-name') &&
            $(elem).attr('data-screen-name').toLowerCase() === screenName.toLowerCase()) {
              data = $(elem)
            }
        })
        if (data) {
          return Promise.resolve({
            result: {
              sn: data.attr('data-screen-name'),
              userId: data.attr('data-user-id'),
              name: data.attr('data-name'),
              avatar: $('img.js-action-profile-avatar').attr('src')
            }
          })
        } else {
          throw(new Error('User not found'))
        }
      } else {
        throw(new Error('User not found'))
      }
    })
    .catch((err) => {
      console.log(err)
      return Promise.resolve({
        result: {
          error: 'User not found'
        }
      })
    })
  }

}

module.exports = new Provider