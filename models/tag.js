const Sequelize = require("sequelize");

class Tag extends Sequelize.Model {
  static initiate(sequelize) {
    Tag.init(
      {
        tag_name: {
          type: Sequelize.STRING(40),
          allowNull: false,
          comment: "태그명",
        },
      },
      {
        sequelize,
        timestamps: false,
        modelName: "Tag",
        tableName: "tags",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Tag.belongsToMany(db.Recruit_post, {
      through: "post_tags",
      timestamps: false,
      sourceKey: "id",
      foreignKey: "tag_id",
    });
  }
}

module.exports = Tag;
