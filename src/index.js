const chalk = require("chalk");
const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
const striptags = require("striptags");
const cookie = fs.readFileSync("cookie.txt", "utf8");

if (!cookie.length) {
  return console.log(chalk.hex("#e8e8e8").bold("No cookie found."))
}

inquirer.prompt([{
  name: "videoid",
  type: "input",
  prefix: ">",
  suffix: ":",
  message: `Enter the EdPuzzle video ID`,
  validate: function (input) {
    if (input.length) {
      return true;
    } else {
      return chalk.yellow("Please enter the EdPuzzle video ID.");
    }
  },
}, ]).then((answers) => {
  axios
    .get(`https://edpuzzle.com/api/v3/assignments/${answers.videoid}`, {
      headers: {
        "Cookie": `G_ENABLED_IDPS=google; token=${cookie}; G_AUTHUSER_H=2`,
        "x-edpuzzle-web-version": "7.23.30",
        "x-edpuzzle-referrer": `https://edpuzzle.com/assignments/${answers.videoid}/watch`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
      }
    }).then(function (response) {
      response.data.medias[0].questions.forEach((q) => {
        if (q.type.includes("multiple")) {
          q.choices.forEach((choice) => {
            if (choice.isCorrect) {
              console.log(
                chalk.hex("#FDDB3A")(
                  `Question:`,
                  chalk.hex("#E8E8E8")
                  `\n${sanitize(q.body[0].html)}`,
                  `\nAnswer:`,
                  chalk.hex("#E8E8E8")
                  `\n${sanitize(choice.body[0].html)}\n`
                )
              );
            }
          });
        }
      });
    }).catch(function (error) {
      return console.log(
        chalk.hex("#e8e8e8").bold("Invalid cookie or video ID entered.")
      );
    })
});

function sanitize(str) {
  return striptags(str)
    .replace(/(&quot\;)/g, '"')
    .replace(/(&nbsp\;)/g, " ")
    .replace(/(&#39\;)/g, "'")
    .replace(/(&#39\;s)/g, "'s");
}
