import * as Network from 'expo-network';

export const networkService = {
  async getLocalIpAddress(): Promise<string | null> {
    try {
      const ip = await Network.getIpAddressAsync();
      return ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      return null;
    }
  },

  async isConnected(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network state:', error);
      return false;
    }
  },

  async getNetworkType(): Promise<string> {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.type ?? 'unknown';
    } catch (error) {
      return 'unknown';
    }
  },
};
