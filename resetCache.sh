#! /bin/sh

adb kill-server;
rm -rf android/build;
rm -rf android/.gradle;
rm -rf node_modules;
rm -rf /tmp/*;
npm install;
adb start-server;
react-native run-android;

