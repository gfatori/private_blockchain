const Database = require("./database.js");
const api_database = new Database('apidb');

module.exports = class BlockchainIDValidation {
    async create_validation_window(address, timestamp) {
        let validation_status = null
        await this.get_validation_status(address)
         .then(value => validation_status = JSON.parse(value))
         .catch(value => validation_status = null)
          if (!validation_status) {
            let message = this.create_message(address, timestamp);
            validation_status = {
                "registerStar": false,
                "status": {
                  "address": address,
                  "requestTimeStamp": timestamp,
                  "message": message,
                  "validationWindow": 300,
                  "messageSignature": "pending"
                }
              }
              await this.create_validation_status(address, JSON.stringify(validation_status));
              return validation_status;
          } else if (validation_status.status.messageSignature === 'pending') {
            // verifies time window validity.
            let new_window = await this.validate_time_window(validation_status.status.requestTimeStamp);
            // if invalid, removes and returns null.
            if (!new_window) {
                await this.remove_validation_status(validation_status.status.address);
                console.log("Invalid window, restart the process.");
                return null;
            }
            // if still valid, updates the new window and returns.
            validation_status.status.validationWindow = new_window;
            await this.create_validation_status(address, JSON.stringify(validation_status));
                return validation_status;
          } else if (validation_status.status.messageSignature === 'valid') {
                return validation_status;
            } 
          }

    create_message(address, timestamp) {
        let message = null;
            message = address.toString() + ':' + timestamp.toString() + ':' + 'starRegistry';
            return message;
    }

    validate_time_window(timestamp) {
          var time_difference =  Date.now() - timestamp;
         if (time_difference < 300000) {
             let remaining_time = (300000 - time_difference) / 1000
            console.log('Time window still valid. You still have: ' + remaining_time  + ' seconds.') 
            return remaining_time;
         } else {
            console.log('Time window invalid.') 
            return false;
         }
    }

    async create_validation_status(address, data) {
        await api_database.addLevelDBData(address, data);
    }

    async remove_validation_status(address) {
        await api_database.deleteLevelDBData(address);
    }
    async is_address_signed(address) {
        let validation = null
        await this.get_validation_status(address)
            .then(value => validation = value)
            .catch((err) => {
          console.log('Could not find this address signature on database.');
          validation = false;
        });
        if (validation.registerStar == true) {
            validation = true
        }
        return validation;
    }
    
    async get_validation_status(address) {
        return new Promise((resolve, reject) => {
            api_database.getLevelDBData(address, function(err, value) {
              console.log(err,value);
              err != null
                ? reject(err)
                : resolve(value);
            });
          });
    }
}