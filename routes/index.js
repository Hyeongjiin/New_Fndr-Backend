const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const authRouter = require("./auth");
const jobRouter = require("./job");
const detailRouter = require("./detail");
const searchRouter = require("./search");
const likesRouter = require("./likes");
const mypageRouter = require("./mypage");
const dataRouter = require("./data");

router.use("/main", mainRouter);
router.use("/auth", authRouter);
router.use("/job", jobRouter);
router.use("/detail", detailRouter);
router.use("/search", searchRouter);
router.use("/likes", likesRouter);
router.use("/mypage", mypageRouter);
router.use("/data", dataRouter);

module.exports = router;
