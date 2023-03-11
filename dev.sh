#!/bin/sh
yarn ts-node src/backend/backend.ts &
yarn dev &
wait
