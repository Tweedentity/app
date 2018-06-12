import LoadingButton from './extras/LoadingButton'
import Account from './Account'

const {Panel, Alert, Grid, Row, Col} = ReactBootstrap
import Basic from './Basic'


class Welcome extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'getStats'
    ]) {
      this[m] = this[m].bind(this)
    }
  }

  getStats(state) {

    this.setGlobalState({}, {
      loading: true
    })

    return fetch(window.location.origin + '/api/wallet-stats?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.appState().netId,
        address: state.wallet
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setGlobalState({
          stats: responseJson
        }, {
          loading: false
        })
        this.historyPush('wallet-stats')
      })
  }

  render() {

    const as = this.appState()
    const wallet = as.wallet

    const state = as.data[this.shortWallet()]

    if (typeof state.twitter === 'object') {

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{textAlign: 'center', marginBottom: 48}}>
                {
                  state.twitter.username
                  ? 'Welcome back ' : 'Welcome '
                } {as.wallet}</h4>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="twitter"
                name={state.twitter.name}
                username={state.twitter.username}
                userId={state.twitter.userId}
                decoratedUsername={'@' + state.twitter.name}
                avatar={state.twitter.avatar}
                active={true}
                getStats={() => {
                  this.getStats(as)
                }}
                defaultAvatar="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
              />
            </Col>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="facebook"
                active={false}
              />
            </Col>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="github"
                active={false}
              />
            </Col>
          </Row>
        </Grid>
      )

    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <p><img src="img/spinner.svg"/></p>
            <p>Preparing the app...</p>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Welcome
