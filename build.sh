#! /bin/bash
set -e 
set -o pipefail

cd ios && rm -rf build && rm -rf ~/Library/Developer/Xcode/DerivedData &&  xcodebuild -workspace equesteo.xcworkspace -scheme equesteoRelease -configuration AppStoreDistribution archive -archivePath ./build/equesteo.xcarchive;
xcodebuild -exportArchive -archivePath ./build/equesteo.xcarchive -exportOptionsPlist prodBuild.plist -exportPath ./build;
/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool --upload-app -f "./build/equesteo.ipa" -u $APP_STORE_USERNAME -p $APP_STORE_PASSWORD;

cd ../android && ./gradlew publishApkRelease;
