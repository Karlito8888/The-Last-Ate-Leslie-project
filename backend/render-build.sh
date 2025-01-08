#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm install --save-dev @types/jest @types/node
npm run build 