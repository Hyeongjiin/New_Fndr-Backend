const passport = require("passport");
const local = require("./localStrategy");
const User = require("../models/user");

module.exports = () => {
  // req.login시 실행되는 부분
  passport.serializeUser((user, done) => {
    done(null, user.id); // user id만 추출
  });
  // session { random value(session cookie): 1(user id) } -> memory에 저장된다. (메모리의 크기는 제한되어 있으니까 id만 저장한다)
  // 사용자 아이디만 저장해서 req.session 생성
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err)); // req.user
  });

  local();
};
