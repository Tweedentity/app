const {Nav, NavItem, NavDropdown, MenuItem, Navbar} = ReactBootstrap
import NetworkStatus from './NetworkStatus'

class Header extends React.Component {

  render() {

    let dropDown

    const ps = this.props.appState
    const wallet = ps.wallet
    let twitter
    try {
      twitter = ps.data[wallet.substring(0,6)].twitter
    } catch (e) {
    }

    if (wallet) {

      if (twitter) {
        dropDown = <NavDropdown eventKey={3} title={<img src={twitter.avatar} className="tavatar circled"/>}
                                id="basic-nav-dropdown">
          <li role="presentation">
            <span><b className="tname">{twitter.name}</b><br/>
              @{twitter.username}</span>
          </li>
          <MenuItem divider/>
          <MenuItem eventKey={3.1}>Settings</MenuItem>
        </NavDropdown>
      } else {
        dropDown = <Nav>
          <NavItem eventKey={1} href="#">
            {'Wallet ' + this.props.appState.wallet.substring(0, 6) + ' (anonymous)'}
          </NavItem>
        </Nav>
      }
    }

    return (
      <div>
        <NetworkStatus appState={this.props.appState}/>
        <Navbar
          staticTop
          componentClass="header"
          className="bs-docs-nav"
          role="banner"
        >
          <Navbar.Header>
            <Navbar.Brand>
              <img src="img/tweedentity-full-logo-w-ico.png" style={{marginTop: -1}}/>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {dropDown}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
}

export default Header
