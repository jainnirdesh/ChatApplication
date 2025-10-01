import { projectId, publicAnonKey } from './supabase/info'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3088f3ea`

export interface ApiResponse<T> {
  success?: boolean
  error?: string
  data?: T
}

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    } else {
      headers.Authorization = `Bearer ${publicAnonKey}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection')
      }
      throw error
    }
  }

  // Auth endpoints
  async signup(username: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async signin(username: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  // Room endpoints
  async getRooms() {
    return this.request('/rooms')
  }

  async createRoom(name: string) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  // Message endpoints
  async getMessages(roomId: string) {
    return this.request(`/rooms/${roomId}/messages`)
  }

  async sendMessage(roomId: string, content: string) {
    return this.request(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Initialize default rooms
  async initializeRooms() {
    return this.request('/init')
  }

  // Test connection
  async testConnection() {
    try {
      return await this.request('/init')
    } catch (error) {
      console.error('Connection test failed:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()