const level = require('level');
const chainDB = './chaindata';
const apiDB = './apidata';
// 2 types of database. One for API and the other for the blockchain.
const cdb = level(chainDB);
const adb = level(apiDB);

module.exports = class Database {
  constructor(db_type) {
    this.db = null;
    if (db_type === 'apidb') {
      this.db = adb;
    } else if (db_type === 'chaindb') {
      this.db = cdb;
    } else {
      return console.log('invalid database type. \n choose from apidb, chaindb or authdb.');
    }
    console.log(db_type + ' created successfully.');
  }
  addLevelDBData(key, value) {
    this.db.put(key, value, function (err) {
      if (err)
        return console.log('Block ' + key + ' submission failed', err);
    }
    )
  }

  deleteLevelDBData(key) {
    this.db.del(key, function (err) {
      if (err)
        return console.log('Could not delete ' + key + 'Error: ' + err);
    }
    )
  }
  // Get data from levelDB with key
  getLevelDBData(key, cb) {
    this.db.get(key, cb);
  }
  // Add data to levelDB with value
  addDataToLevelDB(value) {
    let i = 0;
    this.db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function () {
      console.log('Block #' + i);
    });
  }

  async countLevelDBData() {
    let height = 0;
    return new Promise((resolve, reject) => {
      this.db.createReadStream().on('data', function (data) {
        console.log(data);
        height++;
      }).on('error', function (err) {
        reject(err);
      }).on('close', function () {
        console.log('Found block height ' + height);
        resolve(height);
      });
    })
  }

  async getAllBlocks() {
    let arr = [];
    return new Promise((resolve, reject) => {
      this.db.createReadStream().on('data', function (data) {
        arr.push(JSON.parse(data.value));
      }).on('error', function (err) {
        reject(err);
      }).on('close', function () {
        resolve(arr);
      });
    })
  }
}
