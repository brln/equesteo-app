import ApiClient from './api_client'

export default class HorseAPI {

  constructor (token) {
    this.apiClient = new ApiClient(token)
  }

  async createHorse (horseData) {
    return await this.apiClient.post('/horses', horseData)
  }

  async fetchHorses () {
    return await this.apiClient.get('/horses')
  }
}
