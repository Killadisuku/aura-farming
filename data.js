export const CATEGORIES = [
  { id: 'kindness', label: 'Kindness', icon: '❤️', color: '#fb7185' },
  { id: 'helpfulness', label: 'Helpfulness', icon: '🤝', color: '#38bdf8' },
  { id: 'coolness', label: 'Coolness', icon: '😎', color: '#818cf8' },
  { id: 'charisma', label: 'Charisma', icon: '✨', color: '#e879f9' },
  { id: 'confidence', label: 'Confidence', icon: '🗣️', color: '#fbbf24' },
  { id: 'humor', label: 'Humor', icon: '😂', color: '#34d399' },
  { id: 'intelligence', label: 'Intelligence', icon: '🧠', color: '#60a5fa' },
  { id: 'courage', label: 'Courage', icon: '💪', color: '#f97316' },
  { id: 'leadership', label: 'Leadership', icon: '👑', color: '#facc15' },
  { id: 'style', label: 'Style', icon: '🔥', color: '#f43f5e' },
]

export const LEVELS = [
  { min: 0, name: 'Rookie', glow: '#64748b' },
  { min: 100, name: 'Chill', glow: '#38bdf8' },
  { min: 500, name: 'Vibing', glow: '#34d399' },
  { min: 1000, name: 'Cool', glow: '#818cf8' },
  { min: 2500, name: 'Charismatic', glow: '#e879f9' },
  { min: 5000, name: 'Influencer', glow: '#fb7185' },
  { min: 10000, name: 'Legend', glow: '#fbbf24' },
  { min: 25000, name: 'Icon', glow: '#f97316' },
  { min: 50000, name: 'Aura God', glow: '#fff' },
]

export const BADGE_DEFS = [
  { id: 'good_human', name: 'Good Human', icon: '❤️', desc: 'Helped 10 people.', check: (u, txs) => txs.filter(t => t.toId === u.id && (t.category === 'kindness' || t.category === 'helpfulness')).length >= 10 },
  { id: 'comedian', name: 'Comedian', icon: '😂', desc: 'Received 500 Humor Aura.', check: (u) => (u.breakdown.humor || 0) >= 500 },
  { id: 'too_cool', name: 'Too Cool', icon: '😎', desc: 'Received 1,000 Coolness Aura.', check: (u) => (u.breakdown.coolness || 0) >= 1000 },
  { id: 'natural_leader', name: 'Natural Leader', icon: '👑', desc: 'Received 1,000 Leadership Aura.', check: (u) => (u.breakdown.leadership || 0) >= 1000 },
  { id: 'charisma_machine', name: 'Charisma Machine', icon: '✨', desc: 'Received 2,500 Charisma Aura.', check: (u) => (u.breakdown.charisma || 0) >= 2500 },
  { id: 'aura_legend', name: 'Aura Legend', icon: '🔥', desc: 'Reached 10,000 total Aura.', check: (u) => u.auraReceived >= 10000 },
  { id: 'generous', name: 'Generous Soul', icon: '🌟', desc: 'Gave 2,500 Aura to others.', check: (u) => u.auraGiven >= 2500 },
  { id: 'streak7', name: 'Week Warrior', icon: '⚡', desc: 'Kept a 7-day Aura streak.', check: (u) => u.streak >= 7 },
  { id: 'streak30', name: 'Unstoppable', icon: '🏆', desc: 'Kept a 30-day Aura streak.', check: (u) => u.streak >= 30 },
  { id: 'first_gift', name: 'First Spark', icon: '🕯️', desc: 'Gave your first Aura.', check: (u) => u.auraGiven > 0 },
]

export const CHALLENGES = [
  'Make someone laugh today.',
  'Help someone without being asked.',
  'Give someone a genuine compliment.',
  'Do something outside your comfort zone.',
  'Introduce two people who should meet.',
  'Leave a place better than you found it.',
  'Text someone who might need a lift.',
  'Share credit for a win you could have kept.',
  'Stand up for someone who needs it.',
  'Show up on time and fully present.',
]

export const INTERESTS = [
  'Music', 'Design', 'Startups', 'Fitness', 'Fashion', 'Comedy',
  'Film', 'Travel', 'Food', 'Tech', 'Art', 'Sports', 'Wellness', 'Gaming',
]

export function getLevel(aura) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (aura >= LEVELS[i].min) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || null
    }
  }
  const floor = current.min
  const ceil = next ? next.min : current.min
  const progress = next ? Math.min(1, (aura - floor) / (ceil - floor)) : 1
  return { current, next, progress }
}

export function categoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
}

export function formatNum(n) {
  return Number(n || 0).toLocaleString()
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return `${Math.floor(d / 7)}w`
}

function hoursAgo(h) {
  return Date.now() - h * 3600000
}

const AV = (seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e1b4b,312e81,4c1d95,0f172a`

export const SEED_USERS = [
  {
    id: 'u_ahmed',
    name: 'Ahmed',
    username: 'ahmed',
    bio: 'Building things. Giving energy back.',
    avatar: AV('AhmedK'),
    interests: ['Startups', 'Design', 'Music'],
    auraReceived: 8420,
    auraGiven: 4420,
    breakdown: { coolness: 92, charisma: 94, confidence: 88, kindness: 85, humor: 81, intelligence: 76, helpfulness: 70, courage: 64, leadership: 58, style: 72 },
    streak: 7,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Dubai',
    createdAt: hoursAgo(24 * 90),
  },
  {
    id: 'u_sarah',
    name: 'Sarah Chen',
    username: 'sarah',
    bio: 'Product designer. Soft power.',
    avatar: AV('SarahC'),
    interests: ['Design', 'Art', 'Fashion'],
    auraReceived: 48220,
    auraGiven: 9100,
    breakdown: { charisma: 4200, kindness: 8100, style: 6400, coolness: 5200, confidence: 4800, humor: 3100, intelligence: 5400, helpfulness: 4900, courage: 2200, leadership: 3920 },
    streak: 21,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'London',
    createdAt: hoursAgo(24 * 200),
  },
  {
    id: 'u_alex',
    name: 'Alex Rivera',
    username: 'alex',
    bio: 'Founder energy. Always building.',
    avatar: AV('AlexR'),
    interests: ['Startups', 'Tech', 'Fitness'],
    auraReceived: 52840,
    auraGiven: 12040,
    breakdown: { leadership: 9800, charisma: 8600, confidence: 7400, intelligence: 6100, coolness: 5400, style: 3200, kindness: 4100, humor: 2800, helpfulness: 3640, courage: 1800 },
    streak: 14,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'NYC',
    createdAt: hoursAgo(24 * 300),
  },
  {
    id: 'u_mike',
    name: 'Mike Okonkwo',
    username: 'mike',
    bio: 'Stand-up and late nights.',
    avatar: AV('MikeO'),
    interests: ['Comedy', 'Music', 'Film'],
    auraReceived: 12400,
    auraGiven: 3800,
    breakdown: { humor: 5200, courage: 1800, charisma: 1600, kindness: 900, coolness: 1100, confidence: 800, intelligence: 400, helpfulness: 300, leadership: 200, style: 100 },
    streak: 3,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Lagos',
    createdAt: hoursAgo(24 * 60),
  },
  {
    id: 'u_emma',
    name: 'Emma Laurent',
    username: 'emma',
    bio: 'Kind by default.',
    avatar: AV('EmmaL'),
    interests: ['Wellness', 'Food', 'Travel'],
    auraReceived: 18600,
    auraGiven: 15400,
    breakdown: { kindness: 7400, helpfulness: 5200, charisma: 1600, humor: 1100, intelligence: 900, coolness: 700, confidence: 600, courage: 400, leadership: 400, style: 300 },
    streak: 30,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Paris',
    createdAt: hoursAgo(24 * 180),
  },
  {
    id: 'u_lisa',
    name: 'Lisa Park',
    username: 'lisa',
    bio: 'Engineer who ships.',
    avatar: AV('LisaP'),
    interests: ['Tech', 'Gaming', 'Music'],
    auraReceived: 9100,
    auraGiven: 2200,
    breakdown: { intelligence: 3100, helpfulness: 1800, kindness: 1400, coolness: 900, charisma: 700, humor: 500, confidence: 400, courage: 150, leadership: 100, style: 50 },
    streak: 2,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Seoul',
    createdAt: hoursAgo(24 * 40),
  },
  {
    id: 'u_john',
    name: 'John Blake',
    username: 'john',
    bio: 'Loyal to a fault.',
    avatar: AV('JohnB'),
    interests: ['Sports', 'Fitness', 'Film'],
    auraReceived: 15400,
    auraGiven: 2700,
    breakdown: { courage: 5200, loyalty: 0, kindness: 2400, leadership: 2100, confidence: 1800, helpfulness: 1600, coolness: 900, charisma: 800, humor: 400, intelligence: 200, style: 0 },
    streak: 5,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Chicago',
    createdAt: hoursAgo(24 * 110),
  },
  {
    id: 'u_nina',
    name: 'Nina Alvarez',
    username: 'nina',
    bio: 'Stylist. Night owl. Soft launch.',
    avatar: AV('NinaA'),
    interests: ['Fashion', 'Art', 'Music'],
    auraReceived: 22100,
    auraGiven: 5400,
    breakdown: { style: 8100, coolness: 5400, charisma: 3600, confidence: 1800, kindness: 1200, humor: 800, intelligence: 500, helpfulness: 400, courage: 200, leadership: 100 },
    streak: 9,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Mexico City',
    createdAt: hoursAgo(24 * 70),
  },
  {
    id: 'u_kai',
    name: 'Kai Nakamura',
    username: 'kai',
    bio: 'Quiet rooms, loud ideas.',
    avatar: AV('KaiN'),
    interests: ['Tech', 'Design', 'Film'],
    auraReceived: 17800,
    auraGiven: 6100,
    breakdown: { intelligence: 6200, charisma: 2400, coolness: 2200, helpfulness: 1800, kindness: 1600, confidence: 1400, humor: 800, leadership: 700, style: 500, courage: 200 },
    streak: 11,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Tokyo',
    createdAt: hoursAgo(24 * 95),
  },
  {
    id: 'u_zara',
    name: 'Zara Malik',
    username: 'zara',
    bio: 'Makes rooms better.',
    avatar: AV('ZaraM'),
    interests: ['Music', 'Comedy', 'Travel'],
    auraReceived: 13400,
    auraGiven: 4800,
    breakdown: { charisma: 4100, humor: 2800, kindness: 1900, confidence: 1600, coolness: 1100, style: 800, helpfulness: 500, intelligence: 300, leadership: 200, courage: 100 },
    streak: 4,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Karachi',
    createdAt: hoursAgo(24 * 50),
  },
  {
    id: 'u_leo',
    name: 'Leo Santos',
    username: 'leo',
    bio: 'Captain energy off the pitch too.',
    avatar: AV('LeoS'),
    interests: ['Sports', 'Fitness', 'Leadership'],
    auraReceived: 24600,
    auraGiven: 3300,
    breakdown: { leadership: 7200, courage: 5100, confidence: 4200, kindness: 2100, helpfulness: 1800, charisma: 1600, coolness: 1100, humor: 800, intelligence: 500, style: 200 },
    streak: 6,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'São Paulo',
    createdAt: hoursAgo(24 * 140),
  },
  {
    id: 'u_priya',
    name: 'Priya Shah',
    username: 'priya',
    bio: 'Asks the question everyone skipped.',
    avatar: AV('PriyaS'),
    interests: ['Startups', 'Wellness', 'Art'],
    auraReceived: 16200,
    auraGiven: 7200,
    breakdown: { intelligence: 4800, kindness: 3100, helpfulness: 2400, leadership: 1800, charisma: 1400, confidence: 1100, humor: 700, coolness: 500, courage: 300, style: 200 },
    streak: 16,
    lastActiveDay: new Date().toISOString().slice(0, 10),
    privacy: { hideActivity: false, privateProfile: false, locationOn: false },
    location: 'Mumbai',
    createdAt: hoursAgo(24 * 85),
  },
]

export const SEED_FOLLOWS = {
  u_ahmed: ['u_sarah', 'u_alex', 'u_mike', 'u_emma', 'u_lisa', 'u_john', 'u_nina', 'u_kai'],
  u_sarah: ['u_ahmed', 'u_alex', 'u_emma', 'u_nina', 'u_priya'],
  u_alex: ['u_ahmed', 'u_sarah', 'u_leo', 'u_kai'],
  u_mike: ['u_ahmed', 'u_john', 'u_zara'],
  u_emma: ['u_sarah', 'u_lisa', 'u_ahmed', 'u_priya'],
  u_lisa: ['u_emma', 'u_kai', 'u_ahmed'],
  u_john: ['u_mike', 'u_leo', 'u_ahmed'],
  u_nina: ['u_sarah', 'u_zara', 'u_ahmed'],
  u_kai: ['u_lisa', 'u_alex', 'u_ahmed'],
  u_zara: ['u_nina', 'u_mike', 'u_emma'],
  u_leo: ['u_alex', 'u_john', 'u_priya'],
  u_priya: ['u_emma', 'u_sarah', 'u_leo'],
}

export const SEED_TX = [
  { id: 't1', fromId: 'u_sarah', toId: 'u_ahmed', amount: 25, category: 'charisma', message: 'Killed that presentation.', ts: hoursAgo(0.4), likes: ['u_emma', 'u_mike'] },
  { id: 't2', fromId: 'u_mike', toId: 'u_john', amount: 50, category: 'courage', message: 'He stood up for his friend.', ts: hoursAgo(1.2), likes: ['u_ahmed', 'u_leo'] },
  { id: 't3', fromId: 'u_emma', toId: 'u_lisa', amount: 10, category: 'kindness', message: 'Helped me when I was stuck.', ts: hoursAgo(2.1), likes: ['u_sarah'] },
  { id: 't4', fromId: 'u_alex', toId: 'u_sarah', amount: 100, category: 'leadership', message: 'Ran the room without raising her voice.', ts: hoursAgo(3), likes: ['u_ahmed', 'u_priya', 'u_nina'] },
  { id: 't5', fromId: 'u_nina', toId: 'u_zara', amount: 25, category: 'style', message: 'That look should be illegal.', ts: hoursAgo(4.5), likes: ['u_sarah'] },
  { id: 't6', fromId: 'u_kai', toId: 'u_priya', amount: 50, category: 'intelligence', message: 'She found the bug nobody else saw.', ts: hoursAgo(5), likes: ['u_lisa', 'u_ahmed'] },
  { id: 't7', fromId: 'u_leo', toId: 'u_alex', amount: 25, category: 'confidence', message: 'Closed the deal like it was nothing.', ts: hoursAgo(6), likes: [] },
  { id: 't8', fromId: 'u_zara', toId: 'u_mike', amount: 40, category: 'humor', message: 'The whole table lost it.', ts: hoursAgo(7.2), likes: ['u_john', 'u_ahmed'] },
  { id: 't9', fromId: 'u_ahmed', toId: 'u_emma', amount: 25, category: 'kindness', message: 'You always notice the quiet person.', ts: hoursAgo(8), likes: ['u_sarah', 'u_lisa'] },
  { id: 't10', fromId: 'u_priya', toId: 'u_kai', amount: 15, category: 'helpfulness', message: 'Stayed late to walk me through it.', ts: hoursAgo(9), likes: [] },
  { id: 't11', fromId: 'u_john', toId: 'u_leo', amount: 50, category: 'leadership', message: 'Captain off the pitch too.', ts: hoursAgo(11), likes: ['u_alex'] },
  { id: 't12', fromId: 'u_lisa', toId: 'u_ahmed', amount: 10, category: 'coolness', message: 'Walked in like the soundtrack started.', ts: hoursAgo(13), likes: ['u_nina'] },
  { id: 't13', fromId: 'u_sarah', toId: 'u_nina', amount: 25, category: 'charisma', message: 'Everyone wanted to talk to her.', ts: hoursAgo(16), likes: [] },
  { id: 't14', fromId: 'u_emma', toId: 'u_ahmed', amount: 15, category: 'helpfulness', message: 'Sent the intro without being asked.', ts: hoursAgo(20), likes: ['u_alex'] },
  { id: 't15', fromId: 'u_mike', toId: 'u_zara', amount: 20, category: 'humor', message: 'Best roast of the night. Consensual.', ts: hoursAgo(22), likes: ['u_nina'] },
  { id: 't16', fromId: 'u_alex', toId: 'u_ahmed', amount: 50, category: 'confidence', message: 'Held the Q&A like a veteran.', ts: hoursAgo(26), likes: ['u_sarah'] },
  { id: 't17', fromId: 'u_nina', toId: 'u_sarah', amount: 30, category: 'style', message: 'The coat. That’s it. The coat.', ts: hoursAgo(28), likes: [] },
  { id: 't18', fromId: 'u_kai', toId: 'u_lisa', amount: 25, category: 'intelligence', message: 'Elegant solution. No extra lines.', ts: hoursAgo(30), likes: ['u_priya'] },
]

export const SEED_NOTIFS = [
  { id: 'n1', userId: 'u_ahmed', type: 'received', text: 'You received +25 Aura!', sub: 'Sarah gave you Charisma Aura.', fromId: 'u_sarah', amount: 25, read: false, ts: hoursAgo(0.4) },
  { id: 'n2', userId: 'u_ahmed', type: 'received', text: 'Lisa gave you Coolness Aura.', sub: '+10 · “Walked in like the soundtrack started.”', fromId: 'u_lisa', amount: 10, read: false, ts: hoursAgo(13) },
  { id: 'n3', userId: 'u_ahmed', type: 'level', text: 'You reached Aura Level: Influencer.', sub: 'Keep spreading good energy.', read: true, ts: hoursAgo(48) },
  { id: 'n4', userId: 'u_ahmed', type: 'rank', text: "You're now in the Top 15%.", sub: 'Weekly global climb.', read: true, ts: hoursAgo(30) },
  { id: 'n5', userId: 'u_ahmed', type: 'thanks', text: 'Emma thanked you for helping her.', sub: 'Kindness travels.', fromId: 'u_emma', read: true, ts: hoursAgo(8) },
]

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function challengeForToday() {
  const day = Math.floor(Date.now() / 86400000)
  return CHALLENGES[day % CHALLENGES.length]
}
