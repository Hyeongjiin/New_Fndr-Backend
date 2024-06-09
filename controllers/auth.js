const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");

// POST /auth/join
exports.join = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    let check = 1;
    if (process.env.NODE_ENV === "production") {
      check = 2;
    }
    const exUser = await User.findOne({ where: { user_email: email } });
    if (exUser) {
      return res.send({
        Message: "이미 존재하는 이메일입니다.",
        ResultCode: "Email_Exists",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      user_email: email,
      user_name: name,
      user_password: hash,
    });
    return res.send({
      Message: "회원가입이 완료되었습니다.",
      ResultCode: "Signup_Success",
      Check: check,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "회원가입시 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

// POST /auth/login
exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      // 서버 실패
      console.error(authError);
      return res.status(500).send({
        Message: "로그인 서버 실패",
        ResultCode: "ERR_INTERNAL_SERVER",
      });
    }
    if (!user) {
      // 로직 실패
      console.log(info.code);
      if (info.code == 1) {
        return res.send({
          Message: info.message,
          ResultCode: "Wrong_Password",
        });
      } else if (info.code == 2) {
        return res.send({
          Message: info.message,
          ResultCode: "User_NotExist",
        });
      }
    }
    return req.login(user, (loginError) => {
      // 로그인 성공
      if (loginError) {
        console.log("로그인 에러 발생");
        console.error(loginError);
        return next(loginError);
      }
      return res.send({
        Message: "로그인이 완료되었습니다.",
        ResultCode: "Login_Success",
        user: {
          id: user.id,
          email: user.user_email,
          name: user.user_name,
        },
      });
    });
  })(req, res, next); // middleware 확장 패턴
};

// POST /auth/logout
exports.logout = (req, res, next) => {
  // session cookie를 삭제한다. 브라우저에 sconnect.id가 있어도 이제 소용없다.
  req.logout(() => {
    req.session.destroy();
    res.clearCookie("connect.sid", { path: "/" });
    res.send({
      Message: "로그아웃이 완료되었습니다.",
      ResultCode: "Logout_Success",
    });
  });
};

exports.getSession = async (req, res, next) => {
  try {
    console.log(req.user);
    console.log(req.session);
    if (req.session && req.session.passport && req.session.passport.user) {
      res.send({
        Message: "세션이 존재합니다.",
        ResultCode: "Session_Exist",
        result: true,
        user: req.session.user,
        user_id: req.user.id,
      });
    } else {
      res.send({
        Message: "세션이 없습니다",
        ResultCode: "Session_Not_Exist",
        result: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "세션 확인 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.account = async (req, res, next) => {
  try {
    const delete_id = req.user.id;
    const exUser = await User.findOne({ where: { id: delete_id } });
    if (exUser) {
      const deleteAccount = await User.destroy({
        where: { id: delete_id },
      });
      return res.send({
        Message: "회원탈퇴가 완료되었습니다.",
        ResultCode: "Account_Delete_Success",
      });
    }
    return res.send({
      Message: "존재하지 않는 회원입니다.",
      ResultCode: "Account_Not_Exist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "회원탈퇴 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.passwordCheck = async (req, res, next) => {
  try {
    const id = req.user.id;
    const password = req.body.password;
    const exUser = await User.findOne({ where: { id: id } });
    if (exUser) {
      const result = await bcrypt.compare(password, exUser.user_password);
      if (result) {
        return res.send({
          Message: "비밀번호가 일치합니다.",
          ResultCode: "Password_Match",
        });
      } else {
        return res.send({
          Message: "비밀번호가 일치하지 않습니다.",
          ResultCode: "Password_Not_Match",
        });
      }
    } else {
      return res.send({
        Message: "존재하지 않는 회원입니다.",
        ResultCode: "Account_Not_Exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "비밀번호 확인 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.password = async (req, res, next) => {
  try {
    const id = req.user.id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const exUser = await User.findOne({ where: { id: id } });
    if (exUser) {
      const result = await bcrypt.compare(
        currentPassword,
        exUser.user_password
      );
      if (result) {
        const hash = await bcrypt.hash(newPassword, 12);
        await User.update(
          { user_password: hash },
          {
            where: { id: id },
          }
        );
        return res.send({
          Message: "비밀번호 변경이 완료되었습니다.",
          ResultCode: "Password_Change_Success",
        });
      } else {
        return res.send({
          Message: "비밀번호가 일치하지 않습니다.",
          ResultCode: "Password_Not_Match",
        });
      }
    } else {
      return res.send({
        Message: "존재하지 않는 회원입니다.",
        ResultCode: "Account_Not_Exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "비밀번호 변경 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.nickname = async (req, res, next) => {
  try {
    const id = req.user.id;
    const nickname = req.body.nickname;
    const exUser = await User.findOne({ where: { id: id } });
    if (exUser) {
      await User.update(
        { user_name: nickname },
        {
          where: { id: id },
        }
      );
      return res.send({
        Message: "이름 변경이 완료되었습니다.",
        ResultCode: "Nickname_Change_Success",
      });
    } else {
      return res.send({
        Message: "존재하지 않는 회원입니다.",
        ResultCode: "Account_Not_Exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "이름 변경 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
