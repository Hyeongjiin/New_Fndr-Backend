const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.File({ filename: "combined.log" }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

if (process.env.NOVE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

// console을 logger로 바꾸면 적용 (app.js에서 require한 뒤에)

module.exports = logger;
