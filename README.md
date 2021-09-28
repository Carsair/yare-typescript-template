## yare-open-bot

### About
This code expands upon yare-typescript-template and provides a framework to help new players get up-to-speed writing strategic code rather than core functionality.  We will periodically update to include recent updates to yare-typescript-template.

### Use
To build your own bot, fork this repo and develop your strategy.
Follow the yare-typescript-template setup instructions below.
Most of your code should be in the /src directory , and the individual shape files circles.ts, triangles.ts, squares.ts are a good place to start.

### Contributing
- Please open a GH issue if you find a bug or if you have a suggestion!  Ideally get approval from a maintainer for adding a new feature
- Most changes should be in /src directory as we will try to maintain build compatibility with yare-typescript-template
- Make a PR to this repo with the changes and we will review it!

# yare-typescript-template

## Requirements

- node.js 14+
- yarn (to install, do `npm i -g yarn`)

## Setup

Setup is super easy, just run `yarn install --production=false` in console.

You can now start writing yare code in src/main.js (for typescript just rename the file to main.ts)

## Use

- To bundle your js into a single file, use `yarn build`.
- Once it's done, a bundle should have appeared at dist/bundle.js
- Use the `-s` flag while building to auto upload your bundle to yare
- Use the `-a` flag to change to a new account to sync to.
- Use the `-w` flag while building to watch the `./src` directory for changes
- Use the `-nm` flag while building to disable the minifer
- Use the `--main=src/main.js` flag while building to use a custom main file

## Additional information

- This automatically puts your code into brackets `{}`
- To update the typescript typings you can run `yarn install --production=false` again.
