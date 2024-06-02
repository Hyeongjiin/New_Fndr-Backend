const express = require("express");
const passport = require("passport");
const { isLoggedIn } = require("../middlewares");
const { likes, dislikes } = require("../controllers/likes");
const router = express.Router();

// likes/~
router.post("/:id", isLoggedIn, likes);
router.delete("/:id", isLoggedIn, dislikes);

module.exports = router;
