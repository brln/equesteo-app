import { handleNotification } from './services/PushNotificationHandler'


export default (store) => {
  return (m) => {
    handleNotification(store.dispatch, m.data, true)
    return Promise.resolve()
  }
}