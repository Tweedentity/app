const sigUtil = require('eth-sig-util')

import LoadingButton from './extras/LoadingButton'
import Basic from './Basic'
import BigAlert from './extras/BigAlert'

const {Panel, Grid, Row, Col, Button} = ReactBootstrap


class UserIdFound extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'signString',
      'getValidationState',
      'useSig'
    ]) {
      this[m] = this[m].bind(this)
    }

    this.signKey = `${this.appState().wallet}:twitter:${this.getGlobalState('userId')}`
    this.validSig = this.appState().data[this.signKey]
  }

  getValidationState() {
    if (/^[a-zA-Z0-9_]{1,15}$/.test(this.getGlobalState('username'))) {
      return 'success'
    } else if (this.getGlobalState('username').length > 0) {
      return 'error'
    }
    return null
  }

  useSig() {
    const sig = this.validSig
    let tweet = `tweedentity(${this.appState().wallet.substring(0, 6).toLowerCase()},twitter/${this.getGlobalState('userId')},${sig},3,web3;1)`
    this.setGlobalState({
      tweet,
      sig: sig
    }, {
      loading: false
    })
    this.db.set(``, sig)
    this.historyPush('signed')
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

    this.web3js.currentProvider.sendAsync({
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
          this.db.set(this.signKey, result.result)
          this.validSig = result.result
          this.useSig()
        } else {
          this.setGlobalState({}, {err: 'Failed to verify signer', loading: false})
        }
      }
    })
  }


  render() {

    const as = this.appState()
    const wallet = as.wallet

    const twitter = as.data[this.shortWallet()]

    const sigStr = `twitter/${twitter.userId}`

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <h4 style={{padding: '0 15px 8px'}}>Your Twitter data</h4>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Panel>
              <Panel.Body>
                <p><img style={{borderRadius: 50}} src={twitter.avatar} width="73" height="73"/></p>
                <p><a href={'https://twitter.com/' + twitter.username}
                      target="_blank">@{twitter.username}</a><br/>
                  {twitter.name}</p>
                <p>Twitter user-id:<br/><code>{twitter.userId}</code></p>
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
                    ? <BigAlert
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
                {
                  this.validSig
                  ? <div>
                    <p>A correct signature has been found in the local storage.</p>
                    <p><Button
                        bsStyle="warning"
                        onClick={this.useSig}
                    >Use it</Button></p>
                    </div>
                  : null
                }
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default UserIdFound
