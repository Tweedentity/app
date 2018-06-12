import Basic from './Basic'
import LoadingButton from './extras/LoadingButton'

const {Panel} = ReactBootstrap

class Account extends Basic {


  constructor(props) {
    super(props)

    this.execCommand = this.execCommand.bind(this)
  }


  execCommand(key) {
    if (key === 2) {
      this.historyPush('profile')
    }
  }

  render() {

    const as = this.appState()
    let content = <p>Coming soon...</p>

    if (this.props.active) {

      if (this.props.userId) {

        content = <span>
            <p>
              <img style={{borderRadius: 100}} src={this.props.avatar} width="120" height="120"/>
            </p>
            <p className="user-data">
              {this.props.name}<br/>
              <a href={'https://twitter.com/' + this.props.username}
                 target="_blank">{this.props.decoratedUsername}</a>
            </p>
            <p style={{paddingTop: 8}}>
              ID: <code>{this.props.userId}</code>
            </p>
          </span>
      } else {
        content = <span>
          <p>
              <img style={{borderRadius: 100}} src={this.props.defaultAvatar} width="120" height="120"/>
            </p>
        <p className="user-data">
        Ready to claim your tweedentity?
        </p>
        <p>
          <LoadingButton
            text="Yes, please"
            loadingText="Analyzing wallet"
            loading={as.loading}
            cmd={this.props.getStats}
          />
        </p>
      </span>
      }
    }
    return (
      <Panel>
        <Panel.Body>
          <div className="account">
            <i className={`fa fa-${this.props.icon} appIcon`}></i>
            { this.props.active && this.props.userId
              ? <i className="fa fa-cog settingsIcon"></i>
            : null}
            {content}
          </div>
        </Panel.Body>
      </Panel>
    )

  }
}

export default Account
