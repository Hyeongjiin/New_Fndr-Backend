const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const { uploadPost, updatePost, deletePost } = require("../controllers/job");
const { isLoggedIn } = require("../middlewares");

try {
  fs.readdirSync("uploads");
} catch {
  fs.mkdirSync("uploads");
}

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "new-fndr",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      console.log("파일입니다", file);
      // 콜백 함수 두 번째 인자에 파일명(경로 포함)을 입력
      cb(null, `image/fndr${Date.now()}_${file.originalname}`);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
});

// 채용공고 등록
router.post("/", isLoggedIn, upload.single("company_logo"), uploadPost);

// 채용공고 수정
router.patch("/:id", isLoggedIn, upload.single("company_logo"), updatePost);

// 채용공고 삭제
router.delete("/:id", isLoggedIn, deletePost);

module.exports = router;
