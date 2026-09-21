import styles from "@/styles/LobbyTable.module.scss";
import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import lockImg from "@/img/lock-closed.png"; 
import { PasswordModal } from "./PasswordModal";

export const LobbyTable = ({ lobbies, title }) => {
  const navigate = useNavigate();
  const [selectedLobby, setSelectedLobby] = useState(null);
  const handleJoinGame = (lobby) => {
    if (lobby.current_players >= lobby.max_players) return;

      if (lobby.hasPassword) {
        setSelectedLobby(lobby); 
      } else {
        enterRoom(lobby.id, lobby.max_players);
    }
  };
  const enterRoom = (id, maxPlayers) => {
    navigate(`/game/${id}`, { state: { maxPlayers } });
  };

  return (
    <div className={styles.LobbyMainWrap}>
      <div className={styles.LobbyListWrap}>
        <h1>{title}</h1>
        <canvas className={styles.Line}></canvas>
        <div className={styles.RoomList}>
          {lobbies.length > 0 ? (
            <div className={styles.topList}>
              <div className={styles.headList}>
                <div>Название</div>
                <div>Игроки</div>
                <div>Сложность</div>
                <div></div>
              </div>
              {lobbies.map((lobby) => {
                const isFull = lobby.current_players >= lobby.max_players;
                return (
                  <div key={lobby.id} className={styles.list}>
                    <h2>{lobby.name}{lobby.hasPassword && (
                      <img 
                        src={lockImg} 
                        alt="Locked" 
                        style={{ width: '32px', height: '32px', objectFit: 'contain', marginLeft: '4px', top: '4px' }}
                        title="Комната под паролем"
                      />
                    )}</h2>
                    <p style={{ color: isFull ? "#ff4d4d" : "inherit" }}>
                      {lobby.current_players} / {lobby.max_players}
                    </p>
                    
                    <p>{lobby.difficulty}</p>

                    <PasswordModal 
                      isOpen={!!selectedLobby} 
                      onClose={() => setSelectedLobby(null)}
                      lobbyId={selectedLobby?.id}
                      onSuccess={() => enterRoom(selectedLobby.id, selectedLobby.max_players)}
                    />

                    <button className={`${styles.PlayButton} ${isFull ? styles.DisabledButton : ""}`} onClick={() => handleJoinGame(lobby)} disabled={isFull}> {isFull ? "Мест нет" : "Играть"}</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Нет подходящих лобби.</p>
          )}
        </div>
      </div>
    </div>
  );
};