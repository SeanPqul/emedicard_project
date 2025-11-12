/**
 * Health Tips Service
 *
 * Fetches health and wellness quotes from Quotable API
 * API: https://api.quotable.io
 * Documentation: https://github.com/lukePeavey/quotable
 */

const QUOTABLE_API_BASE = 'https://api.quotable.io';

// Health-related tags available in Quotable API
const HEALTH_TAGS = ['health', 'wellness', 'fitness'];

export interface HealthTip {
  id: string;
  content: string;
  author: string;
  tags: string[];
  length: number;
}

export interface HealthTipError {
  message: string;
  code?: string;
}

/**
 * Fetch a random health/wellness quote from Quotable API
 *
 * @returns Promise<HealthTip> - Random health tip object
 * @throws Error if API request fails
 */
export async function fetchHealthTip(): Promise<HealthTip> {
  try {
    // Build URL with health/wellness/fitness tags (OR operation)
    const tagsQuery = HEALTH_TAGS.join('|');
    const url = `${QUOTABLE_API_BASE}/quotes/random?tags=${tagsQuery}`;

    // Silently try to fetch from API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // API returns an array with one quote
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid API response format');
    }

    const quote = data[0];

    // Validate response structure
    if (!quote._id || !quote.content || !quote.author) {
      throw new Error('Invalid quote data structure');
    }

    const healthTip: HealthTip = {
      id: quote._id,
      content: quote.content,
      author: quote.author,
      tags: quote.tags || [],
      length: quote.length || quote.content.length,
    };

    return healthTip;
  } catch (error) {
    // Silently handle API failure and return fallback
    // Return random fallback tip if API fails
    const fallbacks = getFallbackHealthTips();
    const randomIndex = Math.floor(Math.random() * fallbacks.length);
    const fallbackTip = fallbacks[randomIndex];

    if (!fallbackTip) {
      // Fallback to first tip if random selection fails
      const firstTip = fallbacks[0];
      return firstTip || {
        id: 'emergency-fallback',
        content: 'Take care of your health. It is your most valuable asset.',
        author: 'eMediCard',
        tags: ['health', 'wellness'],
        length: 56,
      };
    }

    return fallbackTip;
  }
}

/**
 * Get fallback health tips for offline mode
 *
 * @returns Array of fallback health tips
 */
export function getFallbackHealthTips(): HealthTip[] {
  return [
    {
      id: 'fallback-1',
      content: 'Take care of your body. It\'s the only place you have to live.',
      author: 'Jim Rohn',
      tags: ['health', 'wellness'],
      length: 58,
    },
    {
      id: 'fallback-2',
      content: 'The greatest wealth is health.',
      author: 'Virgil',
      tags: ['health', 'wellness'],
      length: 29,
    },
    {
      id: 'fallback-3',
      content: 'Health is not valued until sickness comes.',
      author: 'Thomas Fuller',
      tags: ['health'],
      length: 46,
    },
    {
      id: 'fallback-4',
      content: 'A healthy outside starts from the inside.',
      author: 'Robert Urich',
      tags: ['health', 'wellness'],
      length: 44,
    },
    {
      id: 'fallback-5',
      content: 'To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.',
      author: 'Buddha',
      tags: ['health', 'wellness'],
      length: 109,
    },
    {
      id: 'fallback-6',
      content: 'A healthy body is a guest-chamber for the soul; a sick body is a prison.',
      author: 'Francis Bacon',
      tags: ['health', 'wellness'],
      length: 73,
    },
    {
      id: 'fallback-7',
      content: 'Good health is not something we can buy. However, it can be an extremely valuable savings account.',
      author: 'Anne Wilson Schaef',
      tags: ['health', 'wellness'],
      length: 100,
    },
    {
      id: 'fallback-8',
      content: 'He who has health, has hope; and he who has hope, has everything.',
      author: 'Thomas Carlyle',
      tags: ['health', 'wellness'],
      length: 67,
    },
    {
      id: 'fallback-9',
      content: 'The groundwork of all happiness is health.',
      author: 'Leigh Hunt',
      tags: ['health', 'wellness'],
      length: 43,
    },
    {
      id: 'fallback-10',
      content: 'Prevention is better than cure.',
      author: 'Desiderius Erasmus',
      tags: ['health', 'wellness'],
      length: 32,
    },
    {
      id: 'fallback-11',
      content: 'Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.',
      author: 'John F. Kennedy',
      tags: ['health', 'fitness'],
      length: 142,
    },
    {
      id: 'fallback-12',
      content: 'Health is a state of complete harmony of the body, mind and spirit.',
      author: 'B.K.S. Iyengar',
      tags: ['health', 'wellness'],
      length: 69,
    },
    {
      id: 'fallback-13',
      content: 'Your body hears everything your mind says. Stay positive.',
      author: 'Naomi Judd',
      tags: ['health', 'wellness'],
      length: 58,
    },
    {
      id: 'fallback-14',
      content: 'To ensure good health: eat lightly, breathe deeply, live moderately, cultivate cheerfulness, and maintain an interest in life.',
      author: 'William Londen',
      tags: ['health', 'wellness'],
      length: 127,
    },
    {
      id: 'fallback-15',
      content: 'Early to bed and early to rise makes a man healthy, wealthy and wise.',
      author: 'Benjamin Franklin',
      tags: ['health', 'wellness'],
      length: 71,
    },
  ];
}
