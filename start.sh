#!/bin/bash -e

# Colors
BLD="\033[1m"  # Bold
END="\033[0m"  # Reset
CYN="\033[36m" # Cyan
RED="\033[31m" # Red
GRN="\033[32m" # Green
BLU="\033[34m" # Blue

starter_location=$(pwd)

echo -e "${BLD}${CYN}Welcome to the TypeScript Starter!${END}"

if [[ -n $1 ]]; then
    project_location=$(dirname "$1")
    project_name=$(basename "$1")
fi

if [[ -z $project_location || $project_location == "." || $project_location == $starter_location ]]; then
    echo -n -e "${CYN}Enter the location of the project: ${END}"
    read -r project_location
fi

if [[ -z $project_name ]]; then
    echo -n -e "${CYN}Enter the name of the project: ${END}"
    read -r project_name
fi


project_location="${project_location/#\~/$HOME}"

if [[ ! -d $project_location/$project_name ]]; then
    mkdir $project_location/$project_name
fi

cd $project_location/$project_name

if [[ ! -e package.json ]]; then
    npm init -y
fi

npm install --save-dev typescript @types/node ts-node
npm install --save-dev eslint @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin eslint-plugin-import
npm pkg set scripts.lint="eslint --fix src"

file_list=(
".dockerignore"
".editorconfig"
".eslintrc.json"
".gitignore"
".prettierrc.json"
"tsconfig.json"
)

for file in "${file_list[@]}"; do
    cp $starter_location/$file $project_location/$project_name
done

if [[ ! -d src ]]; then
    mkdir src
fi

git init

echo -n -e "${CYN} Would you like to install husky (recommended)? (y/n) ${END}"
read -r -n1 install_husky

if [[ $install_husky == "y" ]]; then
    npm install --save-dev husky lint-staged
    npx husky install
    npm pkg set scripts.prepare="npm install husky -D && husky install"
    cp $starter_location/.lintstagedrc.json $project_location/$project_name
    npx husky add .husky/pre-commit "npx lint-staged"
fi

git add . && git commit -m "Initial commit" && git commit --amend
