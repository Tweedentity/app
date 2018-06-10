import RedAlert from './RedAlert'
import LoadingButton from './LoadingButton'
import LoadingBadge from './LoadingBadge'

const sigUtil = require('eth-sig-util')
const EventWatcher = require('../utils/EventWatcher')
const config = require('../config')

const {Panel, Alert, Button, Grid, Row, Col, FormGroup, ControlLabel, FormControl, InputGroup, HelpBlock} = ReactBootstrap


class Main extends React.Component {
  constructor(props) {
    super(props)

    for (let m of 'getStats getEtherscan getTwitterScreenName handleChange getValidationState getUserId signString findTweet startTransaction setGlobalState getGlobalState goToProfile getGasInfo watchOracleTransactions shortWallet'.split(' ')) {
      this[m] = this[m].bind(this)
    }
  }

  getGlobalState(prop) {
    const as = this.props.appState
    const shortWallet = this.shortWallet()
    if (as.wallet) {
      return as.data[shortWallet][prop]
    }
  }

  setGlobalState(pars, states = {}) {
    if (this.props.appState.wallet) {
      this.props.db.put(this.shortWallet(), pars)
      this.props.setAppState(states)
    }
  }

  componentDidMount() {
    if (this.props.web3js) {
      this.watcher = new EventWatcher(this.props.web3js)
      const checkState = () => {
        if (this.props.appState.wallet) {
          if (this.getGlobalState('step') === 5) {
            this.setGlobalState({step: 4})
          }
        } else {
          setTimeout(checkState, 100)
        }
      }
      checkState()
    }
    this.getGasInfo()
  }

  shortWallet() {
    return this.props.appState.wallet.substring(0, 6)
  }

  goToProfile() {
    this.props.db.clear(this.shortWallet(), {step: -1})
    this.props.getAccounts()
  }

  findTweet() {
    this.setGlobalState({}, {
      loading: true,
      err: null
    })
    return fetch(window.location.origin + '/api/scan-tweets?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenName: this.getGlobalState('screenName'),
        sig: this.getGlobalState('tweet')
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error) {
          throw new Error(responseJson.error)
        }
        const r = responseJson.result

        if (r.tweetId) {
          this.setGlobalState({
            tweetId: r.tweetId,
            step: 4,
            gasInfo: responseJson.gasInfo
          }, {
            loading: false
          })
        } else {
          throw(new Error('Not found'))
        }
      })
      .catch(err => {
        this.setGlobalState({}, {
          err: err.message,
          loading: false
        })
      })
  }

  handleFocus(event) {
    event.target.select()
  }

  signString(from, sigStr) {

    this.setGlobalState({}, {
      loading: true,
      err: null
    })

    const msgParams = [
      {
        type: 'string',
        name: 'tweedentity',
        value: sigStr
      }
    ]

    this.props.web3js.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [msgParams, from],
      from: from,
    }, (err, result) => {
      if (err || result.error) {
        this.setGlobalState({}, {err: 'Message signature canceled', loading: false})
      } else {

        const recovered = sigUtil.recoverTypedSignature({
          data: msgParams,
          sig: result.result
        })

        if (recovered === from) {
          let tweet = `tweedentity(${from.substring(0, 6).toLowerCase()},twitter/${this.getGlobalState('userId')},${result.result},3,web3;1)`
          this.setGlobalState({
            tweet,
            sig: result.result,
            step: 3
          }, {
            loading: false
          })
        } else {
          this.setGlobalState({}, {err: 'Failed to verify signer', loading: false})
        }
      }
    })
  }

  getUserId() {
    this.setGlobalState({}, {
      loading: true
    })
    return fetch(window.location.origin + '/api/twitter-user-id?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenName: this.getGlobalState('screenName')
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        const r = responseJson.result

        if (r.sn) {
          this.setGlobalState({
            screenName: r.sn,
            userId: r.userId,
            name: r.name,
            avatar: r.avatar,
            step: 2
          }, {
            loading: false
          })
        } else {
          throw(new Error('Not found'))
        }
      })
      .catch(err => {
        this.setGlobalState({}, {
          err: 'User not found',
          loading: false
        })
      })
  }

  getValidationState() {
    if (/^[a-zA-Z0-9_]{1,15}$/.test(this.getGlobalState('screenName'))) {
      return 'success'
    } else if (this.getGlobalState('screenName').length > 0) {
      return 'error'
    }
    return null
  }

  handleChange(e) {
    this.setGlobalState({screenName: e.target.value}, {err: null})
  }

  getStats(state) {

    this.setGlobalState({
      step: -1
    }, {
      loading: true
    })

    return fetch(window.location.origin + '/api/wallet-stats?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: state.wallet
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setGlobalState({
          stats: responseJson,
          step: 0
        }, {
          loading: false
        })
      })
  }

  getColorClass(val, lim) {
    return val >= (lim || 4) ? 'danger' : val > 1 ? 'warning' : 'success'
  }

  getEtherscan(address, netId) {
    return `https://${netId === '3' ? 'ropsten.' : ''}etherscan.io/address/${address}`
  }

  getTwitterScreenName() {
    this.setGlobalState({step: 1})
    this.getGasInfo()
  }

  getGasInfo() {
    return fetch(window.location.origin + '/api/gas-info?r=' + Math.random(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then((response) => response.json())
      .then((gasInfo) => {
        if (gasInfo && gasInfo.safeLow) {
          this.setGlobalState({}, {
            gasInfo,
            noGas: null
          })
        }
      })
  }

  formatStats(stats, netId, address) {
    return (
      <span>
      <span className="code success">Balance: {stats.balance} ether</span><br/>
      <span className={'code ' + this.getColorClass(stats.txs)}>{stats.txs} transactions <a
        href={this.getEtherscan(address, netId)} target="_blank"><i className="fa fa-link"></i></a></span><br/>
      <span
        className={'code ' + this.getColorClass(stats.valueFrom)}>{stats.valueFrom} ether received from {stats.froms} addresses</span><br/>
      <span
        className={'code ' + this.getColorClass(stats.tos)}>{stats.valueTo} ether sent to {stats.tos} addresses</span><br/>
      <span className={'code ' + this.getColorClass(stats.deployes, 1)}>{stats.deployes} contracts deployed</span><br/>
      <span className={'code ' + this.getColorClass(stats.execs)}>{stats.execs} contract functions executed</span>
    </span>
    )
  }

  watchOracleTransactions(network, address, startBlock, gas, callback) {
    return fetch(window.location.origin + '/api/get-txs?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.props.appState.netId,
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
      subStep: 0
    }, {
      loading: true,
      err: null
    })

    this.watcher.stop()

    const as = this.props.appState
    const ethPrice = as.price
    const gasInfo = as.gasInfo

    if (ethPrice && gasInfo) {

      const oraclizeCost = Math.round(1e7 / ethPrice)
      const gasPrice = gasInfo.safeLow * 1e8
      const gasLimitBase = 170e3 + oraclizeCost
      const gasLimit = gasLimitBase + Math.round(100 * Math.random())

      this.props.web3js.eth.getBlockNumber((err, blockNumber) => {

        let count = 0

        let timerId
        let watchTxs = () => {
          this.watchOracleTransactions(
            appState.netId,
            config.address[this.props.appState.env].claimer,
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
            event: this.props.contracts.twitterStore.IdentitySet,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({subStep: 3}, {warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: this.props.contracts.claimer.VerificatioFailed,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({}, {err: 'The transaction failed.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: this.props.contracts.manager.IdentityNotUpgradable,
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
            event: this.props.contracts.claimer.VerificationStarted,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({subStep: 2})
              this.watcher.stop()
              this.watcher.watch(callbackEvents)
              timerId = setTimeout(watchTxs, 30000)
            },
            fromBlock: blockNumber
          }
        ]

        this.props.contracts.claimer.claimOwnership(
          'twitter',
          this.getGlobalState('tweetId'),
          gasPrice,
          gasLimit,
          {
            value: gasPrice * gasLimit,
            gas: 300e3,
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
                step: 5,
                subStep: 1
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

    let welcomeMessage = ''

    const as = this.props.appState
    const wallet = as.wallet

    if (as.connected !== -1) {

      const netId = as.netId

      if (netId == null) {

        welcomeMessage = <RedAlert
          title="Web3js not found"
          message="You must either install Metamask or use a browser compatible with Ethereum like Mist, Parity or Brave."
          link="https://metamask.io"
          linkMessage="Get Metamask"
        />

      } else if (netId === '0') {

        welcomeMessage =
          <RedAlert
            title="Unsupported network."
            message="This alpha version supports only Ropsten."
          />

      } else if (netId === '1') {

        // will be remove in the final version
        welcomeMessage =
          <RedAlert
            title="Unsupported network."
            message="This alpha version supports only Ropsten."
          />

      } else if (as.wallet) {

        const state = as.data[this.shortWallet()] || {step: -1}

        if (state.twitter) {

          //welcomeMessage = `Welcome back, ${as.name.split(' ')[0]}`

          return (
            <Grid>
              <Row>
                <Col md={12}>
                  <h4>Welcome back!</h4>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <p><img style={{borderRadius: 50}} src={state.twitter.avatar} width="73" height="73"/></p>
                  <p><b className="tname">{state.twitter.name}</b><br/>
                    <a href={'https://twitter.com/' + state.twitter.username}
                       target="_blank">@{state.twitter.username}</a>
                  </p>
                  <p>Twitter user-id:<br/><code>{state.twitter.userId}</code></p>
                  <p>Address:<br/><code>{wallet}</code></p>
                </Col>
              </Row>
            </Grid>
          )


        } else if (as.wallet) {


          if (state.step === -1) {

            if (as.ready) {
              return (
                <Grid>
                  <Row>
                    <Col md={12}>
                      <h4 style={{paddingLeft: 15}}>Welcome</h4>
                      <Panel>
                        <Panel.Body>

                          <p>
                            Ready to set your tweedentity?
                          </p>
                          <p>
                            <LoadingButton
                              text="Yes, please"
                              loadingText="Analyzing wallet"
                              loading={as.loading}
                              cmd={() => {
                                this.getStats(as)
                              }}
                            />
                          </p>

                        </Panel.Body>
                      </Panel>
                    </Col>
                  </Row>
                </Grid>
              )
            } else {

              return (
                <Grid>
                  <Row>
                    <Col md={12}>
                      <h4 style={{paddingLeft: 15}}>Welcome</h4>

                      <Alert bsStyle="warning">
                        <strong>Holy guacamole!</strong> The contracts are under maintenance. Come back later, please.
                      </Alert>
                    </Col>
                  </Row>
                </Grid>
              )
            }

          }

          if (state.step === 0) {

            const nextStep = <strong>Your wallet looks good.</strong>
            const notGood = <strong>Whoops, you did many transactions with this wallet.</strong>
            const veryBad = <strong>Be careful, you did a lot of transactions with this wallet.</strong>

            const weSuggest = <p>For your privacy, we suggest you use a wallet with almost no transactions to /from any
              other wallet. After that you have set your tweedentity, anyone could see all your transactions. The best
              practice is to create a new wallet and send a minimum amount of ether to it using an exchange like <a
                href="https://https://shapeshift.io/" target="_blank">ShapeShift</a> or a mixer like <a
                href="https://www.eth-mixer.com/" target="_blank">ETH-Mixer</a>.</p>

            const moreInfo = ''
            // <p>Read more about privacy issues and how to solve them <a href="#" target="_blank">here</a>.</p>


            const mainStats = state.stats.main
            const ropstenStats = state.stats.ropsten

            const score = mainStats.txs + mainStats.deployes + mainStats.execs
            const cls = score < 3 ? 'primary' : score < 5 ? 'warning' : 'danger'

            const minimum = '0.' + (1 / parseFloat(as.price, 10)).toString().split('.')[1].substring(0, 4)

            const lowBalance = <Alert bsStyle="danger">Balance too low. You need {minimum} ether to activate your
              tweedentity.</Alert>

            return (
              <Grid>
                <Row>
                  <Col md={12}>
                    <h4 style={{paddingLeft: 15}}>Wallet Statistics</h4>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Main Network</strong></p>
                        <p>{this.formatStats(mainStats, '1', as.wallet)}</p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={6}>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Ropsten Network</strong></p>
                        <p>{this.formatStats(ropstenStats, '3', as.wallet)}</p>
                      </Panel.Body></Panel>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {as.netId === '1' && mainStats.balance < minimum ? lowBalance : ''}
                    <Alert bsStyle={score < 3 ? 'info' : score < 5 ? 'warning' : 'danger'}>
                      <p>{
                        score < 3
                          ? nextStep
                          : score < 5
                          ? notGood
                          : veryBad
                      }</p>
                      {weSuggest}
                      {moreInfo}
                    </Alert>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Button bsStyle={score < 3 ? 'info' : score < 5 ? 'warning' : 'danger'}
                            onClick={this.getTwitterScreenName}>
                      {score < 3 ? 'Use this wallet' : 'Use this wallet, anyway. I know what I am doing'}
                    </Button>
                  </Col>
                </Row>
              </Grid>
            )

          } else if (state.step === 1) {
            return (
              <Grid>
                <Row>
                  <Col md={12}>
                    <h4 style={{paddingLeft: 15}}>Twitter Username</h4>
                    <Panel>
                      <Panel.Body>

                        <form>
                          <FormGroup
                            controlId="formBasicText"
                            validationState={as.err ? 'error' : this.getValidationState()}
                          >
                            <ControlLabel>Which is your Twitter Username?</ControlLabel>

                            <InputGroup>
                              <InputGroup.Addon>@</InputGroup.Addon>
                              <FormControl
                                type="text"
                                value={state.value}
                                placeholder="Type username"
                                onChange={this.handleChange}
                              />
                              <FormControl.Feedback/>
                            </InputGroup>
                            {
                              as.err
                                ? <HelpBlock>{as.err}</HelpBlock>
                                : null
                            }
                          </FormGroup>
                        </form>
                        <LoadingButton
                          text="Look up for Twitter user-id"
                          loadingText="Looking up"
                          loading={as.loading}
                          cmd={this.getUserId}
                          disabled={this.getValidationState() !== 'success'}
                        />
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </Grid>
            )
          }

          else if (state.step === 2) {

            const sigStr = `twitter/${state.userId}`

            return (
              <Grid>
                <Row>
                  <Col md={12}>
                    <h4 style={{paddingLeft: 15}}>Your Twitter data</h4>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Panel>
                      <Panel.Body>
                        <p><img style={{borderRadius: 50}} src={state.avatar} width="73" height="73"/></p>
                        <p><a href={'https://twitter.com/' + state.screenName}
                              target="_blank">@{state.screenName}</a><br/>
                          {state.name}</p>
                        <p>Twitter user-id:<br/><code>{state.userId}</code></p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={8}>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Create your signed tweet</strong></p>
                        <p>To verify that you own this Twitter account, you must publish a special tweet containing
                          the
                          cryptographic signature of the following string, using your current Ethereum address:</p>
                        <p><code>{sigStr}</code></p>
                        {
                          as.err
                            ? <RedAlert
                              message={as.err}
                            />
                            : ''
                        }
                        <p>
                          <LoadingButton
                            text="Sign it now"
                            loadingText="Waiting for signature"
                            loading={as.loading}
                            cmd={() => {
                              this.signString(as.wallet, sigStr)
                            }}
                            disabled={this.getValidationState() !== 'success'}
                          />
                        </p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </Grid>
            )

          } else if (state.step === 3) {
            return (
              <Grid>
                <Row>
                  <Col md={12}>
                    <h4 style={{paddingLeft: 15}}>Tweet and verify</h4>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Signature ready</strong></p>
                        <p>Please, copy the following text and tweet it, or click the button to open Twitter in a new
                          tab,
                          ready for the tweet. After the verification is completed, you can cancel it, if you like.</p>
                        <form>
                          <FormGroup
                            controlId="someText"
                          >
                            <FormControl
                              type="text"
                              value={state.tweet}
                              readOnly={true}
                              onFocus={this.handleFocus}
                            />
                            <FormControl.Feedback/>
                          </FormGroup>
                        </form>
                        {
                          as.err === 'User not found'
                            ? <RedAlert
                              title="Whoops"
                              message="The Twitter user has not been found. Very weird :-("
                              link={() => {
                                this.setGlobalState({step: 1}, {err: null})
                              }}
                              linkMessage="Input the username again"
                            />
                            : as.err === 'Wrong tweet'
                            ? <RedAlert
                              title="Whoops"
                              message="No tweet with a valid signature was found."
                              link={() => {
                                this.setGlobalState({step: 1}, {err: null})
                              }}
                              linkMessage="Input the username again"
                            />
                            : as.err === 'Wrong signature'
                              ? <RedAlert
                                title="Whoops"
                                message="A tweet was found but with a wrong signature."
                                link={() => {
                                  this.setGlobalState({step: 1}, {err: null})
                                }}
                                linkMessage="Input the username again"
                              />
                              : as.err === 'Wrong user'
                                ? <RedAlert
                                  title="Whoops"
                                  message="A tweet with the right signature was found, but it was posted by someone else."
                                  link={() => {
                                    this.setGlobalState({step: 1}, {err: null})
                                  }}
                                  linkMessage="Input the username again"
                                />
                                : <p><a
                                  href={'https://twitter.com/intent/tweet?text=' + escape(state.tweet) + '&source=webclient'}
                                  target="_blank">
                                  <Button bsStyle="primary">
                                    Open Twitter now
                                  </Button></a>
                                  <span className="spacer"></span>
                                  <LoadingButton
                                    text="I tweeted it, continue"
                                    loadingText="Finding the tweet"
                                    loading={as.loading}
                                    cmd={this.findTweet}
                                  />
                                </p>

                        }

                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </Grid>
            )
          } else if (state.step === 4) {

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
                            ? <RedAlert
                              title={as.err}
                              message={as.errMessage}
                            />
                            : ''
                        }
                        <LoadingButton
                          text={as.err ? 'Try again' : 'Create it now!'}
                          loadingText="Starting transaction"
                          loading={as.loading}
                          cmd={() => {
                            this.startTransaction(as)
                          }}
                        />
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </Grid>
            )
          } else if (state.step === 5) {

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
                      loading={state.subStep < 2 && !as.err}
                    />
                  </span>
                      {
                        state.subStep === 2
                          ? <span>The {transaction} has been successfully confirmed.</span>
                          : state.subStep === 1
                          ? <span>The {transaction} has been included in a block. Waiting for confirmations.</span>
                          : <span>Waiting for the transaction to be included in a block.</span>

                      }
                    </p>
                    {
                      state.subStep > 1
                        ? <p><span className="mr12">
                      <LoadingBadge
                        text="3"
                        loading={state.subStep < 3 && !as.err}
                      />
                      </span>
                          {
                            state.subStep === 3
                              ? <span>The oracle has confirmed the ownership.</span>
                              : <span>Waiting for the oracle which is verifying the ownership.</span>
                          }</p>
                        : null
                    }
                    {
                      state.subStep === 3
                        ?
                        <p><Button style={{marginTop: 6}} bsStyle="success" onClick={this.goToProfile}>Go to your
                          profile</Button>
                        </p>
                        : ''
                    }
                    {
                      as.err
                        ?
                        <RedAlert
                          title="Whoops"
                          message={as.err}
                          link={() => {
                            this.setGlobalState({step: 4}, {err: null})
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
        } else {
          welcomeMessage =
            <RedAlert
              title="Wallet not found."
              message="Please, activate your wallet and refresh the page."
            />
        }
      }
    }
    return (
      <Grid>
        <Row>
          <Col md={12}>
            {welcomeMessage}
          </Col>
        </Row>
      </Grid>
    )

  }
}

export default Main
