#!/bin/bash

if [ ! -e /usr/src/app/node_modules ]; then
    echo "First start, running npm install then npm start"
    cd /usr/src/app
    npm install
fi
cd /usr/src/app
if [[ ! -v DEVSTART ]]; then
    echo "Dev flag not set, assuming production, building the frontend"
    #npm run build
    npm start
else
    echo "Dev flag set, starting frontend webpack"
    npm start&
    #npm run devstart
fi

