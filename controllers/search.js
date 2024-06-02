const RecruitPost = require("../models/recruit_post");
const { Op } = require("sequelize");

exports.getPostPagination = async (req, res, next) => {
  const pageNum = req.params.page;
  const queryNation = req.query.nation;
  const queryKeyword = req.query.keyword;
  const queryRemote = req.query.remote;
  const queryVisa = req.query.visa;

  const whereCondition = {};
  const limit = 10;
  const offset = limit * (parseInt(pageNum) - 1);

  if (queryNation) {
    whereCondition.nation_id = queryNation;
  }
  if (queryRemote != null) {
    whereCondition.is_remoted = queryRemote === "true";
  }
  if (queryVisa != null) {
    whereCondition.is_visa_sponsored = queryVisa === "true";
  }
  if (queryKeyword) {
    whereCondition.description_title = { [Op.like]: `%${queryKeyword}%` };
  }

  try {
    const posts = await RecruitPost.findAll({
      attributes: [
        "id",
        "nation_id",
        "company_name",
        "description_title",
        "description_content",
        "posted_date",
        "is_visa_sponsored",
        "is_remoted",
        "is_dev",
        "company_logo",
        "tag",
        "location",
      ],
      where: {
        [Op.and]: [whereCondition, { is_dev: "1" }],
      },
      order: [["posted_date", "DESC"]],
      offset: offset,
      limit: limit,
      subQuery: false,
    });

    // 전체 게시글 수를 별도로 계산합니다.
    const totalPosts = await RecruitPost.count({
      where: {
        [Op.and]: [whereCondition, { is_dev: "1" }],
      },
    });

    res.send({
      Message: "Success",
      ResultCode: "ERR_OK",
      Size: posts.length,
      Response: {
        page: {
          total: Math.ceil(totalPosts / limit), // 총 페이지 수
          current: parseInt(pageNum),
        },
        recruitPostList: posts,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "채용공고 검색 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
