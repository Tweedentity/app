const ls = require('local-storage')
import RedAlert from './RedAlert'
import LoadingButton from './LoadingButton'
import LoadingBadge from './LoadingBadge'

const sigUtil = require('eth-sig-util')
const EventWatcher = require('../utils/EventWatcher')
const config = require('../config')

const {Panel, Alert, Button, Row, Col, FormGroup, ControlLabel, FormControl, InputGroup, HelpBlock} = ReactBootstrap


class AppCore extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      addressStates: {},
      err: null,
      loading: false
    }
    for (let m of 'getStats getEtherscan getTwitterScreenName handleChange getValidationState getUserId signString findTweet startTransaction setAddressState getState goToProfile getGasInfo watchOracleTransactions'.split(' ')) {
      this[m] = this[m].bind(this)
    }
  }

  componentDidMount() {
    if (this.props.parentState.web3js) {
      this.watcher = new EventWatcher(this.props.parentState.web3js)
    }
    this.getGasInfo()
  }

  goToProfile() {
    this.resetAddressState()
    this.props.getTwitterUserId()
  }

  setAddressState(pars, states = {}) {
    let address = this.props.parentState.address
    let addressStates = this.state.addressStates
    if (!addressStates[address]) {
      addressStates[address] = {}
    }
    for (let p in pars) {
      addressStates[address][p] = pars[p]
    }
    states.addressStates = addressStates
    this.setState(states)
  }

  getAddressState(prop) {
    let address = this.props.parentState.address
    let addressStates = this.state.addressStates
    if (addressStates[address]) {
      return addressStates[address][prop]
    }
  }

  resetAddressState() {
    let address = this.props.parentState.address
    let addressStates = this.state.addressStates
    if (addressStates[address]) {
      addressStates[address] = null
      this.setState({
        addressStates
      })
    }
  }

  findTweet() {
    this.setAddressState({}, {
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
        screenName: this.getState('screenName'),
        sig: this.getState('tweet')
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error) {
          throw new Error(responseJson.error)
        }
        const r = responseJson.result

        if (r.tweetId) {
          this.setAddressState({
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
        this.setAddressState({}, {
          err: err.message,
          loading: false
        })
      })
  }

  handleFocus(event) {
    event.target.select()
  }

  signString(web3js, from, sigStr) {

    this.setAddressState({}, {
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

    web3js.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [msgParams, from],
      from: from,
    }, (err, result) => {
      if (err || result.error) {
        this.setState({err: 'You denied the message signature', loading: false})
      } else {

        const recovered = sigUtil.recoverTypedSignature({
          data: msgParams,
          sig: result.result
        })

        if (recovered === from) {
          let tweet = `tweedentity(${from.substring(0, 6).toLowerCase()},twitter/${this.getState('userId')},${result.result},3,web3;1)`
          this.setAddressState({
            tweet,
            sig: result.result,
            step: 3
          }, {
            loading: false
          })
        } else {
          this.setState({err: 'Failed to verify signer', loading: false})
        }
      }
    })

  }

  getState(prop) {
    return this.state.addressStates[this.props.parentState.address][prop]
  }

  getUserId() {
    this.setAddressState({}, {
      loading: true
    })
    return fetch(window.location.origin + '/api/twitter-user-id?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenName: this.getState('screenName')
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        const r = responseJson.result

        if (r.sn) {
          this.setAddressState({
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
        this.setAddressState({}, {
          err: 'User not found',
          loading: false
        })
      })
  }

  getValidationState() {
    if (/^[a-zA-Z0-9_]{1,15}$/.test(this.getState('screenName'))) {
      return 'success'
    } else if (this.getState('screenName').length > 0) {
      return 'error'
    }
    return null
  }

  handleChange(e) {
    this.setAddressState({screenName: e.target.value}, {err: null})
  }

  getStats(state) {

    this.setAddressState({
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
        network: state.netId,
        address: state.address
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        let price = responseJson.result.price
        delete responseJson.result.price
        this.setAddressState({
          stats: responseJson.result,
          step: 0
        }, {
          loading: false,
          price
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
    this.setAddressState({step: 1})
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
          this.setState({
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
        network: this.props.parentState.netId,
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


  startTransaction(parentState) {

    this.setAddressState({
      subStep: 0
    }, {
      loading: true,
      err: null
    })

    this.watcher.stop()

    const ethPrice = this.state.price
    const oraclizeCost = Math.round(1e7 / ethPrice)

    if (this.state.gasInfo) {

      const gasPrice = this.state.gasInfo.safeLow * 1e8
      const gasLimitBase = 170e3 + oraclizeCost
      const gasLimit = gasLimitBase + Math.round(100 * Math.random())

      parentState.web3js.eth.getBlockNumber((err, blockNumber) => {

        let count = 0

        let timerId
        let watchTxs = () => {
          this.watchOracleTransactions(
            parentState.netId,
            config.address.ropsten.claimer,
            blockNumber,
            gasLimit,
            tx => {
              if (tx && tx.isError) {
                if (tx.isError === "1") {
                  this.setState({err: 'The transaction from the oracle failed.', warn: null})
                  this.watcher.stop()
                }
              } else {
                timerId = setTimeout(watchTxs, 30000)
                if (count > 5) {
                  this.setState({warn: 'The oracle sometimes takes time. Please wait.'})
                }
                count++
              }
            })
        }

        console.log('blockNumber', blockNumber)

        let callbackEvents = [
          {
            event: parentState.store.IdentitySet,
            filter: {addr: parentState.address},
            callback: () => {
              this.setAddressState({subStep: 3}, {warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: parentState.claimer.VerificatioFailed,
            filter: {addr: parentState.address},
            callback: () => {
              this.setState({err: 'The transaction failed.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: parentState.manager.IdentityNotUpgradable,
            filter: {addr: parentState.address},
            callback: () => {
              this.setState({err: 'Identity not upgradable.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          }
        ]


        let startEvents = [
          {
            event: parentState.claimer.VerificationStarted,
            filter: {addr: parentState.address},
            callback: () => {
              this.setAddressState({subStep: 2})
              this.watcher.stop()
              this.watcher.watch(callbackEvents)
              timerId = setTimeout(watchTxs, 30000)
            },
            fromBlock: blockNumber
          }
        ]

        parentState.claimer.claimOwnership(
          'twitter',
          this.getState('tweetId'),
          gasPrice,
          gasLimit,
          {
            value: gasPrice * gasLimit,
            gas: 200e3,
            gasPrice
          }, (err, txHash) => {
            if (err) {
              this.setState({
                err: 'The transaction has been denied',
                loading: false
              })
            }
            else {
              this.setAddressState({
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
                  this.setState({
                    err: 'The transaction has been reverted'
                  })
                }
              )
            }
          })
      })
    } else {
      this.setState({
        noGas: true,
        err: 'Trying to load gas info. Wait a moment and try again, please.'
      })
    }
  }

  formatFloat(f, d) {
    f = f.toString().split('.')
    return f[0] + (f[1] ? '.' + f[1].substring(0, d) : '')
  }

  render() {

    let welcomeMessage = ''

    const ps = this.props.parentState

    if (ps.connected !== -1) {

      const netId = ps.netId

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

      } else {

        const state = this.state.addressStates[ps.address] || {
          step: -1
        }


        if (ps.twitterUserId) {

          //welcomeMessage = `Welcome back, ${ps.name.split(' ')[0]}`

          return (
            <div>
              <Row>
                <Col md={12}>
                  <h4>Welcome back!</h4>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <p><img style={{borderRadius: 50}} src={ps.avatar} width="73" height="73"/></p>
                  <p><b className="tname">{ps.name}</b><br/>
                    <a href={'https://twitter.com/' + ps.userName}
                       target="_blank">@{ps.userName}</a>
                  </p>
                  <p>Twitter user-id:<br/><code>{ps.twitterUserId}</code></p>
                  <p>Address:<br/><code>{ps.address}</code></p>
                </Col>
              </Row>
            </div>
          )


        } else if (ps.address) {


          if (state.step === -1) {

            return (
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
                          loading={this.state.loading}
                          cmd={() => {
                            this.getStats(ps)
                          }}
                        />
                      </p>

                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            )

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

            const minimum = '0.' + (1 / parseFloat(this.state.price)).toString().split('.')[1].substring(0, 4)

            const lowBalance = <Alert bsStyle="danger">Balance too low. You need {minimum} ether to activate your
              tweedentity.</Alert>

            return (
              <div>
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
                        <p>{this.formatStats(mainStats, '1', ps.address)}</p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={6}>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Ropsten Network</strong></p>
                        <p>{this.formatStats(ropstenStats, '3', ps.address)}</p>
                      </Panel.Body></Panel>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {ps.netId === '1' && mainStats.balance < minimum ? lowBalance : ''}
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
              </div>
            )

          } else if (state.step === 1) {
            return (
              <Row>
                <Col md={12}>
                  <h4 style={{paddingLeft: 15}}>Twitter Username</h4>
                  <Panel>
                    <Panel.Body>

                      <form>
                        <FormGroup
                          controlId="formBasicText"
                          validationState={this.state.err ? 'error' : this.getValidationState()}
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
                            this.state.err
                              ? <HelpBlock>{this.state.err}</HelpBlock>
                              : null
                          }
                        </FormGroup>
                      </form>
                      <LoadingButton
                        text="Look up for Twitter user-id"
                        loadingText="Looking up"
                        loading={this.state.loading}
                        cmd={this.getUserId}
                        disabled={this.getValidationState() !== 'success'}
                      />
                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            )
          }

          else if (state.step === 2) {

            const sigStr = `twitter/${state.userId}`

            return (
              <div>
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
                          this.state.err
                            ? <RedAlert
                              message={this.state.err}
                            />
                            : ''
                        }
                        <p>
                          <LoadingButton
                            text="Sign it now"
                            loadingText="Waiting for signature"
                            loading={this.state.loading}
                            cmd={() => {
                              this.signString(ps.web3js, ps.address, sigStr)
                            }}
                            disabled={this.getValidationState() !== 'success'}
                          />
                        </p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </div>
            )

          } else if (state.step === 3) {
            return (
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
                        this.state.err === 'User not found'
                          ? <RedAlert
                            title="Whoops"
                            message="The Twitter user has not been found. Very weird :-("
                            link={() => {
                              this.setAddressState({step: 1}, {err: null})
                            }}
                            linkMessage="Input the username again"
                          />
                          : this.state.err === 'Wrong tweet'
                          ? <RedAlert
                            title="Whoops"
                            message="No tweet with a valid signature was found."
                            link={() => {
                              this.setAddressState({step: 1}, {err: null})
                            }}
                            linkMessage="Input the username again"
                          />
                          : this.state.err === 'Wrong signature'
                            ? <RedAlert
                              title="Whoops"
                              message="A tweet was found but with a wrong signature."
                              link={() => {
                                this.setAddressState({step: 1}, {err: null})
                              }}
                              linkMessage="Input the username again"
                            />
                            : this.state.err === 'Wrong user'
                              ? <RedAlert
                                title="Whoops"
                                message="A tweet with the right signature was found, but it was posted by someone else."
                                link={() => {
                                  this.setAddressState({step: 1}, {err: null})
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
                                  loading={this.state.loading}
                                  cmd={this.findTweet}
                                />
                              </p>

                      }

                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            )
          } else if (state.step === 4) {

            const price = parseFloat(this.state.price, 10)
            const gasPrice = this.state.gasInfo.safeLow * 1e8
            const gasLimit = 185e3

            const cost = this.formatFloat(gasPrice * gasLimit / 1e18, 4)
            const cost$ = this.formatFloat(price * gasPrice * gasLimit / 1e18, 1)

            const params = {
              value: gasPrice * gasLimit,
              gas: 255e3,
            }

            const etherscanUrl = `https://${ps.netId === '3' ? 'ropsten.' : ''}etherscan.io/address/${ config.address[ps.netId === '3' ? 'ropsten' : 'main'].claimer }`

            return (
              <Row>
                <Col md={12}>
                  <h4 style={{paddingLeft: 15}}>Create your <em>tweedentity</em></h4>
                  <Panel>
                    <Panel.Body>
                      <p><strong>All is ready</strong></p>
                      <p>In the next step you will send {cost} ether (${cost$}) to the <a href={etherscanUrl}
                                                                                          target="_blank">Tweedentity
                        Smart Contract </a> to
                        cover the gas necessary to create your <em>tweedentity</em> in the Ethereum Blockchain. Be
                        adviced, after than you have created it, your Twitter user-id and your wallet will be publicly
                        associated.</p>
                      <p><span className="code">TwitterUserId:</span> <span
                        className="code success">{state.userId}</span><br/>
                        <span className="code">Wallet:</span> <span
                          className="code success">{ps.address}</span>
                      </p>
                      {
                        this.state.err
                          ? <RedAlert
                            title={this.state.err}
                            message="Please, try again in a while"
                          />
                          : ''
                      }
                      <LoadingButton
                        text={this.state.err ? 'Try again' : 'Create it now!'}
                        loadingText="Starting transaction"
                        loading={this.state.loading}
                        cmd={() => {
                          this.startTransaction(ps)
                        }}
                      />
                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            )
          } else if (state.step === 5) {

            let transaction = <a
              href={'https://' + (ps.netId === '3' ? 'ropsten.' : '') + 'etherscan.io/tx/' + state.txHash}
              target="_blank">transaction</a>

            return (
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
                      loading={state.subStep < 2 && !this.state.err}
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
                        loading={state.subStep < 3 && !this.state.err}
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
                    this.state.err
                      ?
                      <RedAlert
                        title="Whoops"
                        message={this.state.err}
                        link={() => {
                          this.setAddressState({step: 4}, {err: null})
                        }}
                        linkMessage="Go back"
                      />
                      : this.state.warn
                      ? <Alert bsStyle="warning">{this.state.warn}</Alert>
                      : ''
                  }
                </Col>
              </Row>
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
      <Row>
        <Col md={12}>
          {welcomeMessage}
        </Col>
      </Row>
    )

  }
}

export default AppCore
