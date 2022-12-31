import express from 'express';
import { Buffer } from 'buffer';
const app = express();
// Configuring the body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const port = 8000;

import { Schema, model, connect } from 'mongoose';
import apn from '@parse/node-apn'
// 1. Create an interface representing a document in MongoDB.
interface IUser {
  name: string;
  email: string;
  avatar?: string;
}

interface IReply{
  id: string
  postID: string
  body: string
  votes: number
  date: string
  report: number
  authorID: string
}

const replySchema = new Schema<IReply>({
  id: {type: String, required: true},
  postID: {type: String, required: true},
  body: {type: String, rquired: true},
  votes: {type: Number, required: true},
  date: {type: String, required: true},
  report: {type: Number, required: true},
  authorID: {type: String, required: true}
})
interface IAttachment{
  id: string
  data: Buffer
}
const attachmentSchema = new Schema<IAttachment>({
  id: {type: String, required: true},
  data: {type: Buffer, required: false}
})

interface IPost{
     id: string
     title: string
     body?: string
     campus: string
     date: string
     votes: number
     authorID: string
     numOfReplies: number
     numOfViews: number
     channel: string
     report: number
     attachment?: IAttachment
}

const postSchema = new Schema<IPost>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  body: {type: String},
  campus: {type: String, required: true},
  date: {type: String, required: true},
  votes: {type: Number, required: true},
  authorID: {type: String, required: true},
  numOfReplies: {type: Number, required: true},
  numOfViews: {type: Number, required: true},
  channel: {type: String, required: true},
  report: {type: Number, required: true},
  attachment: {type: attachmentSchema, required: false}
})


// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

// 3. Create a Model.

const Post = model<IPost>('Post', postSchema);
const Reply = model<IReply>('Reply', replySchema);
const Attachment = model<IAttachment>('Attachment', attachmentSchema)

async function run() {
  // 4. Connect to MongoDB
  await connect("mongodb://AzureDiamond:Parvardegar007Saghafian@localhost:27017/db?authSource=admin");
}

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

//path('post/', views.post_crud),
// Todo: Getting the top 50 ordered by time
app.get('/post', async (req, res) => {
  res.json(await Post.find({}).sort({ date: -1 }).limit(50))
})
//Todo: Saving the req body as a Post to the database

app.post('/post', async (req, res) => {
  const attachment = (req.body.attachment as Buffer)
  console.log(req.body.attachment?.id)
  if(req.body.attachment !== null){
  await Post.create({
     id: req.body.id,
     title: req.body.title,
     body: req.body.body,
     campus: req.body.campus,
     date: req.body.date,
     votes: req.body.votes,
     authorID: req.body.authorID,
     numOfReplies: req.body.numOfReplies,
     numOfViews: req.body.numOfViews,
     channel: req.body.channel,
     report: req.body.report,
     attachment: {id: req.body.attachment.id}
  })
  if(req.body.attachment.id !== ""){
    await Attachment.create({
      id: req.body.attachment.id,
      data: req.body.attachment.data.data
    })
  }
}else{
  await Post.create({
    id: req.body.id,
    title: req.body.title,
    body: req.body.body,
    campus: req.body.campus,
    date: req.body.date,
    votes: req.body.votes,
    authorID: req.body.authorID,
    numOfReplies: req.body.numOfReplies,
    numOfViews: req.body.numOfViews,
    channel: req.body.channel,
    report: req.body.report,
    attachment: null
 })
 
}
  //await newPost.save();
  res.send("Created")
})

// Be careful of the query variables
app.get('/post/query', async (req, res) =>{
  const feed = parseInt(req.query["feed"] as string)
  let channel = req.query["channel"] as string
  //console.log(channel)
  if (feed === 0){
    res.json(await Post.find({'channel': channel}).sort({votes: -1}).limit(50))
  }else{
    res.json(await Post.find({'channel': channel}).sort({date: -1}).limit(50))
  }
  //console.log(await Post.count())
})

app.get("/post/popular", async (req, res) => {
  res.json(await Post.find({}).sort({votes: -1}).limit(50))
})

app.get("/post/report", async (req, res) => {
  let id = req.query["id"] as string

  await Post.findOneAndUpdate({"id": id}, {$inc: {report: 1}})
  res.send("Rported")
})

app.get("/post/reply/report", async (req, res) => {
  let id = req.query["id"] as string

  await Reply.findOneAndUpdate({"id": id}, {$inc: {report: 1}})
  res.send("Rported")
})

app.get("/post/up", async (req, res) => {
  let id = req.query["id"] as string

  await Post.findOneAndUpdate({"id": id}, {$inc: {votes: 1}})
  res.send("UpVoted")
})

app.get("/post/down", async (req, res) => {
  let id = req.query["id"] as string

  await Post.findOneAndUpdate({"id": id}, {$inc: {votes: -1}})
  res.send("UpVoted")
})

app.get("/post/load", async (req, res) => {
  
  const feed = parseInt(req.query["feed"] as string)
  const load = parseInt(req.query["load"] as string)
  //console.log(feed)
  //console.log(load)
  let channel = req.query["channel"] as string
  if(channel === ""){
    if(feed === 0){
      res.json(await Post.find({}).sort({votes: -1}).limit(50 * load))
    } else {
      res.json(await Post.find({}).sort({date: -1}).limit(50 * load))
    }
  }else{
    if(feed === 0){
      res.json(await Post.find({'channel': channel}).sort({votes: -1}).limit(50 * load))
    } else {
      res.json(await Post.find({'channel': channel}).sort({date: -1}).limit(50 * load))
    }
  }
})

app.get("/post/reply/up", async (req, res) => {
  let id = req.query["id"] as string
  await Reply.findOneAndUpdate({"id": id}, {$inc: {votes: 1}})
  res.send("UpVoted")
})

app.get("/post/reply/down", async (req, res) => {
  let id = req.query["id"] as string
  await Reply.findOneAndUpdate({"id": id}, {$inc: {votes: -1}})
  res.send("UpVoted")
})

app.get("/post/reply", async (req, res) => {
  let id = req.query["id"] as string

  await Post.findOneAndUpdate({"id": id}, {$inc: {numOfViews: 1}})
  res.json(await Reply.find({'postID': id}))
})

app.post("/post/reply", async (req, res) => {
  const newReply = new Reply({
    id: req.body.id,
    postID: req.body.postID,
    body: req.body.body,
    votes: req.body.votes,
    date: req.body.date,
    report: req.body.report,
    authorID: req.body.authorID
  })
  await newReply.save()
  await Post.findOneAndUpdate({"id": req.body.postID}, {$inc: {numOfReplies: 1}})
  res.send("New Reply")
})

app.get("/post/reply/update", async (req, res) => {
  let id = req.query["id"] as string

  res.json(await Reply.find({'postID': id}))
})

// This is repetetive but IDK maybe it's been used
app.post("/post/reply/update", async (req, res) => {
  const newReply = new Reply({
    id: req.body.id,
    postID: req.body.postID,
    body: req.body.body,
    votes: req.body.votes,
    date: req.body.date,
    report: req.body.report,
    authorID: req.body.authorID
  })
  await newReply.save()
  await Post.findOneAndUpdate({"id": req.body.postID}, {$inc: {numOfReplies: 1}})
  res.send("New Reply")
})

// This is an admin endpoint
app.get("/Delete", async (req, res) => {
  await Post.deleteMany({})
  res.send("everything deleted")
})

//The iamge end point
app.get("/post/attachment", async (req, res) => {
  console.log("fuck")
  let id = req.query["id"] as string
  
  const foundAtt = await Attachment.findOne({ id: id }).exec()
  res.send(foundAtt)
})

// The strings are tricky, I will get back to it
/*
    path('post/', views.post_crud), --> This is done
    path('post/search/', views.post_search), --> Not needed for now
    path('post/query/', views.post_query), --> Done
    path('post/popular/', views.post_popular), --> Done
    path('post/report/', views.post_report), --> Done
    path('post/reply/report/', views.reply_report), --> Done
    path('post/up/', views.post_upVote), --> Done
    path('post/down/', views.post_downVote), --> Done
    path('post/load/', views.post_load_more), --> Done
    path('post/reply/up/', views.reply_upVote), --> Done
    path('post/reply/down/', views.reply_downVote), --> Done
    path('post/reply/', views.reply_crud), --> Done
    path('post/reply/update/', views.reply_update), --> DONE
    path('email/send/', views.email_send), --> Done
    path('email/verify/', views.email_verify) --> Done
*/

// NOTIFICATION CODE STARTs
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



const UserData = new Schema({
  userID: {type: String},
  deviceToken: {type: String}
});

const userData = model('UserData', UserData);

// We probably need to figure out some JWT security later here
// The userData model is good for chat and other stuff probably 
app.post("/user", async (req, res) => {
  
  const foundUser = await userData.findOne({ deviceToken: req.body.deviceToken }).exec()
  const newUserData = new userData({
      userID: req.body.userID,
      deviceToken: req.body.deviceToken
  })
  if(foundUser !== null){
    res.send("UserData existed")
  }else{
    await newUserData.save()
    res.send("New UserData")
  }
  

})
import { NotificationAlertOptions } from '@parse/node-apn';

// Send notification to users with the tokens that was stored in the database
app.get("/sendnotifi", async (req, res) => {
  var note = new apn.Notification();
  //console.log(req.body)
  const listOfTokens = await userData.find({});
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 1;
  note.sound = "ping.aiff";
  note.alert = req.body
  // This payload is wehre the magic happens -> Navigating through the app
  note.payload = {'messageFrom': 'John Appleseed', "Screen": 1};
  note.topic = "com.saghaf.campux";
  //console.log(listOfTokens.length)
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
  run().catch(err => console.log(err));
  console.log("running")  
  return console.log(`Express is listening at http://localhost:${port}`);

});

// For Running in production in a background process
// https://www.dev2qa.com/how-to-run-node-js-server-in-background/

// Image is not working right now till I figure out what is wrong
// I am going to work on the notification 


// My name is Eminem
// My name is SLimShady