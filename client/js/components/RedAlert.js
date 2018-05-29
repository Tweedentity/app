const {Alert, Button} = ReactBootstrap

class RedAlert extends React.Component {

  render() {

    return (
    <Alert bsStyle="danger">
      <h4><i className="fa fa-exclamation-triangle mr4"></i>
        {this.props.title}</h4>
      <p>
        {this.props.message}
      </p>
      {
        this.props.link
        ? <p>
          <a href={this.props.link} target="_blank">
            <Button>{this.props.linkText}</Button>
          </a>
        </p>
        : ''
      }
    </Alert>
    )
  }

}

export default RedAlert