// Token storage and management utility
export class TokenManager {
  static STORAGE_KEY = 'smartcare_auth'

  /**
   * Store access and refresh tokens with user data
   */
  static setTokens(accessToken, refreshToken, userData = null, tokenType = 'Bearer', expiresIn = 3600) {
    const authData = {
      accessToken,
      refreshToken,
      tokenType,
      expiresIn,
      timestamp: Date.now(),
      ...(userData && { user: userData })
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData))
      console.log('Tokens stored successfully')
    } catch (error) {
      console.error('Failed to store tokens:', error)
    }
  }

  /**
   * Get access token
   */
  static getAccessToken() {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        const { accessToken } = JSON.parse(authData)
        return accessToken
      }
    } catch (error) {
      console.warn('Failed to get access token:', error)
    }
    return null
  }

  /**
   * Get refresh token
   */
  static getRefreshToken() {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        const { refreshToken } = JSON.parse(authData)
        return refreshToken
      }
    } catch (error) {
      console.warn('Failed to get refresh token:', error)
    }
    return null
  }

  /**
   * Get token type (Bearer, etc.)
   */
  static getTokenType() {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        const { tokenType } = JSON.parse(authData)
        return tokenType || 'Bearer'
      }
    } catch (error) {
      console.warn('Failed to get token type:', error)
    }
    return 'Bearer'
  }

  /**
   * Get stored user data
   */
  static getUserData() {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        const { user } = JSON.parse(authData)
        return user
      }
    } catch (error) {
      console.warn('Failed to get user data:', error)
    }
    return null
  }

  /**
   * Check if token is expired (with buffer)
   */
  static isTokenExpired(bufferMinutes = 5) {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        const { timestamp, expiresIn } = JSON.parse(authData)
        const expiryTime = timestamp + (expiresIn * 1000) - (bufferMinutes * 60 * 1000)
        return Date.now() > expiryTime
      }
    } catch (error) {
      console.warn('Failed to check token expiration:', error)
    }
    return true
  }

  /**
   * Clear all stored auth data
   */
  static clearTokens() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('Tokens cleared successfully')
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  /**
   * Get full auth data
   */
  static getAuthData() {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY)
      if (authData) {
        return JSON.parse(authData)
      }
    } catch (error) {
      console.warn('Failed to get auth data:', error)
    }
    return null
  }

  /**
   * Update tokens while preserving user data
   */
  static updateTokens(accessToken, refreshToken, tokenType = 'Bearer', expiresIn = 3600) {
    const currentData = this.getAuthData()
    if (currentData) {
      this.setTokens(accessToken, refreshToken, currentData.user, tokenType, expiresIn)
    } else {
      this.setTokens(accessToken, refreshToken, null, tokenType, expiresIn)
    }
  }
}

export default TokenManager
