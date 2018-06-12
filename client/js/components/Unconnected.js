import BigAlert from './extras/BigAlert'
import Basic from './Basic'

const {Grid, Row, Col} = ReactBootstrap


class Unconnected extends Basic {

  render() {

    let welcomeMessage = ''

    const as = this.appState()

    if (as.connected !== -1) {

      const netId = as.netId

      if (netId == null) {

        welcomeMessage = <BigAlert
          title="Web3js not found"
          message="You must either install MetaMask or use a browser compatible with Ethereum like Mist, Parity or Brave."
          link="https://metamask.io"
          linkMessage="Get MetaMask"
        />

      } else if (netId === '0') {

        welcomeMessage =
          <BigAlert
            title="Unsupported network."
            message="This alpha version supports only Ropsten."
          />

      } else if (netId === '1') {

        // will be remove in the final version
        welcomeMessage =
          <BigAlert
            title="Unsupported network."
            message="This alpha version supports only Ropsten."
          />

      } else if (!as.wallet) {
        welcomeMessage =
          <BigAlert
            title="Wallet not found."
            message="Please, activate your wallet and refresh the page."
          />
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

export default Unconnected
