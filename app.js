var express = require('express')
var bodyParser = require('body-parser')
//var errorhandler = require('errorHandler')

var app = express()

const Block = require("./block.js");
const Blockchain = require("./blockchain.js");

let blockchain = new Blockchain();

// function errorHandler(err, req, res, next) {
//   res.status(500);
//   res.render('error', { error: err });
// }

// const asyncHandler = fn => (req, res, next) =>
// Promise
//     .resolve(fn(req, res, next))
//     .catch(next)

// const awaitHandlerFactory = (middleware) => {
//   return async (req, res, next) => {
//     try {
//       await middleware(req, res, next)
//     } catch (err) {
//       next(err)
//     }
//   }
// }

// function logErrors(err, req, res, next) {
//   console.error(err.stack);
//   next(err);
// }
// app.use(logErrors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/block/:id', async function (req, res, next) {
  console.log('Request Type:', req.method);
  console.log('Parameters: ' + req.params.id);
  next();
})

app.get("/block/:id", function(req,res) {
  blockchain.getBlock(req.params.id)
    .then(function(result) {
    res.json(JSON.parse(result));
  })
  .catch(function(result) {
    return res.status(422).json( { errors: { id: "Block not found." }})
  })
})

app.post("/block", async function(req,res) {
    if(!req.body.data){
      return res.status(422).json( {errors: { data: "cannot be blank" }})
    }
    let blockus = new Block(req.body.data);
    let json_block = await blockchain.addBlock(blockus);
    res.send(json_block);
})

// Error Handlers
// 404
app.use(function(err, req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 500
app.use(function(err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({'errors': {
    message: err.message,
    error: err
  }});
});


app.listen(8000);
