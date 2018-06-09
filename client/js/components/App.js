const Db = require('../utils/db')

import createHistory from "history/createBrowserHistory"

const history = createHistory()

import Header from './Header'
import Main from './Main'

class App extends React.Component {

  constructor(props) {
    super(props)

    this.db = new Db(data => {
      this.setState({
        db: data
      })
    })

    this.state = {
      connected: -1,
      netId: null,
      history,
      err: null,
      loading: false,
      db: this.db.db
    }

    for (let m of [
      'getNetwork', 'watchAccounts0', 'getAccounts', 'setAppState'
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

          const get = (contract) => {
            return this.web3js.eth.contract(config.abi[contract]).at(config.address[env][contract])
          }

          this.contracts = {
            store: get('store'),
            manager: get('manager'),
            claimer: get('claimer')
          }
          this.setState({
            netId,
            connected: 1,
            env
          })
          this.watchAccounts0()
          setInterval(this.watchAccounts0, 1000)
        }

      })

    } else {
      this.state.connected = 0
    }

  }

  watchAccounts0() {
    if (this.state.wallet !== this.web3js.eth.accounts[0]) {
      this.setState({
        wallet: this.web3js.eth.accounts[0]
      })
      this.getAccounts()
    }
  }

  getAccounts() {
    if (this.state.wallet) {

      this.contracts.store.getUid(this.state.wallet, (err, result) => {

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
              this.db.put(this.state.wallet, {
                twitter: {
                  userId,
                  name,
                  username,
                  avatar
                }
              })
            }).catch(function (ex) {
              console.log('parsing failed', ex)
            })
          }
        } else {
          this.db.put(this.state.wallet, {
            twitter: null
          })
        }
      })
    }

    console.log(this.state)
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
        />
      </div>
    )
  }
}

export default App
