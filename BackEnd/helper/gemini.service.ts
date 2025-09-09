import { GoogleGenerativeAI } from "@google/generative-ai";

interface ApiKeyStatus {
  key: string;
  originalIndex: number;
  isWorking: boolean;
  isRetired: boolean; // NEW: Permanently retired keys
  disabledUntil: number | null;
  lastSuccessAt: number;
  lastFailureAt: number;
  totalSuccesses: number;
  totalFailures: number;
  consecutiveFailures: number; // NEW: Track consecutive failures
  lastError?: string;
  retiredReason?: string; // NEW: Why this key was retired
}

class GeminiKeyManager {
  private keyStatuses: ApiKeyStatus[];
  private disableDurationHours: number = 24;
  private maxConsecutiveFailures: number = 5; // NEW: Retire after 5 consecutive failures
  private maxFailureRate: number = 0.8; // NEW: Retire if failure rate > 80%
  private minTrialsBeforeRetirement: number = 10; // NEW: Minimum trials before considering retirement

  constructor() {
    const keys = (process.env.GEMINI_API_KEYS || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keys.length === 0) {
      throw new Error("No Gemini API keys configured in GEMINI_API_KEYS");
    }

    this.keyStatuses = keys.map((key, index) => ({
      key,
      originalIndex: index,
      isWorking: true,
      isRetired: false, // NEW
      disabledUntil: null,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      consecutiveFailures: 0, // NEW
    }));

    console.log(`🔑 Initialized ${keys.length} Gemini API keys`);
  }

  private isKeyAvailable(keyStatus: ApiKeyStatus): boolean {
    // NEW: Skip retired keys completely
    if (keyStatus.isRetired) {
      return false;
    }

    const now = Date.now();

    // Check if key is temporarily disabled
    if (keyStatus.disabledUntil && now < keyStatus.disabledUntil) {
      return false;
    }

    // Re-enable key if disable period has passed
    if (keyStatus.disabledUntil && now >= keyStatus.disabledUntil) {
      keyStatus.disabledUntil = null;
      keyStatus.isWorking = true;
      const hoursDisabled = Math.round(
        (now - keyStatus.lastFailureAt) / (1000 * 60 * 60)
      );
      console.log(
        `🔄 KEY-${keyStatus.originalIndex + 1} re-enabled after ${hoursDisabled} hours`
      );
    }

    return keyStatus.isWorking;
  }

  // NEW: Check if a key should be permanently retired
  private shouldRetireKey(keyStatus: ApiKeyStatus): boolean {
    const totalTrials = keyStatus.totalSuccesses + keyStatus.totalFailures;
    
    // Don't retire until minimum trials
    if (totalTrials < this.minTrialsBeforeRetirement) {
      return false;
    }

    // Retire if too many consecutive failures
    if (keyStatus.consecutiveFailures >= this.maxConsecutiveFailures) {
      return true;
    }

    // Retire if failure rate is too high
    const failureRate = keyStatus.totalFailures / totalTrials;
    if (failureRate > this.maxFailureRate) {
      return true;
    }

    return false;
  }

  // NEW: Permanently retire a key
  private retireKey(keyStatus: ApiKeyStatus, reason: string) {
    keyStatus.isRetired = true;
    keyStatus.isWorking = false;
    keyStatus.retiredReason = reason;
    keyStatus.disabledUntil = null; // Clear temporary disable
    
    console.log(`🚫 KEY-${keyStatus.originalIndex + 1} PERMANENTLY RETIRED: ${reason}`);
    console.log(`   Stats: ${keyStatus.totalSuccesses} successes, ${keyStatus.totalFailures} failures`);
    
    // Log remaining active keys
    const activeKeys = this.getAvailableKeys().length;
    console.log(`📊 ${activeKeys} keys remaining active`);
  }

  // Get only available (non-retired, non-disabled) keys
  private getAvailableKeys(): ApiKeyStatus[] {
    return this.keyStatuses.filter(key => this.isKeyAvailable(key));
  }

  // Get only active (non-retired) keys
  private getActiveKeys(): ApiKeyStatus[] {
    return this.keyStatuses.filter(key => !key.isRetired);
  }

  private getBestAvailableKey(): ApiKeyStatus | null {
    const availableKeys = this.getAvailableKeys();
    
    if (availableKeys.length === 0) {
      return null;
    }

    // Sort by success rate and recency, prioritizing keys with fewer consecutive failures
    return availableKeys.sort((a, b) => {
      // Strongly prefer keys with fewer consecutive failures
      if (a.consecutiveFailures !== b.consecutiveFailures) {
        return a.consecutiveFailures - b.consecutiveFailures;
      }

      // Prefer keys with recent successes
      if (a.lastSuccessAt !== b.lastSuccessAt) {
        return b.lastSuccessAt - a.lastSuccessAt;
      }
      
      // Then prefer keys with higher success rates
      const aRate = a.totalSuccesses / (a.totalSuccesses + a.totalFailures || 1);
      const bRate = b.totalSuccesses / (b.totalSuccesses + b.totalFailures || 1);
      if (aRate !== bRate) {
        return bRate - aRate;
      }

      // Finally, prefer least recently used
      const aLastUsed = Math.max(a.lastSuccessAt, a.lastFailureAt);
      const bLastUsed = Math.max(b.lastSuccessAt, b.lastFailureAt);
      return aLastUsed - bLastUsed;
    })[0];
  }

  private markKeySuccess(keyStatus: ApiKeyStatus) {
    const now = Date.now();
    keyStatus.isWorking = true;
    keyStatus.disabledUntil = null;
    keyStatus.lastSuccessAt = now;
    keyStatus.totalSuccesses++;
    keyStatus.consecutiveFailures = 0; // NEW: Reset consecutive failures on success
    
    console.log(
      `✅ KEY-${keyStatus.originalIndex + 1} successful (${keyStatus.totalSuccesses} total, consecutive failures reset)`
    );
  }

  private markKeyFailure(keyStatus: ApiKeyStatus, error: string) {
    const now = Date.now();
    keyStatus.isWorking = false;
    keyStatus.lastFailureAt = now;
    keyStatus.totalFailures++;
    keyStatus.consecutiveFailures++; // NEW: Increment consecutive failures
    keyStatus.lastError = error;

    // NEW: Check if key should be retired
    if (this.shouldRetireKey(keyStatus)) {
      const reason = keyStatus.consecutiveFailures >= this.maxConsecutiveFailures
        ? `${this.maxConsecutiveFailures} consecutive failures`
        : `High failure rate: ${Math.round((keyStatus.totalFailures / (keyStatus.totalSuccesses + keyStatus.totalFailures)) * 100)}%`;
      
      this.retireKey(keyStatus, reason);
      return; // Don't set temporary disable for retired keys
    }

    // Temporary disable for non-retired keys
    keyStatus.disabledUntil = now + this.disableDurationHours * 60 * 60 * 1000;

    const disabledUntilDate = new Date(keyStatus.disabledUntil).toLocaleString();
    console.log(
      `❌ KEY-${keyStatus.originalIndex + 1} failed (${keyStatus.consecutiveFailures} consecutive) - disabled until ${disabledUntilDate}`
    );
    console.log(`   Error: ${error}`);
  }

  private async tryGenerate(
    fullPrompt: string,
    keyStatus: ApiKeyStatus
  ): Promise<{ text: string; apiKey: string }> {
    const genAI = new GoogleGenerativeAI(keyStatus.key);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return {
      text,
      apiKey: `KEY-${keyStatus.originalIndex + 1}`,
    };
  }

  async getGenerativeResponse(
    prompt: string,
    conversationHistory: string[] = []
  ): Promise<{ text: string; apiKey: string }> {
    const availableKeys = this.getAvailableKeys();
    const activeKeys = this.getActiveKeys();

    // Early exit if no keys are available
    if (availableKeys.length === 0) {
      const retiredCount = this.keyStatuses.filter(k => k.isRetired).length;
      
      if (activeKeys.length === 0) {
        throw new Error(
          `All ${this.keyStatuses.length} Gemini API keys have been permanently retired due to failures.`
        );
      }

      const nextAvailableTime = Math.min(
        ...activeKeys
          .filter((key) => key.disabledUntil)
          .map((key) => key.disabledUntil!)
      );
      
      const hoursUntilNext = Math.ceil(
        (nextAvailableTime - Date.now()) / (1000 * 60 * 60)
      );
      
      throw new Error(
        `All available Gemini API keys are temporarily disabled. ${retiredCount} keys retired permanently. Next key available in ~${hoursUntilNext} hours.`
      );
    }

    const historyFormatted = conversationHistory
      .map((turn, index) => `${index % 2 === 0 ? "User" : "Chatbot"}: ${turn}`)
      .join("\n");

    const fullPrompt = historyFormatted
      ? `${historyFormatted}\nUser: ${prompt}`
      : `User: ${prompt}`;

    const retiredCount = this.keyStatuses.filter(k => k.isRetired).length;
    console.log(
      `🔍 ${availableKeys.length} keys available, ${retiredCount} retired, out of ${this.keyStatuses.length} total`
    );

    // Only attempt with available keys
    for (let attempt = 0; attempt < availableKeys.length; attempt++) {
      const keyStatus = this.getBestAvailableKey();
      
      if (!keyStatus) {
        throw new Error("No available Gemini API keys");
      }

      try {
        console.log(`🔑 Trying KEY-${keyStatus.originalIndex + 1} (attempt ${attempt + 1}, ${keyStatus.consecutiveFailures} consecutive failures)`);
        const result = await this.tryGenerate(fullPrompt, keyStatus);
        this.markKeySuccess(keyStatus);
        return result;
      } catch (error: any) {
        console.log(`❌ KEY-${keyStatus.originalIndex + 1} failed: ${error.message}`);
        this.markKeyFailure(keyStatus, error.message);
        
        // Check if we still have available keys after this failure
        const remainingKeys = this.getAvailableKeys();
        if (remainingKeys.length === 0) {
          const retiredNow = this.keyStatuses.filter(k => k.isRetired).length;
          throw new Error(
            `All available Gemini API keys failed or retired. ${retiredNow} keys permanently retired. Last error: ${error.message}`
          );
        }
        
        if (attempt < availableKeys.length - 1) {
          console.log("🔄 Trying next available key...");
        }
      }
    }

    throw new Error("All available Gemini API keys have been exhausted");
  }

  // Enhanced status methods
  getKeyStatuses() {
    const now = Date.now();
    return this.keyStatuses.map((key) => ({
      keyIndex: key.originalIndex + 1,
      isWorking: key.isWorking,
      isAvailable: this.isKeyAvailable(key),
      isRetired: key.isRetired, // NEW
      retiredReason: key.retiredReason, // NEW
      consecutiveFailures: key.consecutiveFailures, // NEW
      disabledUntil: key.disabledUntil
        ? new Date(key.disabledUntil).toLocaleString()
        : null,
      totalSuccesses: key.totalSuccesses,
      totalFailures: key.totalFailures,
      lastError: key.lastError,
      successRate:
        key.totalSuccesses + key.totalFailures > 0
          ? `${Math.round(
              (key.totalSuccesses / (key.totalSuccesses + key.totalFailures)) *
                100
            )}%`
          : "N/A",
    }));
  }

  // NEW: Get summary statistics
  getKeysSummary() {
    const total = this.keyStatuses.length;
    const available = this.getAvailableKeys().length;
    const retired = this.keyStatuses.filter(k => k.isRetired).length;
    const disabled = this.keyStatuses.filter(k => !k.isRetired && !this.isKeyAvailable(k)).length;

    return {
      total,
      available,
      retired,
      temporarilyDisabled: disabled,
      retiredKeys: this.keyStatuses
        .filter(k => k.isRetired)
        .map(k => ({
          keyIndex: k.originalIndex + 1,
          reason: k.retiredReason,
          failures: k.totalFailures,
          successes: k.totalSuccesses
        }))
    };
  }

  // Get count of available keys
  getAvailableKeyCount(): number {
    return this.getAvailableKeys().length;
  }

  // NEW: Force retire a key
  forceRetireKey(keyIndex: number, reason: string = "Manual retirement") {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      this.retireKey(key, reason);
      return true;
    }
    return false;
  }

  // NEW: Restore a retired key (use with caution)
  restoreRetiredKey(keyIndex: number) {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && key.isRetired) {
      key.isRetired = false;
      key.isWorking = true;
      key.retiredReason = undefined;
      key.consecutiveFailures = 0;
      key.disabledUntil = null;
      console.log(`🔄 Restored retired KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  enableKey(keyIndex: number) {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      key.isWorking = true;
      key.disabledUntil = null;
      key.consecutiveFailures = 0; // Reset consecutive failures
      console.log(`🔄 Manually enabled KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  disableKey(keyIndex: number, reason: string = "Manual disable") {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      key.isWorking = false;
      key.disabledUntil =
        Date.now() + this.disableDurationHours * 60 * 60 * 1000;
      key.lastError = reason;
      console.log(
        `🚫 Manually disabled KEY-${keyIndex} until ${new Date(
          key.disabledUntil
        ).toLocaleString()}`
      );
      return true;
    }
    return false;
  }

  resetAllKeys() {
    this.keyStatuses.forEach((key) => {
      if (!key.isRetired) { // Don't reset retired keys
        key.isWorking = true;
        key.disabledUntil = null;
        key.consecutiveFailures = 0;
        key.lastError = undefined;
      }
    });
    const activeCount = this.keyStatuses.filter(k => !k.isRetired).length;
    console.log(`🔄 Reset ${activeCount} non-retired keys to working state`);
  }

  // NEW: Reset retirement settings
  setRetirementSettings(maxConsecutiveFailures: number, maxFailureRate: number, minTrials: number) {
    this.maxConsecutiveFailures = maxConsecutiveFailures;
    this.maxFailureRate = maxFailureRate;
    this.minTrialsBeforeRetirement = minTrials;
    console.log(`⚙️ Updated retirement settings: ${maxConsecutiveFailures} max consecutive failures, ${Math.round(maxFailureRate * 100)}% max failure rate, ${minTrials} min trials`);
  }

  setDisableDuration(hours: number) {
    this.disableDurationHours = hours;
    console.log(`⏰ Set disable duration to ${hours} hours`);
  }
}

const geminiManager = new GeminiKeyManager();

export async function getGenerativeResponse(
  prompt: string,
  conversationHistory: string[] = []
): Promise<{ text: string; apiKey: string }> {
  return geminiManager.getGenerativeResponse(prompt, conversationHistory);
}

export function getKeyStatuses() {
  return geminiManager.getKeyStatuses();
}

export function getKeysSummary() {
  return geminiManager.getKeysSummary();
}

export function getAvailableKeyCount() {
  return geminiManager.getAvailableKeyCount();
}

export function enableKey(keyIndex: number) {
  return geminiManager.enableKey(keyIndex);
}

export function disableKey(keyIndex: number, reason?: string) {
  return geminiManager.disableKey(keyIndex, reason);
}

export function forceRetireKey(keyIndex: number, reason?: string) {
  return geminiManager.forceRetireKey(keyIndex, reason);
}

export function restoreRetiredKey(keyIndex: number) {
  return geminiManager.restoreRetiredKey(keyIndex);
}

export function resetAllKeys() {
  return geminiManager.resetAllKeys();
}

export function setRetirementSettings(maxConsecutiveFailures: number, maxFailureRate: number, minTrials: number) {
  return geminiManager.setRetirementSettings(maxConsecutiveFailures, maxFailureRate, minTrials);
}

export function setDisableDuration(hours: number) {
  return geminiManager.setDisableDuration(hours);
}