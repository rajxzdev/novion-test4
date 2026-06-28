export const EXCLUDED_TITLE_KEYWORDS = [
  'gameplay', 'gaming', 'walkthrough', 'playthrough',
  'live stream', 'livestream', '#live', '🔴',
  'fortnite', 'minecraft', 'gta', 'cod', 'valorant',
  'roblox', 'apex', 'pubg', 'overwatch', 'league of legends',
  'asmr', 'mukbang', 'unboxing', 'haul',
  'tutorial', 'how to', 'diy',
  'review', 'reaction', 'reacting to',
  'movie trailer', 'official trailer', 'film',
  'podcast', 'interview', 'talk show',
  'news', 'breaking',
  'cooking', 'recipe', 'food',
  'workout', 'exercise', 'yoga',
  'full album', 'full movie',
  'compilation', '1 hour', '2 hours', '3 hours',
];

export const EXCLUDED_CHANNEL_KEYWORDS = [
  'gaming', 'games', 'gamer', 'plays', 'esports',
  'news', 'tv', 'television', 'network',
  'cooking', 'kitchen', 'food',
];

export const containsExcludedKeyword = (value: string, keywords: string[]) => {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
};
