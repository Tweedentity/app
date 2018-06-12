import LoadingButton from './extras/LoadingButton'
import LoadingBadge from './extras/LoadingBadge'
import Basic from './Basic'
import EventWatcher from '../utils/EventWatcher'
import BigAlert from './extras/BigAlert'

const {Panel, Grid, Row, Col, Button} = ReactBootstrap


class Unset extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'startTransaction',
      'goHome'
    ]) {
      this[m] = this[m].bind(this)
    }
  }

  goHome() {
    this.db.set(this.shortWallet(), {})
    this.props.app.history.go(-2)
    this.props.app.callMethod('getAccounts')
  }

  componentDidMount() {
    if (this.web3js) {
      this.watcher = new EventWatcher(this.web3js)
      const checkState = () => {
        if (this.appState().wallet) {
          if (this.appState().hash === 'unset') {
            this.historyPush('manage-account')
          }
        } else {
          setTimeout(checkState, 100)
        }
      }
      checkState()
    }
    this.props.app.callMethod('getEthInfo')
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

      const gasPrice = gasInfo.safeLow * 1e8
      const gas = 8e4

      this.web3js.eth.getBlockNumber((err, blockNumber) => {

        let event = contracts.twitterStore.IdentityUnset
        if (typeof event === 'undefined') {
          event = contracts.twitterStore.IdentityRemoved
        }

        let startEvents = [
          {
            event,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({step: 3}, {warn: null})
              this.watcher.stop()
            },
            fromBlock: blockNumber
          }
        ]

        contracts.manager.unsetMyIdentity(
          1,
          {
            value: 0,
            gas,
            gasPrice
          }, (err, txHash) => {
            if (err) {
              this.setGlobalState({}, {
                err: 'The transaction has been denied',
                errMessage: 'If you like to unset your tweedentity, click the button above to start the transaction.',
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
                  return receipt.gasUsed > 3e4
                },
                () => {
                  this.setState({
                    step: 2
                  })
                },
                () => {
                  this.setGlobalState({}, {
                    err: 'The transaction has been reverted',
                    errMessage: 'If you like to unset your tweedentity, try again please in a moment.'
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

    if (!state.twitter || !state.twitter.userId) {
      return null
    }

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
              <h4 style={{paddingLeft: 15}}>Unset your <em>tweedentity</em></h4>
              <Panel>
                <Panel.Body>
                  <p><strong>All is ready</strong></p>
                  <p>Your are going to unset the following tweedentity:</p>
                  <p><span className="code">TwitterUserId:</span> <span
                    className="code success">{state.twitter.userId}</span><br/>
                    <span className="code">Wallet:</span> <span
                      className="code success">{as.wallet}</span>
                  </p>
                  {
                    as.err
                      ? <p><BigAlert
                        title={as.err}
                        message={as.errMessage}
                      /></p>
                      : ''
                  }
                  <p><LoadingButton
                    text={as.err ? 'Try again' : 'Unset it now!'}
                    loadingText="Starting transaction"
                    loading={as.loading}
                    cmd={() => {
                      this.startTransaction(as)
                    }}
                  /></p>

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
                        ? <span>The tweedentity has been unset.</span>
                        : <span>Waiting for the event confirm that the tweedentity has been unset.</span>
                    }</p>
                  : null
              }
              {
                state.step === 3
                  ?
                  <p><Button style={{marginTop: 6}} bsStyle="success" onClick={this.goHome}>Go home</Button>
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

export default Unset
