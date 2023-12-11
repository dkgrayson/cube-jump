# Intro

Welcome to my fun game! It's an experiment to learn about rendering and to practice javascript.

Trello: https://trello.com/b/rbSjDlC1/platformer

Production: https://www.neighborswithmowers.com

# Dependencies
- Node.js latest version
- Three.js and Cannon.js are install by npm

# Starting local server

1. npm install
2. npm start

# Releasing
- Most recent build for production is stored in /bundle
- All commits to master are released by Netlify but only changes in /bundle show up in product
- To rebuild for production run `npm run build` and commit the update to bundle using the pattern "release: X.x"


# Release tags
- `git log` will show you the latest commit and release
- git commit -m "release: X.x"
- X = major version
- x = minor version
- minor versions are represented as whole numbers. E.G: 1.1 is minor version 1. 1.11 is minor version 11.
