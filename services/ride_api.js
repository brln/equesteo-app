import ApiClient from './api_client'

export default class RideAPI {

  constructor (token) {
    this.apiClient = new ApiClient(token)
  }

  async saveRide (positions) {
    return await this.apiClient.post('/rides', positions)
  }

  async fetchRides () {
    return await this.apiClient.get('/rides')
  }
}
