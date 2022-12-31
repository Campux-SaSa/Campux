const express = require('express');
const router = express.Router();
const {setUp} = require('../service/userService');

router.route("/user").get(setUp);

module.exports = router;