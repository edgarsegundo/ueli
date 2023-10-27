# README~.md

## How to install nvm

https://tecadmin.net/install-nvm-macos-with-homebrew/

### Add to `~/.zshrc`

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

## How to install pnpm

brew install pnpm

## debugging

https://www.youtube.com/watch?v=-bjl401p5r8
https://www.youtube.com/watch?v=nB4ulB8efck
https://www.electronjs.org/docs/latest/tutorial/debugging-vscode
https://www.electronjs.org/docs/latest/tutorial/application-debugging
https://www.electronjs.org/docs/latest/tutorial/debugging-main-process


### Problems to debug

nvm alias default 16

google: Can't find Node.js binary with code 127: exec: node: not found . Make sure Node.js is installed and in your PATH, or set the "runtimeExecutable" in your launch.json

https://stackoverflow.com/questions/37823194/cannot-find-runtime-node-on-path-visual-studio-code-and-node-js

**NOTE**: Restart your computer