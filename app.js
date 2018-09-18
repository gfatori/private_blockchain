var express = require('express')
var app = express()
const Block = require("./block.js").default;
//const Database = require("./database.js")

const Blockchain = require("./blockchain.js");

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

app.use(logErrors);
app.use(errorHandler);

app.use('/block/:id', async function (req, res, next) {
  console.log('Request Type:', req.method);
  console.log('Parameters: ' + req.params.id);
  next();
})

app.get('/block/:id', asyncHandler( (req, res, next) => {
  console.log('Chegamos no get');
  try {
  var blockchain = new Blockchain();
  let bosta = await blockchain.getBlock(req.params.id);
  bosta.then(results => {
    console.log(results);
    res.json('vsf');
    console.log('paprica.');  
    next();
  }).catch(err => logErrors(err));
  } catch (e) {
    next(e);
  }
  
  console.log('que merda.')
  //.then(value => JSON.parse(value))
  //.then(value => blockus = JSON.stringify(value))
  //.catch(e => console.error(e));
}));

app.listen(8000);
