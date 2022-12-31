const mongoose_1 = require("mongoose")

const UserData = new mongoose_1.Schema({
    userID: { type: String },
    deviceToken: { type: String }
});

module.exports = mongoose_1.model('UserData', UserData)