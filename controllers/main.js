const RecruitPost = require("../models/recruit_post");

exports.getMain = async (req, res, next) => {
  try {
    const remote = await RecruitPost.findAll({
      attributes: [
        "id",
        "company_name",
        "company_logo",
        "description_title",
        "is_visa_sponsored",
        "is_remoted",
        "location",
        "posted_date",
      ],
      where: {
        is_remoted: 1,
        is_visa_sponsored: 0,
        is_dev: 1,
      },
      limit: 6,
      order: [["posted_date", "DESC"]],
    });

    const visa = await RecruitPost.findAll({
      attributes: [
        "id",
        "company_name",
        "company_logo",
        "description_title",
        "is_visa_sponsored",
        "is_remoted",
        "location",
        "posted_date",
      ],
      where: {
        is_remoted: 0,
        is_visa_sponsored: 1,
        is_dev: 1,
      },
      limit: 6,
      order: [["posted_date", "DESC"]],
    });

    res.send({
      Message: "Success",
      ResultCode: "ERR_OK",
      Size: 12,
      Remote: remote,
      Visa: visa,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "메인 페이지 조회 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
