#!/usr/bin/env node

const fs = require("fs");
const { spawn } = require("child_process");
const prompts = require("prompts");

async function exec(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        reject();
        return;
      }
      resolve();
    });
  });
}

async function main() {
  let answers = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "What is your project name? [empty]",
      },
    ],
    {
      onCancel: () => {
        console.log("Bye!");
        process.exit(0);
      },
    }
  );

  if (answers.projectName) {
    fs.mkdirSync(answers.projectName);
    process.chdir(answers.projectName);
  }

  if (!fs.existsSync("package.json")) {
    await exec("npm", ["init", "-y"]);
  }

  // npm install --save-dev typescript @types/node ts-node
  await exec("npm", [
    "install",
    "--save-dev",
    "typescript",
    "@types/node",
    "ts-node",
  ]);
  // npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import
  await exec("npm", [
    "install",
    "--save-dev",
    "eslint",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-import",
  ]);
  // npm pkg set scripts.lint="eslint --fix src"
  await exec("npm", ["pkg", "set", "scripts.lint", "eslint --fix src"]);

  const filesToCopy = [
    ".dockerignore",
    ".editorconfig",
    ".eslintrc.json",
    ".gitignore",
    ".prettierrc.json",
    "tsconfig.json",
  ];

  filesToCopy.forEach((file) => {
    fs.copyFileSync(__dirname + "/files/" + file, process.cwd() + "/" + file);
  });

  if (!fs.existsSync("src")) {
    fs.mkdirSync("src");
  }

  if (!fs.existsSync(".git")) {
    await exec("git", ["init"]);
  }

  answers = await prompts({
    type: "confirm",
    name: "useHusky",
    message: "Would you like to install husky (recommended)?",
    initial: true,
  });

  if (answers.useHusky) {
    await exec("npm", ["install", "--save-dev", "husky", "lint-staged"]);
    await exec("npx", ["husky", "install"]);
    fs.copyFileSync(
      __dirname + "files/.lintstagedrc.json",
      process.cwd() + "/.lintstagedrc.json"
    );
    await exec("npx", ["husky", "add", ".husky/pre-commit", "npx lint-staged"]);
  }
}

main();
