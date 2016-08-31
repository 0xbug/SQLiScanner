#!/usr/bin/env bash

npm run build
cp build/static/js/*.js ../static/js/app.js
cp build/static/css/*.css ../static/css/app.css