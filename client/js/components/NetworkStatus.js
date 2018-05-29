
class NetworkStatus extends React.Component {

  render() {


    const netId = this.props.parentState.netId
    let connectedTo = '...'

    if (netId == null) {

      connectedTo = 'You are not connected to the Ethereum network'

    } else if (netId == '0') {

      connectedTo = <span>You are connected to an unsupported Ethereum network</span>

    } else if (netId == '1') {

      connectedTo = <span>You are connected to the main Ethereum network</span>

    } else {

      connectedTo = <span>You are connected to the {netId === 1 ? 'main Ethereum' : 'Ropsten test'} network</span>
    }

    return (
    <div className="overHeader">
      <i className="fa fa-cogs"></i> &nbsp; {connectedTo}
    </div>
    )
  }
}

export default NetworkStatus