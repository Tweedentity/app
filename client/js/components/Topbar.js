const {Nav, NavItem, NavDropdown, MenuItem, Navbar} = ReactBootstrap

class Topbar extends React.Component {

  render() {

    let dropDown

    let ps = this.props.parentState

    if (ps.address) {

      if (ps.twitterUserId && ps.userName) {
        dropDown = <NavDropdown eventKey={3} title={<img src={ps.avatar} className="tavatar circled"/>}
                                id="basic-nav-dropdown">
          <li role="presentation">
            <span><b className="tname">{ps.name}</b><br/>
              @{ps.userName}</span>
          </li>
          <MenuItem divider/>
          <MenuItem eventKey={3.1}>Settings</MenuItem>
        </NavDropdown>
      } else {
        dropDown = <Nav>
          <NavItem eventKey={1} href="#">
            {'Wallet ' + this.props.parentState.address.substring(0, 6) + ' (anonymous)'}
          </NavItem>
        </Nav>
      }
    }

    return (
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
    )
  }
}

export default Topbar
