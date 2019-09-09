//import {connectionString} from "./.env"
//import config from '../config/environment'
require("dotenv").config();
const express = require("express")
const cors = require("cors")
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const app = express()
const port = process.env.PORT || 5000
const db_url = process.env.CONNECTION_STRING
const client = new MongoClient(db_url, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json())
app.use(cors())


//get leads by search, using two path params
app.get('/', (req, res) => {
  client.connect(err => {
    const collection = client.db("Casino").collection("Players");
    // perform actions on the collection object
    const results = collection
      .find({ [req.params.key]: req.params.value }) // Using [computed_property_name] for dynamic key naming
      .toArray((err, docs) => {
        res.send(docs);
      });

    client.close();
  });
});

//post new lead
app.post('/', (req, res) => {
  let input = req.body;
  if(input.action == "log in") {
    client.connect(err => {
      const collection = client.db("Casino").collection("Players");
      collection.find({ name: input.name }).toArray()
      .then( (thePlayers) =>  {
        console.log(thePlayers.length);
        let player = thePlayers[0];
        if(thePlayers.length < 1) {
          console.log("okokok")
          throw("user not found");
        }
        if( (player.password != input.password)) {
          throw("wrong password");
        }
        let returnPlayer = {};
        returnPlayer.name = player.name;
        returnPlayer.bank = player.bank;
        returnPlayer.id = player._id;
        res.send(returnPlayer);
        })
        .catch(error => {
          client.close(); 
          console.log(error);
          let errorMsg = {};
          if(error == "user not found") {
            console.log("wtf");
            errorMsg.msg = error;
          } else if(error == "wrong password") {
            errorMsg.msg = error;
          } else {
            errorMsg.msg = error.message;
          }
          console.log(errorMsg);
          return res.send(errorMsg);
        })
    })
  } else {
    client.connect(err => {
      const collection = client.db("Casino").collection("Players");
      collection.find({ name: input.name }).toArray()
      .then( (thePlayers) =>  {
        if(thePlayers.length > 0) {
          console.log("bout to YEET this error")
          throw(`user name: '${input.name} is already in use`);
        }
        let newPlayer = {};
        newPlayer.name = input.name;
        newPlayer.password = input.password;
        newPlayer.bank = input.bank;
        collection.insertOne(newPlayer, function(err, res2) {
          client.close();
          let returnMsg = {};
          returnMsg.msg = ('added player "' + input.name + '" you may now Log in');
          console.log(returnMsg.msg);
          return res.send(returnMsg);
        })
      })
        .catch(error => {
          client.close(); 
          console.log(error);
          let returnMsg = {};
          returnMsg.msg = (`The user "${input.name}" is already in use`);
          return res.send(returnMsg);
        })

        client.close();
      });
    }
  });


//update lead by ID
app.put('/', (req, res) => {
  const body = req.body;
  let input = req.body;
  if(input.id == -1) {
    return res.send("Can't save as guest");
  }
  client.connect(err => {
    const collection = client.db("Casino").collection("Players");
    try { collection.updateOne({_id: ObjectId(input.id)}, { $set: {bank: input.bank} }); } catch(e) {throw e.message}
    return res.send(body)
  });
});

//delete lead by ID
app.delete('/', (req, res) => {
  console.log("trying to delete");
  let input = req.body;
  client.connect(err => {
    const collection = client.db("Casino").collection("Players");
    collection.find({ name: input.name }).toArray()
    .then( (thePlayers) =>  {
      if(thePlayers.length < 1) {
        console.log("bad user")
        throw("User Not Found");
      }
      if(thePlayers[0].password != input.password) {
        console.log("bad pass");
        throw("Incorrect Password");
      }
      try { collection.deleteOne({"_id": thePlayers[0]._id}); } catch(e) {throw e.message}
        client.close();
        let returnMsg = {};
        returnMsg.msg = ('Deleted Player "' + input.name + '"');
        console.log(returnMsg.msg);
        return res.send(returnMsg);
    })
      .catch(error => {
        client.close(); 
        let errorMsg = {};
        if(error == "Incorrect Password") {
          console.log("wtf");
          errorMsg.msg = error;
        } else if(error == "User Not Found") {
          errorMsg.msg = error;
        } else {
          errorMsg.msg = error.message;
        }
        console.log(errorMsg);
        return res.send(errorMsg);
      })

      client.close();
    // });
  });
});


app.listen(port,() => {console.log(`Listening on port ${port}`)})
