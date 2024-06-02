const express = require("express");
const router = express.Router();
const { getPostPagination } = require("../controllers/search");

router.get("/:page", getPostPagination);

module.exports = router;
