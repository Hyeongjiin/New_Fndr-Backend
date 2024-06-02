exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // passport를 통해서 로그인 했는가?
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isLoggedInAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_authority === 0) {
    next();
  } else {
    res.status(403).send({
      Message: "관리자 권한이 필요합니다",
      ResultCode: "Admin_Login_Needed",
    });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인한 상태입니다.");
  }
};
