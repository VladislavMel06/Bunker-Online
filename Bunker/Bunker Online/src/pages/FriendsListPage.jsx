import { useState, useEffect } from 'react';
export function FriendsListPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    fetch('/api/testApi.php') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети или сервера');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setFriends(data.data);
        } else {
          throw new Error('Данные от API пришли в неверном формате');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []); 

  if (loading) return <div>Загрузка списка друзей...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="friends-list-container">
      <h1>Список друзей ({friends.length})</h1>
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend) => (
            <li key={friend.user_id}> 
              Пользователь {friend.user_id} в друзьях у {friend.friend_id}. Статус: **{friend.status}**
            </li>
          ))}
        </ul>
      ) : (
        <p>У вас пока нет друзей.</p>
      )}
    </div>
  );
}
export default FriendsListPage
