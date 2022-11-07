
![Simulator Screen Shot - iPhone XS Max - 2019-04-11 at 09 09 11](https://user-images.githubusercontent.com/13209207/200435929-e7197123-e81e-4e97-9e11-5ea63f9dcfce.png)

![Simulator Screen Shot - iPhone X - 2019-04-11 at 08 38 09](https://user-images.githubusercontent.com/13209207/200435988-5f9f8de2-1a81-48b2-be9d-629a49256356.png)

![Simulator Screen Shot - iPhone XS Max - 2019-04-11 at 09 08 58](https://user-images.githubusercontent.com/13209207/200436041-612f58eb-fc5b-4a46-bdd9-b653a843fb04.png)


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
