#!/bin/bash
node -e "fs.rmSync('node_modules', {recursive: true})"
npm install --omit=dev
npm ls --depth=2
