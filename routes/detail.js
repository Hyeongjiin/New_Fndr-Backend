const express = require("express");
const router = express.Router();
const { getDetail } = require("../controllers/detail");

router.get("/:id", getDetail);

module.exports = router;
