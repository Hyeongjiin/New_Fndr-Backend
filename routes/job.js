const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares");
const { uploadPost, updatePost, deletePost } = require("../controllers/job");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

try {
  fs.readdirSync("uploads");
} catch {
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 채용공고 등록
router.post("/", isLoggedIn, upload.single("company_logo"), uploadPost);

// 채용공고 수정
router.patch("/:id", isLoggedIn, upload.single("company_logo"), updatePost);

// 채용공고 삭제
router.delete("/:id", isLoggedIn, deletePost);

module.exports = router;
