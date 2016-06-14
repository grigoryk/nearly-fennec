#!/bin/bash

set -e

rm -rf public/*
bower install
cp -r bower_components public 
cp -r css public   
cp -r index.html public 
cp -r js public 
cp -r manifest.json public

firebase deploy
