const axios = require("axios");
const RecruitPost = require("../models/recruit_post");
const Tag = require("../models/tag");

exports.arbeitPost = async (req, res, next) => {
  try {
    const apis = process.env.ARBEIT_APIS.split(",");
    const visaValue = [1, 0];
    const recruitPosts = [];
    // 중복된 채용공고 체크를 위한 set
    const existingLinks = new Set();

    for (let i = 0; i < apis.length; i++) {
      const response = await axios.get(apis[i]);
      const jobDataArray = response.data.data;
      jobDataArray.forEach((jobData) => {
        if (!existingLinks.has(jobData.url)) {
          recruitPosts.push({
            creator_id: 1,
            nation_id: 5,
            company_name: jobData.company_name,
            description_title: jobData.title,
            description_content: jobData.description,
            company_apply_link: jobData.url,
            posted_date: new Date(jobData.created_at).getTime(),
            is_visa_sponsored: visaValue[i],
            is_remoted: jobData.remote,
            origin: "arbeitnow",
            tag: jobData.tags.join(", "),
            location: jobData.location,
            is_dev: true,
          });
          existingLinks.add(jobData.url);
        }
      });
    }

    // 중복방지를 위해서 company_apply_link를 unique index로 설정했고
    // 중복된 값이 저장되면 insert ingore를 통해서 삽입을 무시한다 - ingoreDuplicates옵션 사용
    const posts = await RecruitPost.bulkCreate(recruitPosts, {
      ignoreDuplicates: true,
    });

    for (const post of posts) {
      if (!post.id) {
        // post id값이 null 값인 경우는 중복
        continue;
      }
      const postTags = post.tag.split(", ").filter((tag) => tag.trim() !== "");
      if (postTags.length > 0) {
        const result = await Promise.all(
          postTags.map((tag) => {
            return Tag.findOrCreate({
              where: { tag_name: tag.toLowerCase() },
            });
          })
        );
        console.log("result", result[0]);
        await post.addTags(result.map((r) => r[0])); // 채용공고와 태그의 관계를 설정해준다.
      }
    }

    res.status(200).json({
      message: "ArbeitNow 채용공고가 정상적으로 등록되었습니다.",
      data: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ArbeitNow 채용공고 등록 중 문제가 발생했습니다.",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};

const COUNTRIES = [
  "united-states",
  "canada",
  "united-kingdom",
  "ireland",
  "germany",
  "france",
  "netherlands",
  "australia",
  "singapore",
  "hong-kong",
  "japan",
];
const LIMIT = 100;

exports.web3Post = async (req, res, next) => {
  try {
    const recruitPosts = [];
    const existingLinks = new Set();
    const api = process.env.WEB3_API;
    const token = process.env.WEB3_TOKEN;

    for (let i = 0; i < COUNTRIES.length; i++) {
      const country = COUNTRIES[i];
      const apiUrl = `${api}?token=${token}&country=${country}&remote=true&limit=${LIMIT}`;
      const response = await axios.get(apiUrl);
      const jobDataArray = response.data[2];
      jobDataArray.forEach((jobData) => {
        if (!existingLinks.has(jobData.apply_url)) {
          const isVisaSponsored = jobData.description.includes("relocat");
          recruitPosts.push({
            creator_id: 1,
            nation_id: i + 1,
            company_name: jobData.company,
            description_title: jobData.title,
            description_content: jobData.description,
            company_apply_link: jobData.apply_url,
            posted_date: jobData.date_epoch,
            is_visa_sponsored: isVisaSponsored,
            is_remoted: jobData.is_remote,
            origin: "web3",
            tag: jobData.tags.join(", "),
            location: jobData.location,
            is_dev: true,
          });
          existingLinks.add(jobData.apply_url);
        }
      });
    }

    const posts = await RecruitPost.bulkCreate(recruitPosts, {
      ignoreDuplicates: true,
    });

    for (const post of posts) {
      if (!post.id) {
        continue;
      }
      const postTags = post.tag.split(", ").filter((tag) => tag.trim() !== "");
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
    }

    res.status(200).json({
      Message: "Web3 채용공고가 정상적으로 등록되었습니다.",
      Data: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      Message: "Web3 채용공고 등록 중 문제가 발생했습니다.",
      ResultCode: "ERR_INTERNAL_SERVER",
    });
  }
};
