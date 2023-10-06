#!/bin/bash
set -x
node -e "fs.writeFileSync('test','test')"
node -e "fs.mkdirSync('test-dir')"       
node -e "fs.chmodSync('test-dir', 0o644)"
node -e "fs.writeFileSync('test','test')"
node -e "fs.chmodSync('test-dir', 0o644)"
node -e "fs.unlinkSync('test')"
