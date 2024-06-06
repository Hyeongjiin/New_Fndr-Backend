const dotenv = require("dotenv");
const express = require("express");
const path = require("path"); // 경로 설정
const morgan = require("morgan");
const cors = require("cors");

const { sequelize } = require("./models");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

dotenv.config(); // .env의 내용이 process.env 안에 들어간다.
const mainRouter = require("./routes/main");
const authRouter = require("./routes/auth");
const jobRouter = require("./routes/job");
const detailRouter = require("./routes/detail");
const searchRouter = require("./routes/search");
const likesRouter = require("./routes/likes");
const mypageRouter = require("./routes/mypage");
const dataRouter = require("./routes/data");
const passportConfig = require("./passport");

const app = express();
passportConfig();

app.set("port", process.env.PORT || 8080);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware 순서에 따라서 작동이 달라진다.
app.use(morgan("dev")); // 로그 찍어주는 용도

const options = {
  origin: ["http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(options));
//app.use('/', express.static(__dirname, 'public')); // 요청 경로 와 실제 경로
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파싱을 간단하게 해주는 용도
app.use(express.json()); // req.body를 ajax json 요청으로 부터 쉽게 꺼내준다.
app.use(express.urlencoded({ extended: true })); // req.body를 form으로 부터 쉽게 꺼내준다. true면 qs, false면 querystring 사용
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false, // https 적용시 true
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    name: "connect.sid",
  })
);
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout
app.use(passport.session()); // connect.sid라는 이름으로 session 쿠키가 브라우저로 전송
// 브라우저에 connect.sid = randomvalue 전송
// 이후 브라우저가 요청할 때 session cookie를 보내면 그 정보를 바탕으로 user 정보를 복원시킨다.
// passport.deserializeUser 실행한다
app.use("/main", mainRouter);
app.use("/auth", authRouter);
app.use("/job", jobRouter);
app.use("/detail", detailRouter);
app.use("/search", searchRouter);
app.use("/likes", likesRouter);
app.use("/mypage", mypageRouter);
app.use("/data", dataRouter);

// 404 미들웨어
app.use((req, res, next) => {
  // 404 NOT FOUND
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});
// 에러처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {}; // 배포 시에는 에러 로그 서비스한테 넘긴다.
  res.status(err.status || 500);
  if (process.env.NODE_ENV === "production") {
    res.status(404).send("Not Found");
  } else {
    res.status(404).send({
      error: err.stack,
    });
  }
  //res.status(404).send('Not Found');
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 익스프레스 서버 실행`);
});
