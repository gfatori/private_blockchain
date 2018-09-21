# Blockchain Data

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

If genesis already exists when you run the app, it won't create genesis again.

### Api Documentation

#### GET /block/:id

Example response:
```
{
    "hash": "3283d5da5c8a9ec932727ddcb1b1f08d14bece1f304d100a1efb5b0895cd6f52",
    "height": 2,
    "body": "testbody",
    "time": "1537550503",
    "previousBlockHash": "2248837799f10fcfb8994b3db7260bf1455d5b85f40af2295323e39c91306176"
}
```
#### POST /block

Should contain header option:

Content-Type application/json

Example payload:

```
{
  "data": "testing block body"
}
```
