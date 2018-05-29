const ls = require('local-storage')
const config = require('../config')
let web3js

import Topbar from './Topbar'
import Verifier from './Verifier'
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

    if (typeof web3 !== 'undefined') {
      console.log('Using web3 detected from external source like Metamask')

      web3js = new Web3(web3.currentProvider)

      this.getNetwork()

    } else {

      this.state.connected = 0

    }
  }

  getNetwork() {
    web3js.version.getNetwork((err, netId) => {

      const ManagerContract = web3js.eth.contract(config.abi.manager)
      const StoreContract = web3js.eth.contract(config.abi.store)

      console.log(netId)

      switch (netId) {
        case '1':
          this.setState({
            ManagerInstance: ManagerContract.at(config.address.main.manager),
            StoreInstance: StoreContract.at(config.address.main.store),
            netId,
            connected: 1
          })
          break
        case '3':
          this.setState({
            ManagerInstance: ManagerContract.at(config.address.ropsten.manager),
            StoreInstance: StoreContract.at(config.address.ropsten.store),
            netId,
            connected: 1
          })
          break
        default:
          this.setState({
            netId: '0',
            connected: 0
          })
      }

      if (this.state.netId !== '0') {

        this.setState({
          defaultAccount: web3js.eth.defaultAccount
        })
        this.getTwitterUserId()
      }
    })
  }


  componentDidMount() {

  }

  getTwitterUserId() {
    if (this.state.defaultAccount) {
      this.state.StoreInstance.getUid(this.state.defaultAccount, (err, result) => {
        if (result !== null) {
          let twitterUserId = result.valueOf()
          if (twitterUserId !== '') {
            this.setState({
              twitterUserId
            })
          }
        }
      })
    }
  }


  render() {

    return (
    <div>
      <NetworkStatus parentState={this.state} />
      <Topbar parentState={this.state}/>
      <Grid>
          <Verifier parentState={this.state} web3js={web3js}/>
      </Grid>
    </div>
    )
  }
}

export default DApp
