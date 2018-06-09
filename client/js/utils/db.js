const ls = require('local-storage')

class Db {

  constructor(setState) {
    this.setState = setState
    this.db = JSON.parse(ls('db') || '{}')
  }

  put(key, val) {
    try {
      let db = this.db
      let data
      if (typeof key === 'object') {
        data = key
      } else {
        data = val
        if (!this.db[key]) {
          this.db[key] = {}
        }
        db = this.db[key]
      }
      let save = false
      for (let d in data) {
        db[d] = data[d]
        save = true
      }
      if (save) {
        ls('db', JSON.stringify(this.db))
        this.setState(this.db)
      }
    } catch (err) {
      console.error(err.message)
    }
  }

}

module.exports = Db
