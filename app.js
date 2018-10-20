// Express, API and database.
var express = require('express')
var bodyParser = require('body-parser')
const Block = require('./block.js')
const Blockchain = require('./blockchain.js')
const BlockchainIDValidation = require('./id_validation.js')
var app = express()
// API Database.
let blockchainIDValidation = new BlockchainIDValidation()
// Blockchain and Bitcoin
let blockchain = new Blockchain()
// var bitcoin = require('bitcoinjs-lib')
var bitcoinMessage = require('bitcoinjs-message')
// Star
const Star = require('./star.js')

function decode_story(story) {
  return Buffer.from(story, 'hex').toString('ascii')
}
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Log request parameters
// app.use('/block/:id', async function (req, res, next) {
//   console.log('Request Type:', req.method)
//   console.log('Parameters: ' + req.params.id)
//   next()
// })

// Get Block by ID (height)
app.get('/block/:id', function (req, res) {
  blockchain.getBlock(req.params.id)
    .then(function (result) {
      let response = JSON.parse(result)
      response.body.star.story = decode_story(response.body.star.story)
      res.json(response)
    })
    .catch(function (result) {
      return res.status(404).json({ errors: { id: 'Block not found.' } })
    })
})

app.get('/stars/address::address', async function (req, res) {
  if (!req.params.address) {
    return res.status(422).json({ errors: { address: 'cannot be blank' } })
  }
  let response = await blockchain.getBlocksByAddress(req.params.address)
  for (let value of response) {
    value.body.star.story = decode_story(value.body.star.story)
  }
  res.status(200).json(response)
})

app.get('/stars/hash::hash', async function (req, res) {
  if (!req.params.hash) {
    return res.status(422).json({ errors: { hash: 'cannot be blank' } })
  }
  let response = await blockchain.getBlockByHash(req.params.hash)
  response.body.star.story = decode_story(response.body.star.story)
  res.status(200).json(response)
})
// Create Block/Star
app.post('/block', async function (req, res) {
  function isASCII (str) {
    return /^[\x00-\x7F]*$/.test(str)
  }
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: 'cannot be blank' } })
  }
  if (!req.body.star.dec) {
    return res.status(422).json({ errors: { dec: 'cannot be blank' } })
  }
  if (!req.body.star.ra) {
    return res.status(422).json({ errors: { ra: 'cannot be blank' } })
  }
  if (!req.body.star.story) {
    return res.status(422).json({ errors: { story: 'cannot be blank' } })
  } else if (req.body.star.story.length > 250 || !isASCII(req.body.star.story)) {
    return res.status(422).json({ errors: { story: 'Should have maximum 250 characters, and must contain only ASCII characters.' } })
  }
  // validates if address signature is valid.
  let signature = null
  await blockchainIDValidation.is_address_signed(req.body.address)
    .then(value => { signature = value })
    .catch(value => { signature = value })
  if (!signature) {
    return res.status(422).json({ errors: { address: 'This address didnt sign a message. Please start the validation process.' } })
  }
  let star = new Star(req.body.star.dec, req.body.star.ra, req.body.star.story, req.body.star.mag, req.body.star.constellation)
  var body = {
    'address': req.body.address,
    star
  }
  let blockus = new Block(body)
  let jsonBlock = null
  await blockchain.addBlock(blockus)
    .then(value => { jsonBlock = value })
    .catch()
  // Resets validation status, as asked by code-review, a new star requires a new validation.
  await blockchainIDValidation.remove_validation_status(req.body.address)
  res.status(201).json(jsonBlock)
})
// Requests validation message
app.post('/requestValidation', async function (req, res) {
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: 'cannot be blank' } })
  }
  req.timestamp = Date.now()
  let validationStatus = await blockchainIDValidation.create_validation_window(req.body.address, req.timestamp)
  if (!validationStatus) {
    return res.status(422).json({ errors: { invalid_time_window: 'Restart the message validation process.' } })
  }
  res.json(validationStatus)
})

// Validates the message signature.
app.post('/message-signature/validate', async function (req, res) {
  if (!req.body.address) {
    return res.status(422).json({ errors: { address: 'cannot be blank' } })
  }
  if (!req.body.signature) {
    return res.status(422).json({ errors: { signature: 'cannot be blank' } })
  }
  let signatureStatus = null
  await blockchainIDValidation.get_validation_status(req.body.address)
    .then(value => { signatureStatus = JSON.parse(value) })
    .catch(value => { signatureStatus = null })
  if (!signatureStatus) {
    return res.status(422).json({ errors: { signature: 'First ask for validation @ /requestValidation for signing your message.' } })
  } else if (signatureStatus.registerStar === true) {
    return res.json(signatureStatus)
  }
  let remainingWindow = await blockchainIDValidation.validate_time_window(signatureStatus.status.requestTimeStamp)
  if (!remainingWindow) {
    blockchainIDValidation.remove_validation_status(req.body.address)
    return res.status(422).json({ errors: { window_expired: 'Your time window for this message has expired. Restart the process.' } })
  }

  let message = await blockchainIDValidation.create_message(req.body.address, signatureStatus.status.requestTimeStamp)
  var isValid = bitcoinMessage.verify(message, req.body.address, req.body.signature)
  console.log('User sent: ' + req.body.signature)

  if (isValid) {
    signatureStatus.registerStar = true
    signatureStatus.status.messageSignature = 'valid'
    blockchainIDValidation.create_validation_status(req.body.address, JSON.stringify(signatureStatus))
    return res.send(signatureStatus)
  } else {
    return res.status(422).json({ errors: { signature: "Your signature doesn't match. Please try again with correct signature." } })
  }
})

// Error Handlers
// 404
app.use(function (err, req, res, next) {
  err = new Error('Not Found')
  err.status = 404
  next(err)
})

// 500
app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(err.status || 500)
  res.json({
    'errors': {
      message: err.message,
      error: err
    }
  })
})

app.listen(8000)
