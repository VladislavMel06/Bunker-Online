import React, { useState, useEffect } from 'react'; 
import { Routes, Route } from 'react-router-dom';
import Header from './components/header';
import FriendTerminal from './components/FriendTerminal'; 
import HomePage from './pages/HomePage'; 
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage';
import LobbyList from './pages/Lobbylist';
import CreateLobby from './pages/CreateLobby';



function App() {
  const [user, setUser] = useState(null); 
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/check_auth.php', { 
      credentials: 'include' 
    })
      .then(res => res.json())
      .then(data => {
        console.log("Результат проверки сессии:", data);
        if (data.authorized) {
          setUser(data.user); 
        }
        setIsAuthChecked(true); 
      })
      .catch(err => {
        console.error("Ошибка запроса:", err);
        setIsAuthChecked(true);
      });
  }, []);

  if (!isAuthChecked) {
    return <div>ИНИЦИАЛИЗАЦИЯ СИСТЕМ БУНКЕРА...</div>;
  }
  
  return (
    <>
      <div>
        <main>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path='/createlobby' element={<CreateLobby/>}/>
          <Route path='/listLobby' element={<LobbyList/>}></Route>
          <Route path="/game/:roomId" element={<GamePage user={user} />} />
        </Routes>
      </main>
      </div>
    </>
  )
}

export default App
