const RecruitPost = require("../models/recruit_post");
const User = require("../models/user");

exports.myPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await RecruitPost.findAll({
      attributes: [
        "id",
        "nation_id",
        "company_name",
        "company_logo",
        "description_title",
        "is_visa_sponsored",
        "is_remoted",
        "location",
        "posted_date",
      ],
      where: {
        creator_id: userId,
      },
      order: [["posted_date", "DESC"]],
    });
    if (post.length == 0) {
      return res.status(404).json({
        Message: "작성한 채용공고가 존재하지 않습니다.",
        ResultCode: "JobPost_Not_Exist",
      });
    } else {
      return res.send({
        Message: "Success",
        ResultCode: "JobPost_Exist",
        Response: post,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "작성한 채용공고 조회 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.myLikes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const posts = await User.findAll({
      where: { id: userId },
      include: [
        {
          model: RecruitPost,
          attributes: [
            "id",
            "nation_id",
            "company_name",
            "company_logo",
            "description_title",
            "is_visa_sponsored",
            "is_remoted",
            "location",
            "posted_date",
          ],
          through: {
            attributes: [],
          },
        },
      ],
      order: [[RecruitPost, "posted_date", "DESC"]],
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        Message: "좋아요한 채용공고가 존재하지 않습니다.",
        ResultCode: "LikedPost_Not_Exist",
      });
    } else {
      return res.send({
        Message: "Success",
        ResultCode: "LikedPost_Exist",
        Response: posts[0].Recruit_posts,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Message: "좋아요한 채용공고 조회 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
