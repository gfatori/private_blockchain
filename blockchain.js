/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  ========================================================= */
const SHA256 = require('crypto-js/sha256');
const Database = require("./database.js");
const database = new Database();
const Block = require("./block.js");

module.exports = class Blockchain {
  constructor() {
      this.getBlock(1).then(() => {
        console.log('Genesis already exists.')
      }).catch((err) => {
        console.log(err)
        this.addBlock(new Block("First block in the chain - Genesis block"));
      });
  }
  // Add new block
  async addBlock(newBlock) {
    // Block Height
    newBlock.height = await this.getBlockHeight()
    .then(value => newBlock.height = value + 1)
    .catch(() => console.log("error, couldn't find block height"));
    console.log('The block being created is number #' + newBlock.height + '\n');
    // Block Time
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // Previous Hash if Exists.
    if (newBlock.height > 1) {
      await this.getBlock(newBlock.height - 1).then(value => newBlock.previousBlockHash = JSON.parse(value).hash);
    } else if (newBlock.height <= 1) {
      console.log('creating genesis block');
    }
    // New Hash
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // New Block added
    console.log(newBlock);
    await database.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
    return newBlock;
  }

  // Block Height
  async getBlockHeight() {
    return await database.countLevelDBData();
  }
  // Get Block;
  async getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      database.getLevelDBData(blockHeight, function(err, value) {
        console.log(err,value);
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
          console.log('Block #' + result[1] + "is valid.\n");
        } else {
          console.log('Block #' + result[1] + "is invalid.\n");
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
