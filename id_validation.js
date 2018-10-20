const Database = require('./database.js')
const api_database = new Database('apidb')

module.exports = class BlockchainIDValidation {
  async create_validation_window (address, timestamp) {
    let validationStatus = null
    await this.get_validation_status(address)
      .then(value => { validationStatus = JSON.parse(value) })
      .catch(value => { validationStatus = null })
    if (!validationStatus) {
      let message = this.create_message(address, timestamp)
      validationStatus = {
        'registerStar': false,
        'status': {
          'address': address,
          'requestTimeStamp': timestamp,
          'message': message,
          'validationWindow': 300,
          'messageSignature': 'pending'
        }
      }
      await this.create_validation_status(address, JSON.stringify(validationStatus))
      return validationStatus
    } else if (validationStatus.status.messageSignature === 'pending') {
      // verifies time window validity.
      let newWindow = await this.validate_time_window(validationStatus.status.requestTimeStamp)
      // if invalid, removes and returns null.
      if (!newWindow) {
        await this.remove_validation_status(validationStatus.status.address)
        console.log('Invalid window, restart the process.')
        return null
      }
      // if still valid, updates the new window and returns.
      validationStatus.status.validationWindow = newWindow
      await this.create_validation_status(address, JSON.stringify(validationStatus))
      return validationStatus
    } else if (validationStatus.status.messageSignature === 'valid') {
      return validationStatus
    }
  }

  create_message (address, timestamp) {
    let message = null
    message = address.toString() + ':' + timestamp.toString() + ':' + 'starRegistry'
    return message
  }

  validate_time_window (timestamp) {
    var timeDifference = Date.now() - timestamp
    if (timeDifference < 300000) {
      let remainingTime = (300000 - timeDifference) / 1000
      console.log('Time window still valid. You still have: ' + remainingTime + ' seconds.')
      return remainingTime
    } else {
      console.log('Time window invalid.')
      return false
    }
  }

  async create_validation_status (address, data) {
    await api_database.addLevelDBData(address, data)
  }

  async remove_validation_status (address) {
    await api_database.deleteLevelDBData(address)
  }
  async is_address_signed (address) {
    let validation = null
    await this.get_validation_status(address)
      .then(value => { validation = JSON.parse(value) })
      .catch((err) => {
        validation = false
        console.log('Could not find this address signature on database.', err)
      })
    if (validation.registerStar === true) {
      validation = true
    } else {
      validation = false
    }
    return validation
  }

  async get_validation_status (address) {
    return new Promise((resolve, reject) => {
      api_database.getLevelDBData(address, function (err, value) {
        console.log(err, value)
        err != null
          ? reject(err)
          : resolve(value)
      })
    })
  }
}