# Restarting metro bundler:
`lsof -i :8081` kill process.

# Logging a single device:
adb -s ZY224L9Q9M shell logcat *:S ReactNative:V ReactNativeJS:V

# Reload app:
adb -s ZY224L9Q9M shell am broadcast -a react.native.RELOAD