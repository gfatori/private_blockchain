  const level = require('level');
  const chainDB = './chaindata';
  const db = level(chainDB);

  module.exports = class Database {
   addLevelDBData(key, value) {
    db.put(key, value, function(err) {
      if (err)
        return console.log('Block ' + key + ' submission failed', err);
      }
    )
  }
  
  // Get data from levelDB with key
  getLevelDBData(key) {
    db.get(key, function(err, value) {
      if (err)
        return console.log('Not found!', err);
      console.log('Value = ' + value);
    })
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
      addLevelDBData(i, value);
    });
  }
  
  countLevelDBData() {
    let height = 0;
    return new Promise((resolve, reject) => {
      db.createReadStream().on('data', function(data) {
        height++;
      }).on('error', function(err) {
        return console.log('Unable to get block height', err);
        reject(err);
      }).on('close', function() {
        height = height - 1
        console.log('Found block height ' + height);
        resolve(height);
      });
    })
  }
}
  