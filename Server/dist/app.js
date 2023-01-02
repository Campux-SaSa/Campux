"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const buffer_1 = require("buffer");
const app = (0, express_1.default)();
// Configuring the body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
const port = 8000;
const mongoose_1 = require("mongoose");
const node_apn_1 = __importDefault(require("@parse/node-apn"));
const replySchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    postID: { type: String, required: true },
    body: { type: String, rquired: true },
    votes: { type: Number, required: true },
    date: { type: String, required: true },
    report: { type: Number, required: true },
    authorID: { type: String, required: true }
});
const attachmentSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    data: { type: buffer_1.Buffer, required: false }
});
const postSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String },
    campus: { type: String, required: true },
    date: { type: String, required: true },
    votes: { type: Number, required: true },
    authorID: { type: String, required: true },
    numOfReplies: { type: Number, required: true },
    numOfViews: { type: Number, required: true },
    channel: { type: String, required: true },
    report: { type: Number, required: true },
    attachment: { type: attachmentSchema, required: false },
    subscribers: { type: [String], required: false }
});
// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String
});
// 3. Create a Model.
const Post = (0, mongoose_1.model)('Post', postSchema);
const Reply = (0, mongoose_1.model)('Reply', replySchema);
const Attachment = (0, mongoose_1.model)('Attachment', attachmentSchema);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // 4. Connect to MongoDB
        yield (0, mongoose_1.connect)("mongodb://AzureDiamond:Parvardegar007Saghafian@localhost:27017/db?authSource=admin");
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Hello World!');
}));
//path('post/', views.post_crud),
// Todo: Getting the top 50 ordered by time
app.get('/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield Post.find({}).sort({ date: -1 }).limit(50));
}));
//Todo: Saving the req body as a Post to the database
app.post('/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attachment = req.body.attachment;
    console.log(req.body);
    if (req.body.attachment !== undefined) {
        yield Post.create({
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
            attachment: { id: req.body.attachment.id },
            subscribers: []
        });
        if (req.body.attachment.id !== "") {
            yield Attachment.create({
                id: req.body.attachment.id,
                data: req.body.attachment.data.data
            });
        }
    }
    else {
        yield Post.create({
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
            attachment: null,
            subscribers: []
        });
    }
    //await newPost.save();
    res.send("Created");
}));
// Be careful of the query variables
app.get('/post/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feed = parseInt(req.query["feed"]);
    let channel = req.query["channel"];
    //console.log(channel)
    if (feed === 0) {
        res.json(yield Post.find({ 'channel': channel }).sort({ votes: -1 }).limit(50));
    }
    else {
        res.json(yield Post.find({ 'channel': channel }).sort({ date: -1 }).limit(50));
    }
    //console.log(await Post.count())
}));
app.get("/post/popular", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield Post.find({}).sort({ votes: -1 }).limit(50));
}));
app.get("/post/report", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Post.findOneAndUpdate({ "id": id }, { $inc: { report: 1 } });
    res.send("Rported");
}));
app.get("/post/reply/report", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Reply.findOneAndUpdate({ "id": id }, { $inc: { report: 1 } });
    res.send("Rported");
}));
app.get("/post/up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Post.findOneAndUpdate({ "id": id }, { $inc: { votes: 1 } });
    res.send("UpVoted");
}));
app.get("/post/down", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Post.findOneAndUpdate({ "id": id }, { $inc: { votes: -1 } });
    res.send("UpVoted");
}));
app.get("/post/load", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feed = parseInt(req.query["feed"]);
    const load = parseInt(req.query["load"]);
    //console.log(feed)
    //console.log(load)
    let channel = req.query["channel"];
    if (channel === "") {
        if (feed === 0) {
            res.json(yield Post.find({}, { subscribers: 0 }).sort({ votes: -1 }).limit(50 * load));
        }
        else {
            res.json(yield Post.find({}, { subscribers: 0 }).sort({ date: -1 }).limit(50 * load));
        }
    }
    else {
        if (feed === 0) {
            res.json(yield Post.find({ 'channel': channel }, { subscribers: 0 }).sort({ votes: -1 }).limit(50 * load));
        }
        else {
            res.json(yield Post.find({ 'channel': channel }, { subscribers: 0 }).sort({ date: -1 }).limit(50 * load));
        }
    }
}));
app.get("/post/reply/up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Reply.findOneAndUpdate({ "id": id }, { $inc: { votes: 1 } });
    res.send("UpVoted");
}));
app.get("/post/reply/down", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Reply.findOneAndUpdate({ "id": id }, { $inc: { votes: -1 } });
    res.send("UpVoted");
}));
app.get("/post/reply", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    yield Post.findOneAndUpdate({ "id": id }, { $inc: { numOfViews: 1 } });
    res.json(yield Reply.find({ 'postID': id }, { subscribers: 0 }));
}));
app.post("/post/reply", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newReply = new Reply({
        id: req.body.id,
        postID: req.body.postID,
        body: req.body.body,
        votes: req.body.votes,
        date: req.body.date,
        report: req.body.report,
        authorID: req.body.authorID
    });
    yield newReply.save();
    yield Post.findOneAndUpdate({ "id": req.body.postID }, { $inc: { numOfReplies: 1 } });
    var note = new node_apn_1.default.Notification();
    //console.log(req.body)
    let post = yield Post.findOne({ "id": req.body.postID }, { title: 1, subscribers: 1, _id: 0 });
    console.log(post);
    let listOfTokens = yield userData.find({ "userID": { $in: post.subscribers } });
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = { title: post.title, body: newReply.body };
    // This payload is wehre the magic happens -> Navigating through the app
    note.payload = { 'messageFrom': 'John Appleseed', "Screen": 1 };
    note.topic = "com.saghaf.campux";
    //console.log(listOfTokens.length)
    listOfTokens.forEach(obj => {
        apnProvider.send(note, obj.deviceToken).then((result) => {
            // I have to remove the dead tokens here
        });
    });
    res.send("Notification sent");
}));
app.get("/post/reply/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    res.json(yield Reply.find({ 'postID': id }));
}));
// This is repetetive but IDK maybe it's been used
app.post("/post/reply/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newReply = new Reply({
        id: req.body.id,
        postID: req.body.postID,
        body: req.body.body,
        votes: req.body.votes,
        date: req.body.date,
        report: req.body.report,
        authorID: req.body.authorID
    });
    yield newReply.save();
    yield Post.findOneAndUpdate({ "id": req.body.postID }, { $inc: { numOfReplies: 1 } });
    res.send("New Reply");
}));
// This is an admin endpoint
app.get("/Delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Post.deleteMany({});
    res.send("everything deleted");
}));
//The iamge end point
app.get("/post/attachment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    const foundAtt = yield Attachment.findOne({ id: id }).exec();
    res.send(foundAtt);
}));
app.get("/post/subscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userID = req.query["userID"];
    let id = req.query["id"];
    yield Post.updateOne({ id: id }, { $push: { subscribers: [userID] } });
    console.log("Subscribing");
    res.send("You subscribed");
}));
app.get("/post/unsubscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userID = req.query["userID"];
    let id = req.query["id"];
    yield Post.updateOne({ id: id }, { $pull: { subscribers: [userID] } });
    res.send("You unsubscribe");
}));
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
var apnProvider = new node_apn_1.default.Provider(options);
// This needs to becoming from a database of tokens defnitely
let deviceToken = "A1F061D4E37FF96C5F6EA87EF08980370A358C5DC6AAE165269D89418F8D4567";
const UserData = new mongoose_1.Schema({
    userID: { type: String },
    deviceToken: { type: String }
});
const userData = (0, mongoose_1.model)('UserData', UserData);
// We probably need to figure out some JWT security later here
// The userData model is good for chat and other stuff probably 
app.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundUser = yield userData.findOne({ deviceToken: req.body.deviceToken }).exec();
    const newUserData = new userData({
        userID: req.body.userID,
        deviceToken: req.body.deviceToken
    });
    if (foundUser !== null) {
        res.send("UserData existed");
    }
    else {
        yield newUserData.save();
        res.send("New UserData");
    }
}));
// Send notification to users with the tokens that was stored in the database
app.get("/sendnotifi", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var note = new node_apn_1.default.Notification();
    //console.log(req.body)
    const listOfTokens = yield userData.find({});
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = req.body;
    // This payload is wehre the magic happens -> Navigating through the app
    note.payload = { 'messageFrom': 'John Appleseed', "Screen": 1 };
    note.topic = "com.saghaf.campux";
    //console.log(listOfTokens.length)
    listOfTokens.forEach(obj => {
        apnProvider.send(note, obj.deviceToken).then((result) => {
            // I have to remove the dead tokens here
        });
    });
    res.send("Notification sent");
}));
app.get(("/test"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log("Test worked");
    res.send("Fuck");
}));
app.get(("/tes"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log("Tes ");
    res.send("Fuck");
}));
// Keep this simple for now, this is a rabit hole, we have a websocket to implement, Ask Ali about notification about saved Posts
// Modifying Content in Newly Delivered Notifications, Basically figure out Notification Responses
// https://developer.apple.com/documentation/usernotifications/modifying_content_in_newly_delivered_notifications
app.listen(port, () => {
    run().catch(err => console.log(err));
    console.log("running");
    return console.log(`Express is listening at http://localhost:${port}`);
});
// For Running in production in a background process
// https://www.dev2qa.com/how-to-run-node-js-server-in-background/
// Image is not working right now till I figure out what is wrong
// I am going to work on the notification 
// My name is Eminem
// My name is SLimShady
//# sourceMappingURL=app.js.map