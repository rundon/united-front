#!/bin/sh
cd /app
if [ "$PROFILES" == "test" ]; then
        npm run build:sit && mv dist / && rm -rf /app/* &&  mv /dist /app
elif [ "$PROFILES" == "dev" ]; then
        npm run build:dev && mv dist / && rm -rf /app/* &&  mv /dist /app
else
        echo "you had enter unexpected word"
fi

echo "Starting front"

exec http-server dist
