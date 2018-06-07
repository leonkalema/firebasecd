#!/usr/bin/env bash
docker run -v `pwd`:/usr/src/app -it --rm node:8 /bin/bash -c "npx create-react-app my-app; cp -a /my-app/. /usr/src/app/my-app"