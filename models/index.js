const Sequelize = require("sequelize");
const fs = require("fs"); // 파일 읽기
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// sequelize연결과 DB model들은 두고 두고 사용이 된다
// 그래서 db객체에 넣고 나중에 import해서 사용한다.
db.sequelize = sequelize;

// model 폴더에 있는 모델 페이지들에 대해서 initiate과 association을 해주는 작업
const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    ); // 숨김파일과 index파일 제외
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
    model.initiate(sequelize);
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
