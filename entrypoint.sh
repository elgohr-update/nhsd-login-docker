#!/bin/ash

cd /usr/src/app || exit
access_token=$(npm run --silent start "$@" | head -n 1)

echo "$access_token"
