import express from 'express';
const app = express()

import bodyParser from 'body-parser';
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const port = 4000;
import { Schema, model, connect } from 'mongoose';
// apple push notificaton
import apn from '@parse/node-apn'

// the info that is used to instantiate an instance of apple push notifocation
// the token values is used when we set our account
var options = {
    token: {
        key: "./cert/AuthKey_3FNCPL649B.p8",
        // These need to be env file
        keyId: "3FNCPL649B",
        teamId: "A6JH7Q9Q2D"
    },
    production: false
};

var apnProvider = new apn.Provider(options);

// This needs to becoming from a database of tokens defnitely
let deviceToken = "A1F061D4E37FF96C5F6EA87EF08980370A358C5DC6AAE165269D89418F8D4567"

var note = new apn.Notification();


async function run() {
    // 4. Connect to MongoDB
    await connect('mongodb://127.0.0.1:27017/DB');
}

const UserData = new Schema({
    userID: String,
    deviceToken: String
});

const userData = model('UserData', UserData);

app.post("/user", async (req, res) => {
    const newUserData = new userData({
        userID: req.body.userID,
        deviceToken: req.body.deviceToken
    })
    await newUserData.save()
    res.send("New UserData")
    console.log("New UserData")
    console.log(`Num of tokens ${ await userData.count()}`)
    
})

app.get("/sendnotifi", async (req, res) => {
    const listOfTokens = await userData.find({});
    console.log(listOfTokens)
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = "You have a new message";

    note.payload = {'messageFrom': 'John Appleseed'};
    note.topic = "com.saghaf.campux";

    listOfTokens.forEach(obj => {
        apnProvider.send(note, obj.deviceToken).then( (result) => {
            // see documentation for an explanation of result
            console.log(result)
        });
    })
    res.send("Notification sent")
        
})

// Keep this simple for now, this is a rabit hole, we have a websocket to implement, Ask Ali about notification about saved Posts
// Modifying Content in Newly Delivered Notifications, Basically figure out Notification Responses
// https://developer.apple.com/documentation/usernotifications/modifying_content_in_newly_delivered_notifications


app.listen(port, () => {
    run().catch(err => console.log(err))
    return console.log(`Express is listening at http://localhost:${port}`);
    apnProvider.shutdown();
});


// Source: https://www.npmjs.com/package/@parse/node-apn?activeTab=readme#quick-start



// Notification needs to be a server
//
// Make The Notification an express server so we can send notification over internet
// Set up a database for the device tokens for sending notification to everyone
// Figure out the media thing with HLS, Make it work
// We figure out chat later