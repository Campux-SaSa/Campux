
import userDataSchema from "../schemas/userDataSchema";
const node_apn_1 = __importDefault(require("@parse/node-apn"));
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


exports.setUp = async(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const foundUser = yield userDataSchema.findOne({ deviceToken: req.body.deviceToken }).exec();
    const newUserData = new userDataSchema({
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
});

exports.sendNotification = async(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // notification instance
    var note = new node_apn_1.default.Notification();
    console.log(note)
    console.log(req.body);
    // fetching all the user data
    const listOfTokens = yield userDataSchema.find({});
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = req.body;
    // This payload is wehre the magic happens -> Navigating through the app
    note.payload = { 'messageFrom': 'John Appleseed', "Screen": 1 };
    note.topic = "com.saghaf.campux";
    console.log(listOfTokens.length);
    // loop over the tokens
    listOfTokens.forEach(obj => {
        apnProvider.send(note, obj.deviceToken).then((result) => {
            // see documentation for an explanation of result
            console.log(result);
        });
    });
    res.send("Notification sent");
});
