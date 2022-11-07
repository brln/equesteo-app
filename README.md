![logo](https://user-images.githubusercontent.com/13209207/200436610-8f120252-b229-4008-931c-a35a5b1cca4a.jpg)

![750x750bb](https://user-images.githubusercontent.com/13209207/200436639-3c54e13b-8f88-46d6-9d99-747267c2eb32.jpeg)

![750x750bb2](https://user-images.githubusercontent.com/13209207/200436645-81543984-d975-4803-ad96-7c5d66e6c450.jpeg)

![750x750bb3](https://user-images.githubusercontent.com/13209207/200436659-29c76c20-6273-4a88-b8f3-eb1df812b48e.jpeg)

![750x750bb4](https://user-images.githubusercontent.com/13209207/200436668-7fb6faaa-c77a-458f-a7d9-a8f860837a74.jpeg)

![750x750bb5](https://user-images.githubusercontent.com/13209207/200436698-5ec15c80-1322-4190-b1db-ed6a5c80408a.jpeg)

![750x750bb6](https://user-images.githubusercontent.com/13209207/200436708-e111776c-6b1a-409b-8437-dae2c0f7ec99.jpeg)


# Starting DynamoDB Local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

# Restarting metro bundler:
`lsof -i :8081` kill process.

# Logging a single device:
adb -s ZY224L9Q9M shell logcat *:S ReactNative:V ReactNativeJS:V

# Reload app:
adb -s ZY224L9Q9M shell am broadcast -a react.native.RELOAD

# logging on ios
log stream --predicate '(processImagePath contains "equesteo") and senderImageUUID == processImageUUID'

# converting icon size
svgexport ~/Downloads/noun_Hamburger_564924.svg hamburger@3x.png 120:120

# generate splashscreen images
yo rn-toolbox:assets --splash splashscreen.svg --android

# install an apk
adb install android/app/build/outputs/apk/release/app-release.apk

# version appropriate files
./versioning.py 55 0.46.1

# fix glog
cd node_modules/react-native ; ./scripts/ios-install-third-party.sh ; cd ../../
cd node_modules/react-native/third-party/glog-0.3.4/ ; sh ../../scripts/ios-configure-glog.sh ; cd ../../../../a

# follow couchdb on docker logs:
docker logs --follow 8ab154e4f90a

# start metro bundler with cleared cache
npm start -- --reset-cache
