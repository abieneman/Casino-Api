const express = require("express")
const cors = require("cors")
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const app = express()
const port = process.env.PORT || 5000
const db_url = "mongodb+srv://Admin:myPassword@mycluster-2mwkd.mongodb.net/Casino?retryWrites=true&w=majority"
  //"mongodb+srv://instructor:g7VppVh2tnXlfsNS@helio-slc-uocvs.mongodb.net/jobTracker?retryWrites=true&w=majority";
  

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
  if(input.action = "log in") {
    client.connect(err => {
      const collection = client.db("Casino").collection("Players");
      collection.find({ name: input.name }).toArray()
      .then( (thePlayers) =>  {
        let player = thePlayers[0];
        console.log("here");
        if(thePlayers.length < 1) {
          console.log('double here');
        }
        if( (player.password != input.password) || (player == undefined)) {
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
          let errorMsg = {};
          if(error == "wrong password") {
            errorMsg.msg = error;
          } else {
            errorMsg.msg = error.message;
          }
          console.log(errorMsg);
          return res.send(errorMsg);
        })
    })
  } else {
    // client.connect(err => {
    //   const collection = client.db("Casino").collection("Players");
    //   collection.find({ name: input.name }).toArray()
    //   .then( (thePlayers) =>  {
    //     let player = thePlayers[0];
    //     let returnPlayer = {};
    //     returnPlayer.name = player.name;
    //     returnPlayer.bank = player.bank;
    //     returnPlayer.id = player._id;
    //     res.send(returnPlayer);
    //     })
    //     .catch(error => {
    //       client.close(); 
    //       let errorMsg = {};
    //       if(error == "wrong password") {
  }

  client.close();
});


//update lead by ID
app.put('/', (req, res) => {
  const body = req.body;
  /*
  client.connect(async err => {
    const collection = client.db("jobTracker").collection("Leads");
    // perform actions on the collection object
    const results = await collection.updateOne({_id: ObjectId(req.params.ID)},{$set: body});
    res.send(results);

    client.close();
    });
    */
   return res.send(body)
});

//delete lead by ID
app.delete('/', (req, res) => {
    /*
  client.connect(async err => {
    const collection = client.db("jobTracker").collection("Leads");
    // perform actions on the collection object
    const results = await collection.deleteOne({_id: ObjectId(req.params.ID)});
    res.send(results);

    client.close();
  });
  */
  res.send("deleted the thingThang")
});


app.listen(port,() => {console.log(`Listening on port ${port}`)})
