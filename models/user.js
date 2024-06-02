const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        user_email: {
          type: Sequelize.STRING(40),
          allowNull: false,
          unique: true,
          comment: "사용자 이메일",
        },
        user_name: {
          type: Sequelize.STRING(15),
          allowNull: false,
          comment: "사용자 이름",
        },
        user_password: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "사용자 비밀번호",
        },
        user_authority: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: "사용자 권한",
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
        timestamps: false, // createdAt, updatedAt
        modelName: "User", // js에서의 model name
        tableName: "users", // DB상 table name
        charset: "utf8", // DB에 어떤 식으로 문자를 저장할 건지
        collate: "utf8_general_ci", // DB에 저장된 문자를 어떤 방식으로 정렬할지
        // 이모티콘까지 저장하고 싶다고 하면
        // utf8mb4 , utf8mb4_general_ci 사용
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Recruit_post, {
      foreignKey: "creator_id",
      sourceKey: "id",
    });
    db.User.belongsToMany(db.Recruit_post, {
      through: "post_likes",
      timestamps: false,
      sourceKey: "id",
      foreignKey: "user_id",
    });
  }
}

module.exports = User;
