import { useState, useEffect } from 'react';

export function useLobbies(interval = 5000) {
  const [lobbies, setLobbies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLobbies = async () => {
    try {

    const response = await fetch('/api/api_rooms.php');
    if (!response.ok) throw new Error('Ошибка сети');
    
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      setLobbies(result.data);
    } else if (Array.isArray(result)) {
      setLobbies(result);
    } else {
      setLobbies([]);
    }
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
};

  fetchLobbies();
    const id = setInterval(fetchLobbies, interval);
    return () => clearInterval(id);
  }, [interval]);

  return { lobbies, isLoading, error };
}