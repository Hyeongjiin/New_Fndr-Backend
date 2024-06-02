const express = require("express");
const router = express.Router();
const { isLoggedInAdmin } = require("../middlewares");
const { arbeitPost, web3Post } = require("../controllers/data");

router.post("/arbeit", isLoggedInAdmin, arbeitPost);
router.post("/web3", isLoggedInAdmin, web3Post);

module.exports = router;
