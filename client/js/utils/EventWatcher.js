const noop = new Function()

class EventWatcher {


  constructor(web3js) {
    this.web3js = web3js
  }

  stop() {
    console.log('stopping')
    if (this.events) {
      try {
        for (e in this.events) {
          e.stopWatching()
        }
      } catch (err) {
      }
      this.events = null
      console.log('stopped')
    }
  }

  watch(events) {

    this.stop()

    this.events = []
    let index = 0
    let self = this

    for (let event of events) {
      (function (e) {

        console.log(e)

        self.events[index] = e.event(e.filter || {}, {
          fromBlock: e.fromBlock,
          toBlock: e.toBlock || 'latest'
        })

        self.events[index].watch((err, result) => {
          (e.callback || noop)(result)
        })
      })(event)
      index++
    }
  }

  waitFor(txHash, onReceipt, onSuccess, onError) {
    this
      .web3js
      .eth
      .getTransactionReceiptMined(txHash)
      .then(receipt => {
        if (onReceipt(receipt)) {
          (onSuccess || noop)()
        }
        else {
          (onError || noop)()
        }
      })
  }

}

module.exports = EventWatcher
