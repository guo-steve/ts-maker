#!/usr/bin/env node

const fs = require("fs");
const { spawn } = require("child_process");
const { parseArgs } = require("util");
const prompts = require("prompts");

async function exec(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["inherit", "pipe", "inherit"],
      ...options,
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr &&
      child.stderr.on("data", (data) => {
        process.stderr.write(data);
      });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function main() {
  let projectName;

  const { values, positionals } = parseArgs({
    options: {
      help: {
        type: "boolean",
        short: "h",
      },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log("Usage: ts-starter [project-name]");
    process.exit(1);
  }

  if (positionals.length > 0) {
    projectName = positionals[0];
  } else {
    const answers = await prompts(
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

    projectName = answers.projectName;
  }

  if (projectName) {
    if (!fs.existsSync(projectName)) {
      fs.mkdirSync(projectName);
    }
    process.chdir(projectName);
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
  await exec("npm", ["pkg", "set", "scripts.lint='eslint --fix src'"]);

  const filesToCopy = [
    ".dockerignore",
    ".editorconfig",
    ".eslintrc.json",
    "_.gitignore",
    ".prettierrc.json",
    "tsconfig.json",
  ];

  filesToCopy.forEach((file) => {
    let from = file;
    let to = file;
    if (from.startsWith("_.")) {
      to = to.replace(/^_\./, ".");
    }
    fs.copyFileSync(__dirname + "/files/" + from, process.cwd() + "/" + to);
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
    await exec("npx", ["husky", "init"]);
    fs.copyFileSync(
      __dirname + "/files/.lintstagedrc.json",
      process.cwd() + "/.lintstagedrc.json"
    );
  }
}

module.exports.main = main;

if (require.main === module) {
  main();
}
