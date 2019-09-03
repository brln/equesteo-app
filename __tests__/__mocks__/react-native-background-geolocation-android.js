export default class BackgroundGeolocation {
  static stop() {
    return Promise.resolve()
  }

  static startBackgroundTask(func) {
    func()
  }

  static stopBackgroundTask(taskKey) {
    return
  }
}