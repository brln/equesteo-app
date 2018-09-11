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
