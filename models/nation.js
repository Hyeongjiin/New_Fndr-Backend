const Sequelize = require("sequelize");

class Nation extends Sequelize.Model {
  static initiate(sequelize) {
    Nation.init(
      {
        nation_name: {
          type: Sequelize.STRING(40),
          allowNull: false,
          comment: "국가명",
        },
      },
      {
        sequelize,
        timestamps: false,
        modelName: "Nation",
        tableName: "nations",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Nation.hasMany(db.Recruit_post, {
      foreignKey: "nation_id",
      sourceKey: "id",
    });
  }
}

module.exports = Nation;
