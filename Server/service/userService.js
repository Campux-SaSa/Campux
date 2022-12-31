
import userDataSchema from "../schemas/userDataSchema";

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

