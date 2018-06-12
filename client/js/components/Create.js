import LoadingButton from './extras/LoadingButton'
import LoadingBadge from './extras/LoadingBadge'
import Basic from './Basic'
import EventWatcher from '../utils/EventWatcher'
import BigAlert from './extras/BigAlert'

const {Panel, Grid, Row, Col, Button} = ReactBootstrap


class Create extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'watchOracleTransactions',
      'startTransaction',
      'goToProfile',
      'checkUpgradability',
      'investigateNotUpgradability'
    ]) {
      this[m] = this[m].bind(this)
    }
    this.state = {
      upgradability: 0
    }
    this.checkUpgradability()
  }

  investigateNotUpgradability() {
    const upgradability = this.state.upgradability
    const wallet = this.appState().wallet
    const userId = this.getGlobalState('userId')

    if (upgradability === 1) {
      this.props.app.contracts.twitterStore.getAddress(this.getGlobalState('userId'), (err, result) => {
        const address = result.valueOf()
        if (address.toLowerCase() != wallet.toLowerCase()) {
          this.setState({
            upgradabilityMessage: `the userId ${userId} is currently associated with the wallet ${address}.`
          })
        }
      })
    } else {

      this.props.app.contracts.twitterStore.getAddressLastUpdate(wallet, (err, result) => {
        const addressLastUpdate = parseInt(result.valueOf(), 10)
        this.props.app.contracts.twitterStore.getUidLastUpdate(this.getGlobalState('userId'), (err, result) => {
          const uidLastUpdate = parseInt(result.valueOf(), 10)
          this.props.app.contracts.manager.minimumTimeBeforeUpdate((err, result) => {
            const minimumTimeBeforeUpdate = parseInt(result.valueOf(), 10)
            const lastUpdate = addressLastUpdate > uidLastUpdate ? addressLastUpdate : uidLastUpdate
            const now = Math.round(Date.now()/1000)
            const timeNeed = lastUpdate + minimumTimeBeforeUpdate - now
            this.setState({
              upgradabilityMessage: `you have set it recently and, for security reason, you have to wait ${timeNeed} seconds before updating it.`
            })

          })
        })
      })
    }

  }

  checkUpgradability() {
    const wallet = this.appState().wallet
    this.props.app.contracts.manager.getUpgradability(1, wallet, this.getGlobalState('userId'), (err, result) => {
      this.setState({
        upgradability: parseInt(result.valueOf(), 10)
      })
    })
  }

  goToProfile() {
    this.db.set(this.shortWallet(), {})
    this.props.app.callMethod('getAccounts')
    this.props.app.history.go(-5)
  }

  componentDidMount() {
    if (this.web3js) {
      this.watcher = new EventWatcher(this.web3js)
      const checkState = () => {
        if (this.appState().wallet) {
          if (this.appState().hash === 'create') {
            this.historyPush('signed')
          }
        } else {
          setTimeout(checkState, 100)
        }
      }
      checkState()
    }
    this.props.app.callMethod('getEthInfo')
  }

  watchOracleTransactions(network, address, startBlock, gas, callback) {
    return fetch(window.location.origin + '/api/get-txs?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.appState().netId,
        address,
        startBlock,
        gas
      })
    })
      .then((response) => response.json())
      .then(tx => {
        callback(tx)
      })
  }

  startTransaction(appState) {

    this.setGlobalState({
      step: 0
    }, {
      loading: true,
      err: null
    })

    this.watcher.stop()

    const as = this.appState()
    const ethPrice = as.price
    const gasInfo = as.gasInfo

    if (ethPrice && gasInfo) {

      let contracts = this.props.app.contracts

      const oraclizeCost = Math.round(1e7 / ethPrice)
      const gasPrice = gasInfo.safeLow * 1e8
      const gasLimitBase = 170e3 + oraclizeCost
      const gasLimit = gasLimitBase + Math.round(100 * Math.random())

      this.web3js.eth.getBlockNumber((err, blockNumber) => {

        let count = 0

        let timerId
        let watchTxs = () => {
          this.watchOracleTransactions(
            appState.netId,
            as.claimer,
            blockNumber,
            gasLimit,
            tx => {
              if (tx && tx.isError) {
                if (tx.isError === "1") {
                  this.setGlobalState({}, {err: 'The transaction from the oracle failed.', warn: null})
                  this.watcher.stop()
                }
              } else {
                timerId = setTimeout(watchTxs, 30000)
                if (count > 5) {
                  this.setGlobalState({}, {warn: 'The oracle sometimes takes time. Please wait.'})
                }
                count++
              }
            })
        }

        let callbackEvents = [
          {
            event: contracts.twitterStore.IdentitySet,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({step: 3}, {warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: contracts.claimer.VerificatioFailed,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({}, {err: 'The transaction failed.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: contracts.manager.IdentityNotUpgradable,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({}, {err: 'Identity not upgradable.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          }
        ]


        let startEvents = [
          {
            event: contracts.claimer.VerificationStarted,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({step: 2})
              this.watcher.stop()
              this.watcher.watch(callbackEvents)
              timerId = setTimeout(watchTxs, 30000)
            },
            fromBlock: blockNumber
          }
        ]

        contracts.claimer.claimOwnership(
          'twitter',
          this.getGlobalState('tweetId'),
          gasPrice,
          gasLimit,
          {
            value: gasPrice * gasLimit,
            gas: 290e3,
            gasPrice
          }, (err, txHash) => {
            if (err) {
              this.setGlobalState({}, {
                err: 'The transaction has been denied',
                loading: false
              })
            }
            else {
              this.setGlobalState({
                txHash,
                started: true,
                step: 1
              }, {
                loading: false
              })
              this.watcher.watch(startEvents)
              this.watcher.waitFor(
                txHash,
                (receipt) => {
                  return receipt.gasUsed > 16e4
                },
                null,
                () => {
                  this.setGlobalState({}, {
                    err: 'The transaction has been reverted'
                  })
                }
              )
            }
          })
      })
    } else {
      this.props.getEthInfo()
      this.setGlobalState({}, {
        err: 'No ether and gas info found.',
        errMessage: 'Reloading them. Try again in a moment.',
        loading: false
      })
    }
  }

  formatFloat(f, d) {
    f = f.toString().split('.')
    return f[0] + (f[1] ? '.' + f[1].substring(0, d) : '')
  }

  render() {

    const as = this.appState()

    const state = as.data[this.shortWallet()]

    const price = parseFloat(as.price, 10)
    const gasPrice = as.gasInfo.safeLow * 1e8
    const gasLimit = 185e3

    const cost = this.formatFloat(gasPrice * gasLimit / 1e18, 4)
    const cost$ = this.formatFloat(price * gasPrice * gasLimit / 1e18, 1)

    if (!state.started) {

      const price = parseFloat(as.price, 10)
      const gasPrice = as.gasInfo.safeLow * 1e8
      const gasLimit = 185e3

      const cost = this.formatFloat(gasPrice * gasLimit / 1e18, 4)
      const cost$ = this.formatFloat(price * gasPrice * gasLimit / 1e18, 1)

      const params = {
        value: gasPrice * gasLimit,
        gas: 255e3,
      }

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{paddingLeft: 15}}>Create your <em>tweedentity</em></h4>
              <Panel>
                <Panel.Body>
                  <p><strong>All is ready</strong></p>
                  <p>In the next step you will send {cost} ether (${cost$}) to the Tweedentity Smart Contract to
                    cover the gas necessary to create your <em>tweedentity</em> in the Ethereum Blockchain. Be
                    adviced, after than you have created it, your Twitter user-id and your wallet will be publicly
                    associated.</p>
                  <p><span className="code">TwitterUserId:</span> <span
                    className="code success">{state.userId}</span><br/>
                    <span className="code">Wallet:</span> <span
                      className="code success">{as.wallet}</span>
                  </p>
                  {
                    as.err
                      ? <BigAlert
                        title={as.err}
                        message={as.errMessage}
                      />
                      : ''
                  }
                  {this.state.upgradability === 0 ?
                    <LoadingButton
                      text={as.err ? 'Try again' : 'Create it now!'}
                      loadingText="Starting transaction"
                      loading={as.loading}
                      cmd={() => {
                        this.startTransaction(as)
                      }}
                    /> :

                    this.state.upgradabilityMessage
                    ? <BigAlert
                        bsStyle="warning"
                        message={`The tweedentity is not upgradable because ${this.state.upgradabilityMessage}`}
                      />
                    : <BigAlert
                      bsStyle="warning"
                      title="Whoops"
                      message="The tweedentity looks not upgradable"
                      link={this.investigateNotUpgradability}
                      linkMessage="Find why"
                    />}

                </Panel.Body>
              </Panel>
            </Col>
          </Row>
        </Grid>
      )
    } else {

      let transaction = <a
        href={'https://' + (as.netId === '3' ? 'ropsten.' : '') + 'etherscan.io/tx/' + state.txHash}
        target="_blank">transaction</a>

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{paddingLeft: 15}}>Verification started
              </h4>
              <p><span className="mr12">
                    <LoadingBadge
                      text="1"
                      loading={false}
                    />
                  </span>
                The transaction has been requested.</p>
              <p><span className="mr12">
                    <LoadingBadge
                      text="2"
                      loading={state.step < 2 && !as.err}
                    />
                  </span>
                {
                  state.step === 2
                    ? <span>The {transaction} has been successfully confirmed.</span>
                    : state.step === 1
                    ? <span>The {transaction} has been included in a block. Waiting for confirmations.</span>
                    : <span>Waiting for the transaction to be included in a block.</span>

                }
              </p>
              {
                state.step > 1
                  ? <p><span className="mr12">
                      <LoadingBadge
                        text="3"
                        loading={state.step < 3 && !as.err}
                      />
                      </span>
                    {
                      state.step === 3
                        ? <span>The oracle has confirmed the ownership.</span>
                        : <span>Waiting for the oracle which is verifying the ownership.</span>
                    }</p>
                  : null
              }
              {
                state.step === 3
                  ?
                  <p><Button style={{marginTop: 6}} bsStyle="success" onClick={this.goToProfile}>Go to your
                    profile</Button>
                  </p>
                  : ''
              }
              {
                as.err
                  ?
                  <BigAlert
                    title="Whoops"
                    message={as.err}
                    link={() => {
                      this.setGlobalState({}, {err: null})
                      this.props.app.callMethod('historyBack')
                    }}
                    linkMessage="Go back"
                  />
                  : as.warn
                  ? <Alert bsStyle="warning">{as.warn}</Alert>
                  : ''
              }
            </Col>
          </Row>
        </Grid>
      )
    }

  }
}

export default Create
