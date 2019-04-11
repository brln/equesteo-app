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
