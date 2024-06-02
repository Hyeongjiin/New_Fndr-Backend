const Sequelize = require("sequelize");

class Recruit_post extends Sequelize.Model {
  static initiate(sequelize) {
    Recruit_post.init(
      {
        company_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "회사명",
        },
        description_title: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "채용공고 제목",
        },
        description_content: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: "채용공고 내용",
        },
        company_apply_link: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "회사 지원 링크",
        },
        posted_date: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "채용공고 게시 날짜",
        },
        is_visa_sponsored: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          comment: "비자 지원 여부",
        },
        is_remoted: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          comment: "원격 근무 여부",
        },
        company_logo: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "회사 로고",
        },
        company_page_link: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "회사 홈페이지 링크",
        },
        origin: {
          type: Sequelize.STRING(40),
          allowNull: false,
          comment: "해당 채용공고를 가져온 API사이트 출처",
        },
        tag: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "태그",
        },
        location: {
          type: Sequelize.STRING(40),
          allowNull: false,
          comment: "회사 위치",
        },
        is_dev: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true,
          comment: "개발자 관련 채용공고 여부",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 삽입 날짜",
        },
      },
      {
        sequelize,
        timestamps: false,
        modelName: "Recruit_post",
        tableName: "recruit_posts",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        indexes: [
          {
            unique: true,
            fields: ["company_apply_link"],
          },
        ],
      }
    );
  }

  static associate(db) {
    db.Recruit_post.belongsTo(db.User, {
      foreignKey: "creator_id",
      targetKey: "id",
    });
    db.Recruit_post.belongsToMany(db.User, {
      through: "post_likes",
      timestamps: false,
      sourceKey: "id",
      foreignKey: "post_id",
    });
    db.Recruit_post.belongsTo(db.Nation, {
      foreignKey: "nation_id",
      targetKey: "id",
    });
    db.Recruit_post.belongsToMany(db.Tag, {
      through: "post_tags",
      timestamps: false,
      sourceKey: "id",
      foreignKey: "post_id",
    });
  }
}

module.exports = Recruit_post;
