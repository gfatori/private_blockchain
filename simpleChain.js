const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

function getLevelDBData(key){
  db.get(key, function(err, value) {
    if (err) return console.log('Not found!', err);
    console.log('Value = ' + value);
  })
}

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

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

class Blockchain{
  constructor(){
		this.getBlock(0).then(
			() => {
				console.log('Genesis already exists.')
			}
		).catch(
			() => {
				this.addBlock(new Block("First block in the chain - Genesis block"));
			})
  }

async addBlock(newBlock){
  newBlock.height = await this.getBlockHeight().then(value => newBlock.height = value+1);
  console.log('The block being created is number #' + newBlock.height + '\n')
  newBlock.time = new Date().getTime().toString().slice(0,-3);
  if(newBlock.height>=1){
    await this.getBlock(newBlock.height-1).then(
      value => newBlock.previousBlockHash = JSON.parse(value).hash
    )
  } else if (newBlock.height<=0) {
    console.log('creating genesis block (?)');
  }
  newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
  console.log(newBlock);
  await addDataToLevelDB(JSON.stringify(newBlock))
}

getBlockHeight(){
  let currentHeight = 0;
  return new Promise((resolve, reject) => {
      db.createReadStream().on('data', function (data) {
          currentHeight++;
      }).on('error', function (err) {
          return console.log('Unable to get block height', err);
          reject(err);
      }).on('close', function () {
          currentHeight = currentHeight-1
          console.log('Found block height ' + currentHeight);
          resolve(currentHeight);
      });
    })
}

  getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      db.get(blockHeight, function (err, value) {
        err != null ? reject(err) : resolve(value);
        })
      })
    }

    async validateBlock(blockHeight){
      let block = null;
      await this.getBlock(blockHeight).then(
        value => JSON.parse(value)
      ).then(value => block = JSON.stringify(value));
      console.log('\n' + 'I have this guy: \n' + block)
      block = JSON.parse(block)
      return new Promise((resolve, reject) => {
        let blockHash = block.hash;
        block.hash = '';
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        if (blockHash===validBlockHash) {
            resolve(true);
            console.log('Block #'+blockHeight+' is valid:\n'+blockHash+'=='+validBlockHash);
          } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            reject(false);
          }
        });
    }

    async validateChain(){
      let errorLog = [];
      setTimeout(async function () {
        for (var i = 0; i < var lenght = await this.getBlockHeight().then(value => length = value; i++) {
          if (!this.validateBlock(i))errorLog.push(i);
          let blockHash = await this.getBlock(i).then(
            value => blockHash = JSON.parse(value).hash
          )
          let previousHash = await this.getBlock(i+1).then(
            value => blockHash = JSON.parse(value).hash
          )
          if (blockHash!==previousHash) {
            errorLog.push(i);
          }
        }
      }), 100);
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
  }

///// Tests
let blockchain = new Blockchain();

(function theLoop (i) {
  setTimeout(function () {
    blockchain.addBlock(new Block("test data "+i));
    if (--i) theLoop(i);
  }, 100);
})(10);


addXBlocks(5)
deleteXBlocks(11)

async function deleteXBlocks(times) {
  for (var i = 0; i <= times; i++) {
    await db.del(i)
  }
}
