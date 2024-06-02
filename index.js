#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const prompts = require("prompts");

(async () => {
  const response = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "What is your project name?",
      },
    ],
    {
      onCancel: () => {
        console.log("Bye!");
        process.exit(0);
      },
    }
  );
  console.log(response);
})();

if (!fs.existsSync("package.json")) {
  execSync("npm init -y");
}

const cmds = {
  install_typescript: "npm install --save-dev typescript @types/node ts-node",
  install_eslint:
    "npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import",
  set_scripts_lint: 'npm pkg set scripts.lint="eslint --fix src"',
};

execSync(cmds.install_typescript);
execSync(cmds.install_eslint);
execSync(cmds.set_scripts_lint);

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
  execSync("git init");
}

(async () => {
  const answers = await prompts({
    type: "confirm",
    name: "useHusky",
    message: "Would you like to install husky (recommended)?",
    initial: true,
  });

  if (answers.useHusky) {
    execSync("npm install --save-dev husky lint-staged");
    execSync("npx husky install");
    fs.copyFileSync(
      __dirname + "files/.lintstagedrc.json",
      file,
      process.cwd() + "/.lintstagedrc.json"
    );
    execSync('npx husky add .husky/pre-commit "npx lint-staged"');
  }
})();
