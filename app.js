var express = require('express')
var app = express()
const Block = require("./block.js");
const Database = require("./database.js")
const Blockchain = require("./blockchain.js");

app.get('/block/:id', function (req, res) {
  var blockchain = new Blockchain();
  console.log('Request Type:', req.method);
  console.log('Parameters: ' + req.params.id);
  var blockus = null;
    var balacobaco = blockchain.getBlock(req.params.id);
    balacobaco.then(function(result) {
      blockus = result;
      console.log("We got a block boyz.");
      return blockus;
  }).then(function(result) {
     stri = 'This are some shit you wanna see: \n'
     console.log(stri);
     res.setHeader('Content-Type', 'application/json');
     return res.json(stri + result);
    });
    //next();
})

app.listen(8000)
