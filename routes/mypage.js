const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares");
const { myPosts, myLikes } = require("../controllers/mypage");

router.get("/myposts", isLoggedIn, myPosts);
router.get("/mylikes", isLoggedIn, myLikes);

module.exports = router;
