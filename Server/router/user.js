const express = require('express');
const router = express.Router();
const {setUp, sendNotification} = require('../service/userService');

router.route("/user").get(setUp);
router.route("/sendnotifi").get(sendNotification);

module.exports = router;