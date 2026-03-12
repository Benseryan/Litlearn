export const GENRES = [
  { id: 'all',        label: 'All',        emoji: '📚', bg: '#EAE7DA', nodeColor: '#5A5C41', glowColor: 'rgba(90,92,65,0.3)',    progressColor: '#5A5C41' },
  { id: 'classics',   label: 'Classics',   emoji: '🏛️', bg: '#FEF9EE', nodeColor: '#B45309', glowColor: 'rgba(180,83,9,0.35)',   progressColor: '#B45309' },
  { id: 'fantasy',    label: 'Fantasy',    emoji: '🔮', bg: '#F5F0FF', nodeColor: '#7C3AED', glowColor: 'rgba(124,58,237,0.4)',  progressColor: '#7C3AED' },
  { id: 'sci-fi',     label: 'Sci-Fi',     emoji: '🚀', bg: '#EEF9FF', nodeColor: '#0284C7', glowColor: 'rgba(2,132,199,0.4)',   progressColor: '#0284C7' },
  { id: 'philosophy', label: 'Philosophy', emoji: '💭', bg: '#F0F0FF', nodeColor: '#4338CA', glowColor: 'rgba(67,56,202,0.4)',   progressColor: '#4338CA' },
  { id: 'nonfiction', label: 'Nonfiction', emoji: '🌿', bg: '#F0FFF4', nodeColor: '#166534', glowColor: 'rgba(22,101,52,0.35)',  progressColor: '#166534' },
  { id: 'mystery',    label: 'Mystery',    emoji: '🔍', bg: '#FFF5F5', nodeColor: '#991B1B', glowColor: 'rgba(153,27,27,0.35)', progressColor: '#991B1B' },
];

export const getGenre = (id) => GENRES.find((g) => g.id === id) || GENRES[0];
