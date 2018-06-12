import LoadingButton from './extras/LoadingButton'
import Basic from './Basic'

const {Panel, Grid, Row, Col, FormGroup, Button, FormControl} = ReactBootstrap


class Signed extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'handleFocus',
      'findTweet'
    ]) {
      this[m] = this[m].bind(this)
    }
  }

  handleFocus(event) {
    event.target.select()
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
        network: this.appState().netId,
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
            gasInfo: responseJson.gasInfo
          }, {
            loading: false
          })
          this.historyPush('create')
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

  render() {

    const as = this.appState()

    const state = as.data[this.shortWallet()]

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
                    ? <BigAlert
                      title="Whoops"
                      message="The Twitter user has not been found. Very weird :-("
                      link={() => {
                        this.setGlobalState({step: 1}, {err: null})
                      }}
                      linkMessage="Input the username again"
                    />
                    : as.err === 'Wrong tweet'
                    ? <BigAlert
                      title="Whoops"
                      message="No tweet with a valid signature was found."
                      link={() => {
                        this.setGlobalState({step: 1}, {err: null})
                      }}
                      linkMessage="Input the username again"
                    />
                    : as.err === 'Wrong signature'
                      ? <BigAlert
                        title="Whoops"
                        message="A tweet was found but with a wrong signature."
                        link={() => {
                          this.setGlobalState({step: 1}, {err: null})
                        }}
                        linkMessage="Input the username again"
                      />
                      : as.err === 'Wrong user'
                        ? <BigAlert
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
  }
}

export default Signed
