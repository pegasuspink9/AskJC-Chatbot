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
  avgResponseTime?: number; // 🚀 NEW: Track response speed
}

class GeminiKeyManager {
  private keyStatuses: ApiKeyStatus[];
  private disableDurationHours: number = 24;
  private maxConsecutiveFailures: number = 3;
  private maxFailureRate: number = 0.7;
  private minTrialsBeforeRetirement: number = 5;
  
  // 🚀 NEW: Response cache for identical prompts
  private responseCache: Map<string, { text: string; timestamp: number }> = new Map();
  private cacheExpiryMs: number = 5 * 60 * 1000; // 5 minutes
  
  // 🚀 NEW: Reuse AI instances per key
  private aiInstances: Map<string, GoogleGenAI> = new Map();

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
      avgResponseTime: 0, // 🚀 NEW
    }));

    console.log(`🔑 Initialized ${keys.length} Gemini API keys`);
  }

  private isKeyAvailable(keyStatus: ApiKeyStatus): boolean {
    if (keyStatus.isRetired) {
      return false;
    }

    const now = Date.now();

    if (keyStatus.disabledUntil && now < keyStatus.disabledUntil) {
      return false;
    }

    if (keyStatus.disabledUntil && now >= keyStatus.disabledUntil) {
      keyStatus.disabledUntil = null;
      keyStatus.isWorking = true;
      console.log(`🔄 KEY-${keyStatus.originalIndex + 1} auto-enabled`);
    }

    return keyStatus.isWorking;
  }

  private shouldRetireKey(keyStatus: ApiKeyStatus): boolean {
    const totalTrials = keyStatus.totalSuccesses + keyStatus.totalFailures;
    
    if (totalTrials < this.minTrialsBeforeRetirement) {
      return false;
    }

    if (keyStatus.consecutiveFailures >= this.maxConsecutiveFailures) {
      return true;
    }

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

  private getAvailableKeys(): ApiKeyStatus[] {
    return this.keyStatuses.filter(key => this.isKeyAvailable(key));
  }

  // 🚀 OPTIMIZED: Select fastest key based on response time
  private getBestAvailableKey(): ApiKeyStatus | null {
    const availableKeys = this.getAvailableKeys();
    
    if (availableKeys.length === 0) {
      return null;
    }

    // 🚀 SPEED PRIORITY: Use keys with fastest average response time
    const perfectKeys = availableKeys.filter(k => k.consecutiveFailures === 0);
    if (perfectKeys.length > 0) {
      // Sort by response time (fastest first), then by success count
      return perfectKeys.sort((a, b) => {
        const aTime = a.avgResponseTime || 999999;
        const bTime = b.avgResponseTime || 999999;
        if (Math.abs(aTime - bTime) < 100) { // Within 100ms, prefer more successful
          return b.totalSuccesses - a.totalSuccesses;
        }
        return aTime - bTime; // Faster is better
      })[0];
    }

    return availableKeys.sort((a, b) => {
      if (a.consecutiveFailures !== b.consecutiveFailures) {
        return a.consecutiveFailures - b.consecutiveFailures;
      }
      return b.lastSuccessAt - a.lastSuccessAt;
    })[0];
  }

  // 🚀 NEW: Track response time
  private markKeySuccess(keyStatus: ApiKeyStatus, responseTimeMs: number) {
    const now = Date.now();
    keyStatus.isWorking = true;
    keyStatus.disabledUntil = null;
    keyStatus.lastSuccessAt = now;
    keyStatus.totalSuccesses++;
    keyStatus.consecutiveFailures = 0;
    
    // Calculate rolling average response time
    if (keyStatus.avgResponseTime) {
      keyStatus.avgResponseTime = (keyStatus.avgResponseTime * 0.7) + (responseTimeMs * 0.3);
    } else {
      keyStatus.avgResponseTime = responseTimeMs;
    }
    
    console.log(`✅ KEY-${keyStatus.originalIndex + 1} success (${responseTimeMs}ms, avg: ${Math.round(keyStatus.avgResponseTime)}ms)`);
  }

  private markKeyFailure(keyStatus: ApiKeyStatus, error: string) {
    const now = Date.now();
    keyStatus.isWorking = false;
    keyStatus.lastFailureAt = now;
    keyStatus.totalFailures++;
    keyStatus.consecutiveFailures++;
    keyStatus.lastError = error;

    if (this.shouldRetireKey(keyStatus)) {
      const reason = keyStatus.consecutiveFailures >= this.maxConsecutiveFailures
        ? `${this.maxConsecutiveFailures} consecutive failures`
        : `High failure rate: ${Math.round((keyStatus.totalFailures / (keyStatus.totalSuccesses + keyStatus.totalFailures)) * 100)}%`;
      
      this.retireKey(keyStatus, reason);
      return;
    }

    keyStatus.disabledUntil = now + this.disableDurationHours * 60 * 60 * 1000;
    console.log(`❌ KEY-${keyStatus.originalIndex + 1} failed (${keyStatus.consecutiveFailures} consecutive) - disabled temporarily`);
  }

  // 🚀 NEW: Get or create cached AI instance
  private getAIInstance(key: string): GoogleGenAI {
    if (!this.aiInstances.has(key)) {
      this.aiInstances.set(key, new GoogleGenAI({ apiKey: key }));
    }
    return this.aiInstances.get(key)!;
  }

  // 🚀 NEW: Generate cache key
  private getCacheKey(prompt: string, history: string[]): string {
    return `${history.slice(-4).join('|')}|${prompt}`;
  }

  // 🚀 OPTIMIZED: Faster generation with caching and reused instances
  private async tryGenerate(
    prompt: string,  // Changed from fullPrompt: string
    history: string[],  // Added history parameter
    keyStatus: ApiKeyStatus,
    cacheKey: string
  ): Promise<{ text: string; apiKey: string; responseTime: number; fromCache: boolean }> {
    const startTime = Date.now();
  
    
    // 🚀 Check cache first
    const cached = this.responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheExpiryMs)) {
      console.log(`⚡ Cache hit! (${Date.now() - startTime}ms)`);
      return {
        text: cached.text,
        apiKey: `KEY-${keyStatus.originalIndex + 1}`,
        responseTime: Date.now() - startTime,
        fromCache: true,
      };
    }

    // 🚀 Reuse AI instance instead of creating new one
    const ai = this.getAIInstance(keyStatus.key);


    const contents = [];

    for (let i = 0; i < history.length; i++) {
    if (history[i] && history[i].trim().length > 0) { 
      contents.push({
        role: i % 2 === 0 ? 'user' : 'model', 
        parts: [{ text: history[i] }],
      });
    }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    console.log(`📝 Sending ${contents.length} messages (${history.length} history + current prompt)`);

    // Use the correct API structure for @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // 🚀 Faster experimental model
      contents: contents,
    });

    const text = response.text;

    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini");
    }

    const responseTime = Date.now() - startTime;

    // 🚀 Cache the response
    this.responseCache.set(cacheKey, { text, timestamp: Date.now() });
    
    // 🚀 Clean old cache entries (keep cache size manageable)
    if (this.responseCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of this.responseCache.entries()) {
        if (now - value.timestamp > this.cacheExpiryMs) {
          this.responseCache.delete(key);
        }
      }
    }

    return {
      text,
      apiKey: `KEY-${keyStatus.originalIndex + 1}`,
      responseTime,
      fromCache: false,
    };
  }

async getGenerativeResponse(
  prompt: string,
  conversationHistory: string[] = []
): Promise<{ text: string; apiKey: string }> {
  const availableKeys = this.getAvailableKeys();
  
  if (availableKeys.length === 0) {
    const retiredCount = this.keyStatuses.filter(k => k.isRetired).length;
    const disabledCount = this.keyStatuses.filter(k => !k.isRetired && k.disabledUntil).length;
    
    throw new Error(
      `No Gemini API keys available. ${retiredCount} retired, ${disabledCount} temporarily disabled.`
    );
  }

  // 🚀 OPTIMIZED: Limit history to last 20 messages (10 exchanges)
  const recentHistory = conversationHistory.slice(-20);

  console.log(`🗣️ Conversation History (${recentHistory.length} messages):`);
  recentHistory.forEach((msg, idx) => {
    console.log(`  [${idx % 2 === 0 ? 'USER' : 'BOT'}] ${msg.substring(0, 100)}...`);
  });

  // 🚀 Generate cache key
  const cacheKey = this.getCacheKey(prompt, recentHistory);

  console.log(`🚀 ${availableKeys.length} keys ready, trying best available...`);

  let attempt = 0;
  while (attempt < availableKeys.length) {
    const keyStatus = this.getBestAvailableKey();
    
    if (!keyStatus) {
      throw new Error("No available keys during generation");
    }

    try {
      console.log(`🔑 Trying KEY-${keyStatus.originalIndex + 1} (avg: ${Math.round(keyStatus.avgResponseTime || 0)}ms)`);
      
      // 🚀 Fixed: Pass prompt, history, keyStatus, cacheKey (4 arguments)
      const result = await this.tryGenerate(prompt, recentHistory, keyStatus, cacheKey);
      
      if (!result.fromCache) {
        this.markKeySuccess(keyStatus, result.responseTime);
      }
      
      return { text: result.text, apiKey: result.apiKey };
    } catch (error: any) {
      console.log(`❌ KEY-${keyStatus.originalIndex + 1}: ${error.message}`);
      this.markKeyFailure(keyStatus, error.message);
      
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

  // 🚀 NEW: Clear cache manually
  clearCache() {
    this.responseCache.clear();
    console.log('🧹 Response cache cleared');
  }

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
      avgResponseTime: key.avgResponseTime ? `${Math.round(key.avgResponseTime)}ms` : 'N/A', // 🚀 NEW
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
      cacheSize: this.responseCache.size, // 🚀 NEW
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

  // 🚀 NEW: Set cache expiry time
  setCacheExpiry(minutes: number) {
    this.cacheExpiryMs = minutes * 60 * 1000;
    console.log(`⏱️ Cache expiry: ${minutes} minutes`);
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

// 🚀 NEW: Cache management
export function clearCache() {
  return geminiManager.clearCache();
}

export function setCacheExpiry(minutes: number) {
  return geminiManager.setCacheExpiry(minutes);
}