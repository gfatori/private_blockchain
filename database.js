  const level = require('level');
  const chainDB = './chaindata';
  const db = level(chainDB);

  module.exports = class Database {
    constructor() {
      console.log('db class created')
    }
    addLevelDBData(key, value) {
    db.put(key, value, function(err) {
      if (err)
        return console.log('Block ' + key + ' submission failed', err);
      }
    )
  }
  // Get data from levelDB with key
  getLevelDBData(key,cb) {
    db.get(key, cb);
  }
  // Add data to levelDB with value
  addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
      i++;
    }).on('error', function(err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function() {
      console.log('Block #' + i);
    });
    
  }
  
  async countLevelDBData() {
    let height = 0;
    return new Promise((resolve, reject) => {
      db.createReadStream().on('data', function(data) {
        height++;
      }).on('error', function(err) {
        return console.log('Unable to get block height', err);
        reject(err);
      }).on('close', function() {
        console.log('Found block height ' + height);
        resolve(height);
      });
    })
  }
}
  