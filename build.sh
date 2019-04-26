# cd android && ./gradlew publishApkRelease
cd ios && xcodebuild -workspace equesteo.xcworkspace -scheme equesteoRelease -configuration AppStoreDistribution archive -archivePath ./build/equesteo.xcarchive
xcodebuild -exportArchive -archivePath ./build/equesteo.xcarchive -exportOptionsPlist prodBuild.plist -exportPath ./build;
/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool --upload-app -f "./build/equesteo.ipa" -u $USERNAME -p $PASSWORD;