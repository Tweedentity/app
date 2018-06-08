const ls = require('local-storage')
const config = require('../config')

let web3js

import Topbar from './Topbar'
import AppCore from './AppCore'
import NetworkStatus from './NetworkStatus'

const {Grid, Jumbotron} = ReactBootstrap

class DApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: -1,
      netId: null
    }

    this.getTwitterUserId = this.getTwitterUserId.bind(this)
    this.getNetwork = this.getNetwork.bind(this)
    this.watchAccounts0 = this.watchAccounts0.bind(this)

    if (typeof web3 !== 'undefined') {
      console.log('Using web3 detected from external source like Metamask')

      web3js = window.web3js = this.state.web3js = new Web3(web3.currentProvider)
      web3js.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined")

      this.getNetwork()

    } else {

      // web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
      //
      // this.getNetwork()
      this.state.connected = 0

    }
  }

  getNetwork(id) {
    web3js.version.getNetwork((err, netId) => {

      const storeContract = web3js.eth.contract(config.abi.store)
      const managerContract = web3js.eth.contract(config.abi.manager)
      const verifierContract = web3js.eth.contract(config.abi.claimer)

      let env

      switch (netId) {
        case '1':
          env = 'main'
          break
        case '3':
          env = 'ropsten'
          break
        case '908077':
          env = 'private'
          break
        default:
          this.setState({
            netId: '0',
            connected: 0
          })
      }

      if (env) {
        this.setState({
          store: storeContract.at(config.address[env].store),
          manager: managerContract.at(config.address[env].manager),
          claimer: verifierContract.at(config.address[env].claimer),
          netId,
          connected: 1
        })
      }


      if (this.state.netId !== '0') {

        this.watchAccounts0()
        setInterval(this.watchAccounts0, 1000)
      }
    })
  }


  watchAccounts0() {
    if (this.state.address != web3js.eth.accounts[0]) {
      this.setState({
        address: web3js.eth.accounts[0]
      })
      this.getTwitterUserId()
    }
  }

  getTwitterUserId() {
    if (this.state.address) {
      this.state.store.getUid(this.state.address, (err, result) => {

        if (result !== '') {

          let twitterUserId = typeof result === 'string' ? result : result.valueOf()
          if (twitterUserId !== '') {
            return fetch(window.location.origin + '/api/twitter-data?r=' + Math.random(), {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: twitterUserId
              })
            }).then(response => {
              return response.json()
            }).then(json => {
              const {name, userName, avatar} = json.result
              this.setState({
                twitterUserId,
                name,
                userName,
                avatar
              })
            }).catch(function (ex) {
              console.log('parsing failed', ex)
            })
          }
        } else {
          this.setState({
            twitterUserId: null,
            name: null,
            userName: null,
            avatar: null
          })
        }
      })
    }
  }

  render() {

    return (
        <div>
          <NetworkStatus parentState={this.state}/>
          <Topbar parentState={this.state}/>
          <Grid>
            <AppCore parentState={this.state} getTwitterUserId={this.getTwitterUserId}/>
          </Grid>
        </div>
    )
  }
}

export default DApp
