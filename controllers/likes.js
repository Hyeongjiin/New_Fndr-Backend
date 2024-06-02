const RecruitPost = require("../models/recruit_post");

exports.likes = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const post = await RecruitPost.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        Message: "존재하지 않는 채용공고입니다.",
        ResultCode: "JobPost_Not_Exist",
      });
    }

    const exlike = await post.hasUser(userId);

    if (exlike) {
      return res.send({
        Message: "이미 좋아요 등록된 상태입니다.",
        ResultCode: "Already_Liked_Post",
      });
    } else {
      likes = await post.addUser(userId);
      return res.send({
        Message: "좋아요 등록이 완료되었습니다.",
        ResultCode: "LikesToPost_Create_Success",
        Response: likes,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "좋아요 등록 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.dislikes = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const post = await RecruitPost.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({
        Message: "존재하지 않는 채용공고입니다.",
        ResultCode: "JobPost_Not_Exist",
      });
    }

    const exlike = await post.hasUser(userId);
    if (exlike) {
      const dislikes = await post.removeUser(userId);
      return res.send({
        Message: "좋아요 취소가 완료되었니다.",
        ResultCode: "LikesToPost_Delete_Success",
        Response: dislikes,
      });
    } else {
      return res.send({
        Message: "좋아요가 등록되지 않은 채용공고입니다.",
        ResultCode: "Likes_Not_Posted_Post",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "좋아요 해제 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
