const {Nav, NavItem, NavDropdown, MenuItem, Navbar} = ReactBootstrap

class Topbar extends React.Component {

  render() {

    return (
    <Navbar
    staticTop
    componentClass="header"
    className="bs-docs-nav"
    role="banner"
    >
      <Navbar.Header>
        <Navbar.Brand>
          <img src="img/tweedentity-black.png" style={{marginTop: -1}}/>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        {/*<Nav>*/}
        {/*<NavItem eventKey={1} href="#">*/}
        {/*Link*/}
        {/*</NavItem>*/}
        {/*<NavItem eventKey={2} href="#">*/}
        {/*Link*/}
        {/*</NavItem>*/}
        {/*</Nav>*/}
        <Nav pullRight>
          {
            this.props.parentState.defaultAccount ?
            <NavDropdown eventKey={3} title={'Logged wallet: ' + this.props.parentState.defaultAccount}
                         id="basic-nav-dropdown">
              <MenuItem eventKey={3.1}>Action</MenuItem>
              <MenuItem eventKey={3.2}>Another action</MenuItem>
              <MenuItem eventKey={3.3}>Something else here</MenuItem>
              <MenuItem divider/>
              <MenuItem eventKey={3.4}>Separated link</MenuItem>
            </NavDropdown>
            : null
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    )
  }
}

export default Topbar