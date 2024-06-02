const RecruitPost = require("../models/recruit_post");
const { Op } = require("sequelize");

exports.getDetail = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await RecruitPost.findOne({
      attributes: [
        "id",
        "creator_id",
        "nation_id",
        "company_name",
        "description_title",
        "description_content",
        "company_apply_link",
        "posted_date",
        "is_visa_sponsored",
        "is_remoted",
        "is_dev",
        "company_logo",
        "company_page_link",
        "origin",
        "tag",
        "location",
      ],
      where: {
        [Op.and]: [{ id: postId }, { is_dev: "1" }],
      },
      limit: 1,
    });

    if (!post || post.length === 0) {
      console.log(postId);
      return res.status(404).send({
        Message: "Data not found",
        ResultCode: "ERR_DATA_NOT_FOUND",
      });
    }

    const userId = req.user ? req.user.id : null;
    const exlike = await post.hasUser(userId);

    res.status(200).json({
      Message: "Success",
      ResultCode: "ERR_OK",
      Response: post,
      Likes: exlike,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "채용공고 상세정보 조회 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
