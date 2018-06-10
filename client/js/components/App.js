import createHistory from "history/createBrowserHistory"

const history = window.History = createHistory()
const config = require('../config')

const Db = require('../utils/Db')

import Header from './Header'
import Main from './Main'

class App extends React.Component {

  constructor(props) {
    super(props)

    this.db = new Db(data => {
      this.setState({
        data
      })
    })

    // this.db.reset()

    this.state = {
      connected: -1,
      netId: null,
      err: null,
      loading: false,
      data: this.db.data,
      ready: false
    }

    for (let m of [
      'getNetwork', 'watchAccounts0', 'getAccounts', 'setAppState', 'getEthInfo', 'getContracts'
    ]) {
      this[m] = this[m].bind(this)
    }

    history.listen(location => {
      this.setState({
        hash: location.hash
      })
    })

    history.push('#/welcome')
    this.getNetwork()

  }

  getNetwork() {

    if (typeof web3 !== 'undefined') {
      console.log('Using web3 detected from external source like Metamask')

      this.web3js = new Web3(web3.currentProvider)
      this.web3js.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined")

      this.web3js.version.getNetwork((err, netId) => {

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

          const registry = this.web3js.eth.contract(config.registry.abi).at(config.registry.address[env])
          const twitterStore = this.web3js.eth.contract(config.twitterStore.abi).at(config.twitterStore.address[env])

          this.contracts = {
            registry,
            twitterStore
          }

          this.setState({
            netId,
            connected: 1,
            env
          })
          this.watchAccounts0()
          setInterval(this.watchAccounts0, 1000)
          this.getEthInfo()
          this.getContracts()
        }

      })

    } else {
      this.state.connected = 0
    }

  }

  getContracts() {

    const registry = this.contracts.registry

    let manager
    let claimer

    registry.isReady((err, ready) => {

      if (ready) {
        registry.manager((err, result) => {
          manager = result
          registry.claimer((err, result) => {
            claimer = result

            return fetch(window.location.origin + '/api/contract-abi?r=' + Math.random(), {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                network: this.state.netId,
                addresses: [
                  manager,
                  claimer
                ]
              }),
            })
              .then((response) => response.json())
              .then((responseJson) => {
                for (let j of responseJson) {
                  let key = j[0] == manager ? 'manager' : 'claimer'
                  this.contracts[key] = this.web3js.eth.contract(j[1]).at(j[0])
                }
                this.setState({
                  ready: true
                })

              })
              .catch(err => {
                console.log(err)
                // this.setGlobalState({}, {
                //   err: 'User not found',
                //   loading: false
                // })
              })
          })
        })

      }

    })

  }

  getEthInfo() {
    return fetch(window.location.origin + '/api/eth-info?r=' + Math.random(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(responseJson)
      })
      .catch(err => {
        this.setState({
          noEthInfo: true
        })
      })
  }

  watchAccounts0() {
    const wallet = this.web3js.eth.accounts[0]
    if (this.state.wallet !== wallet) {
      this.setState({
        wallet
      })
      let shortWallet = wallet.substring(0, 6)
      if (!this.state.data[shortWallet] || typeof this.state.data[shortWallet].step === 'undefined') {
        this.db.put(shortWallet, {step: -1})
      }
      this.getAccounts()
    }
  }

  getAccounts() {

    if (this.state.wallet) {


      let shortWallet = this.state.wallet.substring(0, 6)
      this.contracts.twitterStore.getUid(this.state.wallet, (err, result) => {

        if (result !== '') {

          let userId = typeof result === 'string' ? result : result.valueOf()
          if (userId !== '') {
            return fetch(window.location.origin + '/api/twitter-data?r=' + Math.random(), {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId
              })
            }).then(response => {
              return response.json()
            }).then(json => {
              const {name, username, avatar} = json.result
              this.db.put(shortWallet, {
                twitter: {
                  userId,
                  name,
                  username,
                  avatar
                },
                step: -1
              })
            }).catch(function (ex) {
              console.log('parsing failed', ex)
            })
          }
        } else {
          this.db.put(shortWallet, {
            twitter: null
          })
        }
      })
    }
  }

  setAppState(states) {
    this.setState(states)
  }

  render() {

    return (
      <div>
        <Header
          appState={this.state}
        />
        <Main
          appState={this.state}
          getAccounts={this.getAccounts}
          db={this.db}
          setAppState={this.setAppState}
          web3js={this.web3js}
          contracts={this.contracts}
          getEthInfo={this.getEthInfo}
        />
      </div>
    )
  }
}

export default App
