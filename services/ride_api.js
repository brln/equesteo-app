import ApiClient from './api_client'

export default class RideAPI {

  constructor (token) {
    this.apiClient = new ApiClient(token)
  }

  async saveRide (rideData) {
    return await this.apiClient.post('/rides', rideData)
  }

  async fetchRides () {
    return await this.apiClient.get('/rides')
  }
}
