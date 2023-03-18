#!/bin/sh
yarn nodemon --ignore "**/*.json" src/backend/backend.ts &
yarn dev &
wait
