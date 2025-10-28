import { GoogleGenAI } from "@google/genai";

interface ApiKeyStatus {
  key: string;
  originalIndex: number;
  isWorking: boolean;
  isRetired: boolean;
  disabledUntil: number | null;
  lastSuccessAt: number;
  lastFailureAt: number;
  totalSuccesses: number;
  totalFailures: number;
  consecutiveFailures: number;
  lastError?: string;
  retiredReason?: string;
}

class GeminiKeyManager {
  private keyStatuses: ApiKeyStatus[];
  private disableDurationHours: number = 24;
  private maxConsecutiveFailures: number = 3; // Reduced for faster retirement
  private maxFailureRate: number = 0.7; // Lowered threshold
  private minTrialsBeforeRetirement: number = 5; // Reduced for faster decisions

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
      isRetired: false,
      disabledUntil: null,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      consecutiveFailures: 0,
    }));

    console.log(`🔑 Initialized ${keys.length} Gemini API keys`);
  }

  // ✅ OPTIMIZED: Skip expired/retired keys immediately
  private isKeyAvailable(keyStatus: ApiKeyStatus): boolean {
    // 🚀 FAST SKIP: Immediately skip retired keys
    if (keyStatus.isRetired) {
      return false;
    }

    const now = Date.now();

    // 🚀 FAST SKIP: Immediately skip disabled keys
    if (keyStatus.disabledUntil && now < keyStatus.disabledUntil) {
      return false;
    }

    // Auto-enable if disable period has passed
    if (keyStatus.disabledUntil && now >= keyStatus.disabledUntil) {
      keyStatus.disabledUntil = null;
      keyStatus.isWorking = true;
      console.log(`🔄 KEY-${keyStatus.originalIndex + 1} auto-enabled`);
    }

    return keyStatus.isWorking;
  }

  // ✅ OPTIMIZED: More aggressive retirement criteria
  private shouldRetireKey(keyStatus: ApiKeyStatus): boolean {
    const totalTrials = keyStatus.totalSuccesses + keyStatus.totalFailures;
    
    // Don't retire until minimum trials
    if (totalTrials < this.minTrialsBeforeRetirement) {
      return false;
    }

    // 🚀 FAST RETIREMENT: Retire quickly on consecutive failures
    if (keyStatus.consecutiveFailures >= this.maxConsecutiveFailures) {
      return true;
    }

    // 🚀 FAST RETIREMENT: Retire on high failure rate
    const failureRate = keyStatus.totalFailures / totalTrials;
    if (failureRate > this.maxFailureRate) {
      return true;
    }

    return false;
  }

  private retireKey(keyStatus: ApiKeyStatus, reason: string) {
    keyStatus.isRetired = true;
    keyStatus.isWorking = false;
    keyStatus.retiredReason = reason;
    keyStatus.disabledUntil = null;
    
    console.log(`🚫 KEY-${keyStatus.originalIndex + 1} RETIRED: ${reason}`);
    
    const activeKeys = this.getAvailableKeys().length;
    console.log(`📊 ${activeKeys} keys remaining active`);
  }

  // ✅ OPTIMIZED: Cache available keys for faster access
  private getAvailableKeys(): ApiKeyStatus[] {
    return this.keyStatuses.filter(key => this.isKeyAvailable(key));
  }

  // ✅ OPTIMIZED: Smarter key selection prioritizing recent successes
  private getBestAvailableKey(): ApiKeyStatus | null {
    const availableKeys = this.getAvailableKeys();
    
    if (availableKeys.length === 0) {
      return null;
    }

    // 🚀 FAST SELECTION: Prioritize keys that have never failed
    const perfectKeys = availableKeys.filter(k => k.consecutiveFailures === 0);
    if (perfectKeys.length > 0) {
      return perfectKeys.sort((a, b) => b.lastSuccessAt - a.lastSuccessAt)[0];
    }

    // 🚀 FALLBACK: Use key with fewest consecutive failures
    return availableKeys.sort((a, b) => {
      if (a.consecutiveFailures !== b.consecutiveFailures) {
        return a.consecutiveFailures - b.consecutiveFailures;
      }
      return b.lastSuccessAt - a.lastSuccessAt;
    })[0];
  }

  private markKeySuccess(keyStatus: ApiKeyStatus) {
    const now = Date.now();
    keyStatus.isWorking = true;
    keyStatus.disabledUntil = null;
    keyStatus.lastSuccessAt = now;
    keyStatus.totalSuccesses++;
    keyStatus.consecutiveFailures = 0; // Reset on success
    
    console.log(`✅ KEY-${keyStatus.originalIndex + 1} success (${keyStatus.totalSuccesses} total)`);
  }

  private markKeyFailure(keyStatus: ApiKeyStatus, error: string) {
    const now = Date.now();
    keyStatus.isWorking = false;
    keyStatus.lastFailureAt = now;
    keyStatus.totalFailures++;
    keyStatus.consecutiveFailures++;
    keyStatus.lastError = error;

    // 🚀 IMMEDIATE RETIREMENT CHECK
    if (this.shouldRetireKey(keyStatus)) {
      const reason = keyStatus.consecutiveFailures >= this.maxConsecutiveFailures
        ? `${this.maxConsecutiveFailures} consecutive failures`
        : `High failure rate: ${Math.round((keyStatus.totalFailures / (keyStatus.totalSuccesses + keyStatus.totalFailures)) * 100)}%`;
      
      this.retireKey(keyStatus, reason);
      return;
    }

    // Temporary disable for recoverable failures
    keyStatus.disabledUntil = now + this.disableDurationHours * 60 * 60 * 1000;
    console.log(`❌ KEY-${keyStatus.originalIndex + 1} failed (${keyStatus.consecutiveFailures} consecutive) - disabled temporarily`);
  }

  private async tryGenerate(
    fullPrompt: string,
    keyStatus: ApiKeyStatus
  ): Promise<{ text: string; apiKey: string }> {
    const ai = new GoogleGenAI({ apiKey: keyStatus.key });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const text = response.text;

    console.log("Full Gemini response:", JSON.stringify(response, null, 2));
    console.log("Extracted text:", text);

    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini");
    }

    return {
      text,
      apiKey: `KEY-${keyStatus.originalIndex + 1}`,
    };
  }

  // ✅ OPTIMIZED: Fast response from first available key
  async getGenerativeResponse(
    prompt: string,
    conversationHistory: string[] = []
  ): Promise<{ text: string; apiKey: string }> {
    // 🚀 IMMEDIATE CHECK: Get only available keys
    const availableKeys = this.getAvailableKeys();
    
    // Early exit if no keys available
    if (availableKeys.length === 0) {
      const retiredCount = this.keyStatuses.filter(k => k.isRetired).length;
      const disabledCount = this.keyStatuses.filter(k => !k.isRetired && k.disabledUntil).length;
      
      throw new Error(
        `No Gemini API keys available. ${retiredCount} retired, ${disabledCount} temporarily disabled.`
      );
    }

    const historyFormatted = conversationHistory
      .map((turn, index) => `${index % 2 === 0 ? "User" : "Chatbot"}: ${turn}`)
      .join("\n");

    const fullPrompt = historyFormatted
      ? `${historyFormatted}\nUser: ${prompt}`
      : `User: ${prompt}`;

    console.log(`🚀 ${availableKeys.length} keys ready, trying best available...`);

    // 🚀 OPTIMIZED: Only try available keys, start with best
    let attempt = 0;
    while (attempt < availableKeys.length) {
      const keyStatus = this.getBestAvailableKey();
      
      if (!keyStatus) {
        throw new Error("No available keys during generation");
      }

      try {
        console.log(`🔑 Trying KEY-${keyStatus.originalIndex + 1} (${keyStatus.consecutiveFailures} failures)`);
        const result = await this.tryGenerate(fullPrompt, keyStatus);
        this.markKeySuccess(keyStatus);
        return result; // 🚀 FAST RETURN on first success
      } catch (error: any) {
        console.log(`❌ KEY-${keyStatus.originalIndex + 1}: ${error.message}`);
        this.markKeyFailure(keyStatus, error.message);
        
        // Re-check available keys after failure
        const remainingKeys = this.getAvailableKeys();
        if (remainingKeys.length === 0) {
          throw new Error(`All keys failed or retired. Last error: ${error.message}`);
        }
        
        attempt++;
        console.log(`🔄 ${remainingKeys.length} keys remaining, trying next...`);
      }
    }

    throw new Error("All available keys exhausted");
  }

  // Enhanced status and management methods remain the same...
  getKeyStatuses() {
    return this.keyStatuses.map((key) => ({
      keyIndex: key.originalIndex + 1,
      isWorking: key.isWorking,
      isAvailable: this.isKeyAvailable(key),
      isRetired: key.isRetired,
      retiredReason: key.retiredReason,
      consecutiveFailures: key.consecutiveFailures,
      disabledUntil: key.disabledUntil ? new Date(key.disabledUntil).toLocaleString() : null,
      totalSuccesses: key.totalSuccesses,
      totalFailures: key.totalFailures,
      lastError: key.lastError,
      successRate: key.totalSuccesses + key.totalFailures > 0
        ? `${Math.round((key.totalSuccesses / (key.totalSuccesses + key.totalFailures)) * 100)}%`
        : "N/A",
    }));
  }

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
      healthyKeys: this.keyStatuses.filter(k => !k.isRetired && k.consecutiveFailures === 0).length,
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

  getAvailableKeyCount(): number {
    return this.getAvailableKeys().length;
  }

  // Management methods...
  forceRetireKey(keyIndex: number, reason: string = "Manual retirement") {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      this.retireKey(key, reason);
      return true;
    }
    return false;
  }

  restoreRetiredKey(keyIndex: number) {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && key.isRetired) {
      key.isRetired = false;
      key.isWorking = true;
      key.retiredReason = undefined;
      key.consecutiveFailures = 0;
      key.disabledUntil = null;
      console.log(`🔄 Restored KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  enableKey(keyIndex: number) {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      key.isWorking = true;
      key.disabledUntil = null;
      key.consecutiveFailures = 0;
      console.log(`🔄 Enabled KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  disableKey(keyIndex: number, reason: string = "Manual disable") {
    const key = this.keyStatuses.find((k) => k.originalIndex === keyIndex - 1);
    if (key && !key.isRetired) {
      key.isWorking = false;
      key.disabledUntil = Date.now() + this.disableDurationHours * 60 * 60 * 1000;
      key.lastError = reason;
      console.log(`🚫 Disabled KEY-${keyIndex}`);
      return true;
    }
    return false;
  }

  resetAllKeys() {
    this.keyStatuses.forEach((key) => {
      if (!key.isRetired) {
        key.isWorking = true;
        key.disabledUntil = null;
        key.consecutiveFailures = 0;
        key.lastError = undefined;
      }
    });
    const activeCount = this.keyStatuses.filter(k => !k.isRetired).length;
    console.log(`🔄 Reset ${activeCount} non-retired keys`);
  }

  setRetirementSettings(maxConsecutiveFailures: number, maxFailureRate: number, minTrials: number) {
    this.maxConsecutiveFailures = maxConsecutiveFailures;
    this.maxFailureRate = maxFailureRate;
    this.minTrialsBeforeRetirement = minTrials;
    console.log(`⚙️ Updated retirement settings: ${maxConsecutiveFailures} consecutive, ${Math.round(maxFailureRate * 100)}% rate, ${minTrials} trials`);
  }

  setDisableDuration(hours: number) {
    this.disableDurationHours = hours;
    console.log(`⏰ Disable duration: ${hours} hours`);
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