import { GoogleGenerativeAI } from "@google/generative-ai";

interface ApiKeyStatus {
  key: string;
  originalIndex: number;
  isWorking: boolean;
  disabledUntil: number | null; // Timestamp when key becomes available again
  lastSuccessAt: number;
  lastFailureAt: number;
  totalSuccesses: number;
  totalFailures: number;
  lastError?: string;
}

class GeminiKeyManager {
  private keyStatuses: ApiKeyStatus[];
  private disableDurationHours: number = 24; 
  constructor() {
    const keys = (process.env.GEMINI_API_KEYS || "")
      .split(",")
      .map((k) => k.trim())
      .filter(k => k.length > 0);

    if (keys.length === 0) {
      throw new Error("No Gemini API keys configured in GEMINI_API_KEYS");
    }

    // Initialize key statuses - assume all keys are working initially
    this.keyStatuses = keys.map((key, index) => ({
      key,
      originalIndex: index,
      isWorking: true,
      disabledUntil: null,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      totalSuccesses: 0,
      totalFailures: 0
    }));

    console.log(`🔑 Initialized ${keys.length} Gemini API keys`);
  }

  // Check if a key is currently available (not disabled)
  private isKeyAvailable(keyStatus: ApiKeyStatus): boolean {
    const now = Date.now();
    
    if (keyStatus.disabledUntil && now < keyStatus.disabledUntil) {
      return false;
    }
    
    // If disable time has expired, re-enable the key
    if (keyStatus.disabledUntil && now >= keyStatus.disabledUntil) {
      keyStatus.disabledUntil = null;
      keyStatus.isWorking = true;
      const hoursDisabled = Math.round((now - keyStatus.lastFailureAt) / (1000 * 60 * 60));
      console.log(`🔄 KEY-${keyStatus.originalIndex + 1} re-enabled after ${hoursDisabled} hours`);
    }
    
    return keyStatus.isWorking;
  }
  private getBestAvailableKey(): ApiKeyStatus | null {
    const availableKeys = this.keyStatuses.filter(key => this.isKeyAvailable(key));
    
    if (availableKeys.length === 0) {
      return null;
    }

    // Sort by: 1) Working keys first, 2) Most recent success, 3) Least recently used
    const sortedKeys = availableKeys.sort((a, b) => {
      const aScore = a.isWorking && a.totalSuccesses > 0 ? 1 : 0;
      const bScore = b.isWorking && b.totalSuccesses > 0 ? 1 : 0;
      
      if (aScore !== bScore) {
        return bScore - aScore; 
      }
      
      if (a.lastSuccessAt !== b.lastSuccessAt) {
        return b.lastSuccessAt - a.lastSuccessAt;
      }
      
      // Tertiary: Least recently used (either success or failure)
      const aLastUsed = Math.max(a.lastSuccessAt, a.lastFailureAt);
      const bLastUsed = Math.max(b.lastSuccessAt, b.lastFailureAt);
      return aLastUsed - bLastUsed;
    });

    return sortedKeys[0];
  }

  private markKeySuccess(keyStatus: ApiKeyStatus) {
    const now = Date.now();
    keyStatus.isWorking = true;
    keyStatus.disabledUntil = null;
    keyStatus.lastSuccessAt = now;
    keyStatus.totalSuccesses++;
    
    console.log(`✅ KEY-${keyStatus.originalIndex + 1} successful (${keyStatus.totalSuccesses} total successes)`);
  }

  private markKeyFailure(keyStatus: ApiKeyStatus, error: string) {
    const now = Date.now();
    keyStatus.isWorking = false;
    keyStatus.lastFailureAt = now;
    keyStatus.totalFailures++;
    keyStatus.lastError = error;
    keyStatus.disabledUntil = now + (this.disableDurationHours * 60 * 60 * 1000); // 24 hours from now
    
    const disabledUntilDate = new Date(keyStatus.disabledUntil).toLocaleString();
    console.log(`❌ KEY-${keyStatus.originalIndex + 1} failed and disabled until ${disabledUntilDate}`);
    console.log(`   Error: ${error}`);
  }

  private async tryGenerate(prompt: string, keyStatus: ApiKeyStatus): Promise<{ text: string; apiKey: string }> {
    const genAI = new GoogleGenerativeAI(keyStatus.key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return { 
      text, 
      apiKey: `KEY-${keyStatus.originalIndex + 1}` 
    };
  }

  async getGenerativeResponse(prompt: string): Promise<{ text: string; apiKey: string }> {
    const availableKeysCount = this.keyStatuses.filter(key => this.isKeyAvailable(key)).length;
    
    if (availableKeysCount === 0) {
      const nextAvailableTime = Math.min(...this.keyStatuses
        .filter(key => key.disabledUntil)
        .map(key => key.disabledUntil!));
      
      const hoursUntilNext = Math.ceil((nextAvailableTime - Date.now()) / (1000 * 60 * 60));
      throw new Error(`All Gemini API keys are disabled. Next key available in ~${hoursUntilNext} hours.`);
    }

    console.log(`🔍 ${availableKeysCount} keys available out of ${this.keyStatuses.length}`);

    // Try available keys until one works
    let attempts = 0;
    const maxAttempts = availableKeysCount;

    while (attempts < maxAttempts) {
      const keyStatus = this.getBestAvailableKey();
      
      if (!keyStatus) {
        throw new Error("No available Gemini API keys");
      }

      attempts++;
      
      try {
        const successInfo = keyStatus.totalSuccesses > 0 ? ` (${keyStatus.totalSuccesses} past successes)` : ' (untested)';
        console.log(`🔑 Trying KEY-${keyStatus.originalIndex + 1}${successInfo}`);
        
        const result = await this.tryGenerate(prompt, keyStatus);
        this.markKeySuccess(keyStatus);
        return result;
      } catch (error: any) {
        this.markKeyFailure(keyStatus, error.message);
        
        // If this was our last available key, throw the error
        if (attempts >= maxAttempts) {
          throw new Error(`All available Gemini API keys failed. Last error: ${error.message}`);
        }
        
        console.log("🔄 Trying next available key...");
      }
    }

    throw new Error("Unexpected error in Gemini key management");
  }

  // Get detailed status of all keys
  getKeyStatuses(): Array<{
    keyIndex: number;
    isWorking: boolean;
    isAvailable: boolean;
    disabledUntil: string | null;
    totalSuccesses: number;
    totalFailures: number;
    lastError?: string;
    successRate: string;
  }> {
    const now = Date.now();
    
    return this.keyStatuses.map(key => ({
      keyIndex: key.originalIndex + 1,
      isWorking: key.isWorking,
      isAvailable: this.isKeyAvailable(key),
      disabledUntil: key.disabledUntil ? new Date(key.disabledUntil).toLocaleString() : null,
      totalSuccesses: key.totalSuccesses,
      totalFailures: key.totalFailures,
      lastError: key.lastError,
      successRate: key.totalSuccesses + key.totalFailures > 0 
        ? `${Math.round((key.totalSuccesses / (key.totalSuccesses + key.totalFailures)) * 100)}%`
        : 'N/A'
    }));
  }

  // Manually re-enable a specific key
  enableKey(keyIndex: number) {
    const key = this.keyStatuses.find(k => k.originalIndex === keyIndex - 1);
    if (key) {
      key.isWorking = true;
      key.disabledUntil = null;
      console.log(`🔄 Manually enabled KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  // Manually disable a specific key for 24 hours
  disableKey(keyIndex: number, reason: string = "Manual disable") {
    const key = this.keyStatuses.find(k => k.originalIndex === keyIndex - 1);
    if (key) {
      key.isWorking = false;
      key.disabledUntil = Date.now() + (this.disableDurationHours * 60 * 60 * 1000);
      key.lastError = reason;
      console.log(`🚫 Manually disabled KEY-${keyIndex} until ${new Date(key.disabledUntil).toLocaleString()}`);
      return true;
    }
    return false;
  }

  // Reset all keys to working state
  resetAllKeys() {
    this.keyStatuses.forEach(key => {
      key.isWorking = true;
      key.disabledUntil = null;
      key.lastError = undefined;
    });
    console.log("🔄 Reset all keys to working state");
  }

  // Set custom disable duration (in hours)
  setDisableDuration(hours: number) {
    this.disableDurationHours = hours;
    console.log(`⏰ Set disable duration to ${hours} hours`);
  }
}

// Create a singleton instance
const geminiManager = new GeminiKeyManager();

// Export the main function
export async function getGenerativeResponse(
  prompt: string
): Promise<{ text: string; apiKey: string }> {
  return geminiManager.getGenerativeResponse(prompt);
}

// Export utility functions for debugging/management
export function getKeyStatuses() {
  return geminiManager.getKeyStatuses();
}

export function enableKey(keyIndex: number) {
  return geminiManager.enableKey(keyIndex);
}

export function disableKey(keyIndex: number, reason?: string) {
  return geminiManager.disableKey(keyIndex, reason);
}

export function resetAllKeys() {
  return geminiManager.resetAllKeys();
}

export function setDisableDuration(hours: number) {
  return geminiManager.setDisableDuration(hours);
}