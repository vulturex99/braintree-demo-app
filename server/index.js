const express = require('express');
const path = require('path');
const braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "46yxmpnym5pc7pq9",
  publicKey: "v3mgjvrqqtrsnnk2",
  privateKey: "4a34c38ba010ea85b6d3a3b23c47cd5c"
});

const app = express();
const port = 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.use(express.static(DIST_DIR));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());


app.get('/requestToken', async function(req, res) {
  try {
    gateway.clientToken.generate({}, function(err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/payment', async function(req, res) {
  try {
    const nonceFromTheClient = req.body.paymentMethodNonce;
    const price = req.body.price;
    const id = randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    var newTransaction = gateway.transaction.sale(
      {
        amount: price,
        paymentMethodNonce: nonceFromTheClient,
        orderId: id,
        options: {
          submitForSettlement: true,
          storeInVaultOnSuccess: true
        }
      },
      function(error, result) {
        // console.log(result.id,result.orderId);
        // console.log(result);
        if (result) {
          res.send(result);
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get('/ping', function(req, res) {
    res.send('Braintree backend is up and running');
});

app.get('/', (req, res) => {
 res.sendFile(HTML_FILE); 
});
app.listen(port, function () {
 console.log('App listening on port: ' + port);
});
