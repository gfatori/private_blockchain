/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  ========================================================= */
const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  ============================================================= */

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  db.put(key, value, function(err) {
    if (err)
      return console.log('Block ' + key + ' submission failed', err);
    }
  )
}

// Get data from levelDB with key
function getLevelDBData(key) {
  db.get(key, function(err, value) {
    if (err)
      return console.log('Not found!', err);
    console.log('Value = ' + value);
  })
}
// Add data to levelDB with value
function addDataToLevelDB(value) {
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

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  =============================================== */

class Block {
  constructor(data) {
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================ */

class Blockchain {
  constructor() {
    this.getBlock(0).then(() => {
      console.log('Genesis already exists.')
    }).catch(() => {
      this.addBlock(new Block("First block in the chain - Genesis block"));
    });
  }
  // Add new block
  async addBlock(newBlock) {
    // Block Height
    newBlock.height = await this.getBlockHeight().then(value => newBlock.height = value + 1);
    console.log('The block being created is number #' + newBlock.height + '\n');
    // Block Time
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // Previous Hash if Exists.
    if (newBlock.height >= 1) {
      await this.getBlock(newBlock.height - 1).then(value => newBlock.previousBlockHash = JSON.parse(value).hash);
    } else if (newBlock.height <= 0) {
      console.log('creating genesis block');
    }
    // New Hash
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // New Block added
    console.log(newBlock);
    await addDataToLevelDB(JSON.stringify(newBlock));
  }

  // Block Height
  async getBlockHeight() {
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
  // Get Block;
  async getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      db.get(blockHeight, function(err, value) {
        err != null
          ? reject(err)
          : resolve(value);
      });
    });
  }
  // Validate a block;
  async validateBlock(blockHeight) {
    let block = null;
    let result = null;
    await this.getBlock(blockHeight).then(value => JSON.parse(value)).then(value => block = JSON.stringify(value));
    block = JSON.parse(block);
    return new Promise((resolve, reject) => {
      let blockHash = block.hash;
      block.hash = '';
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      if (blockHash === validBlockHash) {
        console.log('Block #' + blockHeight + ' is valid:\n' + blockHash + '==' + validBlockHash);
        resolve(result = [true, blockHeight]);
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        resolve(result = [false, blockHeight]);
      }
    });
  }
  // Validate Full Chain Function;
  async validateChain() {
    let errorLog = [];
    let chainLog = [];
    let promises = [];
    let currentHeight = await this.getBlockHeight();
    for (var i = 0; i <= currentHeight-1; i++) {
      promises.push(this.validateBlock(i));
      let blockHash = null
      let previousHash = null;
      await this.getBlock(i).then(value => blockHash = JSON.parse(value).hash);
      await this.getBlock(i+1).then(value => previousHash = JSON.parse(value).previousBlockHash);
      if (blockHash !== previousHash) {
        let linkValidation = [];
        errorLog.push(linkValidation = [i, blockHash, previousHash]);
      }
    }
    Promise.all(promises).then(results => {
      results.map(results => chainLog.push(results));
    });
      chainLog.forEach(result => {
        if (result[0] == true) {
          console.log('ASAS Block #' + result[1] + "is valid.\n");
        } else {
          console.log('ASAS Block #' + result[1] + "is invalid.\n");
        }
      });
    if (errorLog.length > 0) {
      errorLog.forEach(result => {
        console.log('\nBlock #' + result[0] + " has invalid hash link. \n Hash is: '" + result[1] + "' and next block previous hash is: '" + result[2] + "'.");
      });
    } else {
      console.log('No errors detected');
    }
  }
}

/* ===== Testing ==============================================================|
|                                                                              |
|  =========================================================================== */
//First copy and paste in your node console the whole code above the Testing comment.

// Now follow theses steps:

// Create Blockchain;
let blockchain = new Blockchain();

// Populate the chain with 10 valid blocks;
(function theLoop(i) {
  setTimeout(function() {
    blockchain.addBlock(new Block("test data " + i));
    if (--i)
      theLoop(i);
    }
  , 100);
})(10);

// Validate Full Chain, everything fine.
blockchain.validateChain()

// Tamper with some blocks
let fakeBlocus = new Block("fakestu3123123 ff223")
fakeBlocus.hash = 'fake hash here'
fakeBlocus.previousBlockHash = 'broken previousHash'
addLevelDBData(1, JSON.stringify(fakeBlocus))

fakeBlocus = new Block("another fake one")
fakeBlocus.previousBlockHash = 'another broken previousHash'
addLevelDBData(5, JSON.stringify(fakeBlocus))

// Validate the chain again, and see an error pop:
blockchain.validateChain()

// If you want to clean DB and start again :)
async function deleteXBlocks(times) {
  for (var i = 0; i <= times; i++) {
    await db.del(i)
  }
}

deleteXBlocks(10)
