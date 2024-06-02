const express = require("express");
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  join,
  login,
  logout,
  getSession,
  account,
  password,
  passwordCheck,
} = require("../controllers/auth");

const router = express.Router();

// auth/~
router.post("/join", isNotLoggedIn, join);
router.post("/login", isNotLoggedIn, login);
router.get("/logout", isLoggedIn, logout);

// GET /auth/session - session 확인 (로그인이 유효한지 확인)
router.get("/session", getSession);

// DELETE /auth/account - 회원탈퇴 기능
router.delete("/account", isLoggedIn, account);

// POST /auth/password - 비밀번호 확인 기능
router.post("/password", isLoggedIn, passwordCheck);

// PATCH /auth/password - 비밀번호 변경
router.patch("/password", isLoggedIn, password);

module.exports = router;
