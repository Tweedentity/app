const ls = require('local-storage')
import RedAlert from './RedAlert'

const sigUtil = require('eth-sig-util')

const {Panel, Alert, Button, Row, Col, FormGroup, ControlLabel, FormControl, InputGroup} = ReactBootstrap

class Verifier extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      step: 0,
      screenName: ''
    }
    for (let m of 'getStats,getEtherscan,getTwitterScreenName,handleChange,getValidationState,getUserId,signString,findTweet'.split(',')) {
      this[m] = this[m].bind(this)
    }

  }

  findTweet() {
    this.setState({
      loading: true
    })
    return fetch(window.location.origin + '/api/scan-tweets?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenName: this.state.screenName,
        sig: this.state.tweet
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      const r = responseJson.result

      if (r.tweetId) {
        this.setState({
          tweetId: r.tweetId,
          step: 4,
          loading: false
        })
      } else {
        throw(new Error('Not found'))
      }
    })
    .catch(err => {
      this.setState({
        error: 'User not found',
        loading: false
      })
    })
  }

  handleFocus (event) {
    event.target.select()
  }

  signString(web3js, from, sigStr) {

    this.setState({
      loading: true
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
      if (err) return console.error(err)
      if (result.error) {
        return console.error(result.error.message)
      }

      const recovered = sigUtil.recoverTypedSignature({
        data: msgParams,
        sig: result.result
      })

      if (recovered === from) {
        let tweet = `tweedentity(${from.substring(0,4).toLowerCase()},twitter/${this.state.userId},${result.result},3,web3;1)`
        this.setState({
          tweet,
          sig: result.result,
          step: 3,
          loading: false
        })
      } else {
        alert('Failed to verify signer, got: ' + result)
      }
    })

  }

  getUserId() {
    this.setState({
      loading: true
    })
    return fetch(window.location.origin + '/api/twitter-user-id?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenName: this.state.screenName
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      const r = responseJson.result

      if (r.sn) {
        this.setState({
          screenName: r.sn,
          userId: r.userId,
          name: r.name,
          avatar: r.avatar,
          step: 2,
          loading: false
        })
      } else {
        throw(new Error('Not found'))
      }
    })
    .catch(err => {
      this.setState({
        error: 'User not found',
        loading: false
      })
    })
  }

  getValidationState() {
    if (/^[a-zA-Z0-9_]{1,15}$/.test(this.state.screenName)) {
      return 'success'
    } else if (this.state.screenName.length > 0) {
      return 'error'
    }
    return null
  }

  handleChange(e) {
    this.setState({screenName: e.target.value})
  }

  getStats(state) {

    this.setState({
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
        address: state.defaultAccount
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        stats: responseJson.result,
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
    this.setState({step: 1})
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

  render() {

    let welcomeMessage = ''

    const state = this.props.parentState

    if (state.connected !== -1) {

      const netId = state.netId

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

        if (state.twitterUserId) {

          welcomeMessage = `Welcome back, ${state.twitterUserId}`

        } else if (state.defaultAccount) {


          if (this.state.step === 0) {

            const nextStep = <strong>Your wallet looks good.</strong>
            const notGood = <strong>Whoops, you did many transactions with this wallet.</strong>
            const veryBad = <strong>Be careful, you did a lot of transactions with this wallet.</strong>

            const weSuggest = <p>For your privacy, we suggest you use a wallet with almost no transactions to /from any
              other wallet. After that you have set your tweedentity, anyone could see all your transactions. The best
              practice is to create a new wallet and send a minimum amount of ether to it using an exchange like <a
              href="https://https://shapeshift.io/" target="_blank">ShapeShift</a> or a mixes like <a
              href={'https://www.eth-mixer.com/'} target={'_blank'}>ETH-Mixer</a>.</p>

            const moreInfo =
            <p>Read more about privacy issues and how to solve them <a href="#" target="_blank">here</a>.</p>


            if (this.state.stats) {

              const mainStats = this.state.stats.main
              const ropstenStats = this.state.stats.ropsten

              const score = mainStats.txs + mainStats.deployes + mainStats.execs
              const cls = score < 3 ? 'primary' : score < 5 ? 'warning' : 'danger'

              const minimum = '0.' + (1 / parseFloat(this.state.stats.price)).toString().split('.')[1].substring(0, 4)

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
                        <p>{this.formatStats(mainStats, '1', state.defaultAccount)}</p>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={6}>
                    <Panel>
                      <Panel.Body>
                        <p><strong>Ropsten Network</strong></p>
                        <p>{this.formatStats(ropstenStats, '3', state.defaultAccount)}</p>
                      </Panel.Body></Panel>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {state.netId === '1' && mainStats.balance < minimum ? lowBalance : ''}
                    <Alert bsStyle={score < 3 ? 'success' : score < 5 ? 'warning' : 'danger'}>
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
                    <Button bsStyle={score < 3 ? 'primary' : score < 5 ? 'warning' : 'danger'}
                            onClick={this.getTwitterScreenName}>
                      {score < 3 ? 'Use this wallet' : 'Use this wallet, anyway. I know what I am doing'}
                    </Button>
                  </Col>
                </Row>
              </div>
              )
            } else {

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
                        <Button bsStyle={
                          this.state.loading
                          ? 'success'
                          : 'primary'
                        } onClick={() => {
                          this.getStats(state)
                        }}>{
                          this.state.loading
                          ? <span><i className="fa fa-spinner"></i> Analyzing wallet</span>
                          : 'Yes, please'
                        }</Button>
                      </p>

                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
              )
            }

          } else if (this.state.step === 1) {
            return (
            <Row>
              <Col md={12}>
                <h4 style={{paddingLeft: 15}}>Twitter Username</h4>
                <Panel>
                  <Panel.Body>

                    <form>
                      <FormGroup
                      controlId="formBasicText"
                      validationState={this.getValidationState()}
                      >
                        <ControlLabel>Which is your Twitter Username?</ControlLabel>

                        <InputGroup>
                          <InputGroup.Addon>@</InputGroup.Addon>
                          <FormControl
                          type="text"
                          value={this.state.value}
                          placeholder="Type username"
                          onChange={this.handleChange}
                          />
                          <FormControl.Feedback/>
                        </InputGroup>
                      </FormGroup>
                    </form>
                    <Button bsStyle="primary"
                            disabled={this.getValidationState() !== 'success'}
                            onClick={this.getUserId}
                    >{
                      this.state.loading
                      ? <span><i className="fa fa-spinner"></i> Looking up</span>
                      : 'Look up for Twitter user-id'
                    }</Button>
                  </Panel.Body>
                </Panel>
              </Col>
            </Row>
            )
          }

          else if (this.state.step === 2) {

            const sigStr = `twitter/${this.state.userId}`

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
                      <p><img style={{borderRadius: 50}} src={this.state.avatar} width="73" height="73"/></p>
                      <p><a href={'https://twitter.com/' + this.state.screenName}
                            target="_blank">@{this.state.screenName}</a><br/>
                        {this.state.name}</p>
                      <p>Twitter user-id:<br/><code>{this.state.userId}</code></p>
                    </Panel.Body>
                  </Panel>
                </Col>
                <Col md={8}>
                  <Panel>
                    <Panel.Body>
                      <p><strong>Create your signed tweet</strong></p>
                      <p>To verify that you own this Twitter account, you must publish a special tweet containing the
                        cryptographic signature of the following string, using your current Ethereum address:</p>
                      <p><code>{sigStr}</code></p>

                      <p style={{paddingTop: 20}}>
                        <Button bsStyle="primary"
                                disabled={this.getValidationState() !== 'success'}
                                onClick={() => {
                                  this.signString(this.props.web3js, state.defaultAccount, sigStr)
                                }}
                        >{
                          this.state.loading
                          ? <span><i className="fa fa-spinner"></i> Waiting for signature</span>
                          : 'Sign it now'
                        }</Button></p>
                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            </div>
            )

          } else if (this.state.step === 3) {
            return (
            <Row>
              <Col md={12}>
                <h4 style={{paddingLeft: 15}}>Tweet and verify</h4>
                <Panel>
                  <Panel.Body>
                    <p><strong>Signature ready</strong></p>
                    <p>Please, copy the following text and tweet it, or click the button to open Twitter in a new tab, ready for the tweet. After the verification is completed, you can cancel it, if you like.</p>
                    <form>
                      <FormGroup
                      controlId="someText"
                      >
                        <FormControl
                        type="text"
                        value={this.state.tweet}
                        readOnly={true}
                        onFocus={this.handleFocus}
                        />
                        <FormControl.Feedback/>
                      </FormGroup>
                    </form>
                    <a href={'https://twitter.com/intent/tweet?text=' + escape(this.state.tweet)+ '&source=webclient'} target="_blank">
                    <Button bsStyle="primary">Open Twitter now</Button></a> <Button bsStyle="success" onClick={this.findTweet}>I tweeted it, continue!</Button>
                  </Panel.Body>
                </Panel>
              </Col>
            </Row>
            )
          } else if (this.state.step === 4) {
            return (
            <Row>
              <Col md={12}>
                <h4 style={{paddingLeft: 15}}>Create your <em>tweedentity</em></h4>
                <Panel>
                  <Panel.Body>
                    <p><strong>All is ready</strong></p>
                    <p>In the next step you will send 0.0045 ether to the <a href="#">Tweedentity Smart Contract </a> to cover the gas necessary to create your <em>tweedintity</em> in the Ethereum Blockchain. Be adviced, after than you have created it, your Twitter user-id and your wallet will be publicly associated.</p>
                    <p><span className="code">TwitterUserId:</span> <span className="code success">{this.state.userId}</span><br/>
                    <span className="code">Wallet:</span> <span className="code success">{state.defaultAccount}</span></p>
                    <Button style={{marginTop:6}} bsStyle="success" onClick={this.findTweet}>Create it now!</Button>
                  </Panel.Body>
                </Panel>
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

      return (
      <Row>
        <Col md={12}>
          {welcomeMessage}
        </Col>
      </Row>
      )

      // SKIPPING THIS FOR NOW

    } else {
      return <div/>
    }
  }
}

export default Verifier
