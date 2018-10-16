// Express, API and database.
var express = require('express')
var bodyParser = require('body-parser')
const Block = require("./block.js");
const Blockchain = require("./blockchain.js");
const BlockchainIDValidation = require("./id_validation.js");
var app = express();
// API Database.
let blockchainIDValidation = new BlockchainIDValidation();
// Blockchain and Bitcoin 
let blockchain = new Blockchain();
var bitcoin = require('bitcoinjs-lib');
var bitcoinMessage = require('bitcoinjs-message');
// Star
const Star = require("./star.js");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Log request parameters
app.use('/block/:id', async function (req, res, next) {
  console.log('Request Type:', req.method);
  console.log('Parameters: ' + req.params.id);
  next();
})

// Get Block by ID (height)
app.get("/block/:id", function (req, res) {
  blockchain.getBlock(req.params.id)
    .then(function (result) {
      res.json(JSON.parse(result));
    })
    .catch(function (result) {
      return res.status(404).json({ errors: { id: "Block not found." } })
    })
})

// Create Block/Star
app.post("/block", async function (req, res) {
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: "cannot be blank" } })
  }
  if (!req.body.star.dec) {
    return res.status(422).json({ errors: { dec: "cannot be blank" } })
  }
  if (!req.body.star.ra) {
    return res.status(422).json({ errors: { ra: "cannot be blank" } })
  }
  if (!req.body.star.story) {
    return res.status(422).json({ errors: { story: "cannot be blank" } })
  }
  // validates if address signature is valid.
  await blockchainIDValidation.is_address_signed(req.body.address)
  .then(value => signature = value)
  .catch(value => signature = value)
  if (!signature) {
    return res.status(422).json({ errors: { address: "This address didnt sign a message. Please start the validation process." } })
  }
  let star = new Star(req.body.star.dec, req.body.star.ra, req.body.star.story, req.body.star.mag, req.body.star.constellation);
  var body =  {
    "address": req.body.address,
     star
  }
  let blockus = new Block(body);
  let json_block = null;
  await blockchain.addBlock(blockus)
    .then(value => json_block = value)
    .catch();
  res.status(201).json(json_block);
})

// Requests validation message
app.post("/requestValidation", async function (req, res) {
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: "cannot be blank" } })
  }
  req.timestamp = Date.now();
  let validation_status = await blockchainIDValidation.create_validation_window(req.body.address, req.timestamp);
  if (!validation_status) {
    return res.status(422).json({ errors: { invalid_time_window: "Restart the message validation process." } })
  }
  res.json(validation_status);
})

// Validates the message signature.
app.post("/message-signature/validate", async function (req, res) {
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: "cannot be blank" } });
  }
  if (!req.body.signature) {
    return res.status(422).json({ errors: { signature: "cannot be blank" } });
  }
  let signature_status = null;
  await blockchainIDValidation.get_validation_status(req.body.address)
    .then(value => signature_status = JSON.parse(value))
    .catch(value => signature_status = null);
  if (!signature_status) {
    return res.status(422).json({ errors: { signature: "First ask for validation @ /requestValidation for signing your message." } });
  } else if (signature_status.registerStar === true) {
    return res.json(signature_status);
  }
  let remaining_window = await blockchainIDValidation.validate_time_window(signature_status.status.requestTimeStamp);
  if (!remaining_window) {
    return res.status(422).json({ errors: { window_expired: "Your time window for this message has expired. Restart the process." } })
  }

  let message = await blockchainIDValidation.create_message(req.body.address, signature_status.status.requestTimeStamp);
  var keyPair = bitcoin.ECPair.fromWIF(req.body.address)
  var privateKey = keyPair.privateKey;
  var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  console.log('User sent: ' + req.body.signature);
  console.log('Should be: ' + signature.toString('base64'));

  if (req.body.signature === signature.toString('base64')) {
    signature_status.registerStar = true;
    signature_status.status.messageSignature = "valid"
    blockchainIDValidation.create_validation_status(req.body.address, JSON.stringify(signature_status));
    return res.send(signature_status);
  } else {
    return res.status(422).json({ errors: { signature: "Your signature doesn't match. Please try again with correct signature." } })
  }
})

app.get("/stars/address::add", async function (req, res) {
  let bolovo = await blockchain.getBlocksByAddress(req.params.add)
    // if (value.body.address === req.params.add) {
    //   console.log('Batata = ' + value)
    // }
  // }
  res.json(bolovo);
  
  //  .then(function (result) {
  //    res.json(JSON.parse(result));
   // })
   // .catch(function (result) {
    //  return res.status(404).json({ errors: { address: "Embostelou." } })
   // })
})


// app.post("/cleandb", async function (req, res) {
//   await blockchain.cleanChain();
//   res.status(200);
//})

// Error Handlers
// 404
app.use(function (err, req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 500
app.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(err.status || 500);
  res.json({
    'errors': {
      message: err.message,
      error: err
    }
  });
});

app.listen(8000);
