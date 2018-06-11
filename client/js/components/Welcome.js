import LoadingButton from './extras/LoadingButton'

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

    if (state.twitter && state.twitter.name) {

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


    } else if (typeof state.twitter === 'object') {

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
      } else if (as.ready === false) {

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
