const fs = require('fs')

const setEnv = (file) => {

    try {
        const envJson = JSON.parse(fs.readFileSync(file, 'utf-8'))
        for (let i in envJson) {
            process.env[i] = envJson[i]
        }
    } catch(err) {
        console.error('ERROR: Env file not found')
    }
}

module.exports = setEnv
