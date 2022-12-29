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
const replySchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    postID: { type: String, required: true },
    body: { type: String, rquired: true },
    votes: { type: Number, required: true },
    date: { type: String, required: true },
    report: { type: Number, required: true },
    authorID: { type: String, required: true }
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
    attachment: { type: buffer_1.Buffer, required: false }
});
// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String
});
// 3. Create a Model.
const User = (0, mongoose_1.model)('User', userSchema);
const Post = (0, mongoose_1.model)('Post', postSchema);
const Reply = (0, mongoose_1.model)('Reply', replySchema);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // 4. Connect to MongoDB
        yield (0, mongoose_1.connect)('mongodb://127.0.0.1:27017/DB');
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
        attachment: req.body.attachment.data
    });
    console.log("we good");
    //await newPost.save();
    console.log("we good 2");
    res.send("Created");
}));
// Be careful of the query variables
app.get('/post/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feed = parseInt(req.query["feed"]);
    let channel = req.query["channel"];
    console.log(channel);
    if (feed === 0) {
        res.json(yield Post.find({ 'channel': channel }).sort({ votes: -1 }).limit(50));
    }
    else {
        res.json(yield Post.find({ 'channel': channel }).sort({ date: -1 }).limit(50));
    }
    console.log(yield Post.count());
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
    let channel = req.query["channel"];
    if (channel === "") {
        if (feed === 0) {
            res.json(yield Post.find({}).sort({ votes: -1 }).limit(50 * load));
        }
        else {
            res.json(yield Post.find({}).sort({ date: -1 }).limit(50 * load));
        }
    }
    else {
        if (feed === 0) {
            res.json(yield Post.find({ 'channel': channel }).sort({ votes: -1 }).limit(50 * load));
        }
        else {
            res.json(yield Post.find({ 'channel': channel }).sort({ date: -1 }).limit(50 * load));
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
    res.json(yield Reply.find({ 'postID': id }));
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
    res.send("New Reply");
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
app.get("/Delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Post.deleteMany({});
    res.send("everything deleted");
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
    path('email/send/', views.email_send),
    path('email/verify/', views.email_verify)
*/
app.listen(port, () => {
    run().catch(err => console.log(err));
    console.log("running");
    return console.log(`Express is listening at http://localhost:${port}`);
});
// For Running in production in a background process
// https://www.dev2qa.com/how-to-run-node-js-server-in-background/
// Image is not working right now till I figure out what is wrong
// I am going to work on the notification 
//# sourceMappingURL=app.js.map