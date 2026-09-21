export const getTopLobbies = (lobbies, limit = 3) => {
  return lobbies
    .filter(l => l.status === 'waiting')
    .sort((a, b) => b.current_players - a.current_players)
    .slice(0, limit);
};