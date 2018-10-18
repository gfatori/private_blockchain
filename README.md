# Private Blockchain Notary Service

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and download the project dependencies.
```
npm install
```

### Express.js

Express.js is the API framework used in the project.


### Running the API Server

To run the api server:

```
node app.js
```

It will run on port 8000, on the adress: localhost:8000/

When you first run the app, it will create an instance of blockchain and create genesis block automatically.

If genesis already exists when you run the app, it won't create genesis again. If you need to reset the database, you can delete the chaindata and api_data folders.

### Api Documentation

To utilize the main interaction endpoints on this api you will need first to request validation for your Bitcoin Wallet Adress. After you ask for a validation, you will have a 5 minutes time window to validate it (or 300 seconds).

#### POST /requestValidation
```
{             
  "address": "5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss"
}
```

Example response:
```
{
    "registerStar": false,
    "status": {
        "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
        "requestTimeStamp": 1539815185049,
        "message": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax:1539815185049:starRegistry",
        "validationWindow": 300,
        "messageSignature": "pending"
    }
}
```

#### POST /message-signature-validate
After you request a validation to /requestValidation you will need to sign the message the API gives you in the *Bitcoin Blockchain* and send it to this endpoint.

```
{             
  "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
  "signature": "G1HgHYsq5i9U97c3au2n+LKXNSUzL6Ype82VMRceeUyxCqLM3v8XtLl0E2e0/JHwxvVxQ1IdtOWXgGepfbwzfdM="
}
```

Example response:
```
{
    "registerStar": true,
    "status": {
        "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
        "requestTimeStamp": 1539815185049,
        "message": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax:1539815185049:starRegistry",
        "validationWindow": 300,
        "messageSignature": "valid"
    }
}
```


#### GET /block/:id

Example response:
```
{
    "hash": "53ecbe64d16da7fcbac67f1af1ad3b84d97828b607e9efbbdb18834b1873a71c",
    "height": 6,
    "body": {
        "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
        "star": {
            "ra": "08h 22m 4.7s",
            "dec": "-5° 1' 22.9",
            "mag": 1,
            "story": "514c51574c5051574c5051574c505157504c51574c50"
        }
    },
    "time": "1539815277",
    "previousBlockHash": "4bb29cc83b113c2da0e96cb16386fe6a73fca8dea123b87590cced60f6b3ac09"
}
```
#### POST /block

Should contain header option:

Content-Type application/json

Example payload:

```
{
  "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
  "star": {
    "dec": "-5° 1' 22.9",
    "ra": "08h 22m 4.7s",
    "story": "QLQWLPQWLPQWLPQWPLQWLP",
    "mag": 1
  }
}
```

Example response:

```
{
    "hash": "3c2093effff1decb21ebbe70f1f3bccd810d733d7de34d210a02226ce40b21f0",
    "height": 7,
    "body": {
        "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
        "star": {
            "ra": "02h 12m 4.7s",
            "dec": "-8° 2' 22.9",
            "mag": 2,
            "story": "74657374696e6720746573747374737473"
        }
    },
    "time": "1539861703",
    "previousBlockHash": "53ecbe64d16da7fcbac67f1af1ad3b84d97828b607e9efbbdb18834b1873a71c"
}
```

#### GET /stars/address:address

You can fetch all the stars a determined wallet address has in the private-blockchain-notary-service

Example response:
```
[
    {
        "hash": "53ecbe64d16da7fcbac67f1af1ad3b84d97828b607e9efbbdb18834b1873a71c",
        "height": 6,
        "body": {
            "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
            "star": {
                "ra": "08h 22m 4.7s",
                "dec": "-5° 1' 22.9",
                "mag": 1,
                "story": "514c51574c5051574c5051574c505157504c51574c50"
            }
        },
        "time": "1539815277",
        "previousBlockHash": "4bb29cc83b113c2da0e96cb16386fe6a73fca8dea123b87590cced60f6b3ac09"
    },
    {
        "hash": "3c2093effff1decb21ebbe70f1f3bccd810d733d7de34d210a02226ce40b21f0",
        "height": 7,
        "body": {
            "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
            "star": {
                "ra": "02h 12m 4.7s",
                "dec": "-8° 2' 22.9",
                "mag": 2,
                "story": "74657374696e6720746573747374737473"
            }
        },
        "time": "1539861703",
        "previousBlockHash": "53ecbe64d16da7fcbac67f1af1ad3b84d97828b607e9efbbdb18834b1873a71c"
    }
]
```

#### GET /stars/hash:hash
You can fetch a determined star by providing its hash to this endpoint.

Example response:
```
{
    "hash": "53ecbe64d16da7fcbac67f1af1ad3b84d97828b607e9efbbdb18834b1873a71c",
    "height": 6,
    "body": {
        "address": "5Khms8qavF9DyvaGRMkyeAgQK132VQSkwYAJShLBZkgSewJr3Ax",
        "star": {
            "ra": "08h 22m 4.7s",
            "dec": "-5° 1' 22.9",
            "mag": 1,
            "story": "514c51574c5051574c5051574c505157504c51574c50"
        }
    },
    "time": "1539815277",
    "previousBlockHash": "4bb29cc83b113c2da0e96cb16386fe6a73fca8dea123b87590cced60f6b3ac09"
}
```
