const RecruitPost = require("../models/recruit_post");
const Tag = require("../models/tag");
const { s3 } = require("../s3"); // s3.js 파일에서 s3 객체를 가져옴
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

exports.uploadPost = async (req, res, next) => {
  try {
    const createData = {
      creator_id: req.user.id,
      nation_id: req.body.nation_id,
      company_name: req.body.company_name,
      description_title: req.body.description_title,
      description_content: req.body.description_content,
      company_apply_link: req.body.company_apply_link,
      posted_date: Math.floor(Date.now() / 1000),
      is_visa_sponsored: req.body.is_visa_sponsored,
      is_remoted: req.body.is_remoted,
      is_dev: 1,
      company_page_link: req.body.company_apply_link,
      origin: "fndr",
      tag: req.body.tag,
      location: req.body.location,
    };

    if (req.file) {
      console.log("파일 간다", req.file.location);
      createData.company_logo = req.file.location;
    }

    const post = await RecruitPost.create(createData);

    if (post) {
      const postTags = post.tag.split(", ").filter((tag) => tag.trim() !== "");
      if (postTags.length > 0) {
        const result = await Promise.all(
          postTags.map((tag) => {
            return Tag.findOrCreate({
              where: { tag_name: tag.toLowerCase() },
            });
          })
        );
        await post.addTags(result.map((r) => r[0])); // 채용공고와 태그의 관계를 설정해준다.
      }
    }

    const postId = post.id;
    const company_logo = post.company_logo;

    return res.send({
      Message: "채용공고 등록이 완료되었습니다.",
      ResultCode: "JobPost_Create_Success",
      postId: postId,
      company_logo: company_logo,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "채용공고 등록 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await RecruitPost.findOne({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        Message: "존재하지 않는 채용공고입니다.",
        ResultCode: "JobPost_Not_Exist",
      });
    }

    const userId = req.user.id;
    const creatorId = post.creator_id;

    if (userId !== 1 && userId !== creatorId) {
      return res.status(404).json({
        Message: "채용공고 작성자가 일치하지 않습니다.",
        ResultCode: "JobPost_Creator_Not_Match",
      });
    }

    const updateData = {
      nation_id: req.body.nation_id,
      company_name: req.body.company_name,
      description_title: req.body.description_title,
      description_content: req.body.description_content,
      company_apply_link: req.body.company_apply_link,
      is_visa_sponsored: req.body.is_visa_sponsored,
      is_remoted: req.body.is_remoted,
      is_dev: req.body.is_dev,
      company_apply_link: req.body.company_apply_link,
      tag: req.body.tag,
      location: req.body.location,
    };

    if (req.file) {
      // 기존 로고 삭제
      const oldLogoPath = post.company_logo;
      if (oldLogoPath) {
        const bucketName = process.env.S3_BUCKET;
        const key = oldLogoPath.split(".com/")[1]; // S3 URL에서 키 추출
        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
          console.log("기존 로고 삭제 성공");
        } catch (err) {
          console.error(`기존 로고 파일 삭제 실패: ${err}`);
        }
      }

      // 새로운 로고 경로 설정
      updateData.company_logo = req.file.location;
    }

    const updatePost = await RecruitPost.update(updateData, {
      where: { id: postId },
    });

    await post.setTags([]); // 모든 기존 태그 관계 삭제

    const postTags = updateData.tag
      .split(", ")
      .filter((tag) => tag.trim() !== "");
    if (postTags.length > 0) {
      const result = await Promise.all(
        postTags.map((tag) => {
          return Tag.findOrCreate({
            where: { tag_name: tag.toLowerCase() },
          });
        })
      );

      await post.addTags(result.map((r) => r[0]));
    }
    return res.status(200).json({
      Message: "채용공고 수정이 완료되었습니다.",
      ResultCode: "JobPost_Update_Success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "채용공고 수정 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const post = await RecruitPost.findOne({
      attributes: ["creator_id", "company_logo"],
      where: { id: postId },
    });
    if (!post) {
      return res.status(404).json({
        Message: "존재하지 않는 채용공고입니다.",
        ResultCode: "JobPost_Not_Exist",
      });
    }
    const postCreatorId = post.creator_id;
    if (userId !== 1 && userId !== postCreatorId) {
      return res.status(404).json({
        Message: "채용공고 작성자가 일치하지 않습니다.",
        ResultCode: "JobPost_Creator_Not_Match",
      });
    }

    const oldLogoPath = post.company_logo;
    if (oldLogoPath) {
      const bucketName = process.env.S3_BUCKET;
      const key = oldLogoPath.split(".com/")[1]; // S3 URL에서 키 추출
      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };

      try {
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
        console.log("기존 로고 삭제 성공");
      } catch (err) {
        console.error(`기존 로고 파일 삭제 실패: ${err}`);
      }
    }

    const deletePost = await RecruitPost.destroy({
      where: { id: postId },
    });
    console.log(deletePost);
    if (deletePost == 1) {
      return res.status(200).json({
        Message: "채용공고 삭제가 완료되었습니다.",
        ResultCode: "JobPost_Delete_Success",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Message: "채용공고 삭제 서버 에러",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
