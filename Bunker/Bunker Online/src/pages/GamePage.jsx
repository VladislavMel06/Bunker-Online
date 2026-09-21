import React, { useState, useEffect, useRef  } from 'react'; 
import styles from "@/styles/GameLobby.module.scss";
import { useParams, useLocation } from 'react-router-dom';

const translateKey = (key) => {
    const keys = {
        profession: 'ПРОФЕССИЯ',
        health: 'ЗДОРОВЬЕ',
        hobby: 'ХОББИ',
        age: 'ВОЗРАСТ',
        gender: 'ПОЛ',
        inventory: 'БАГАЖ',
        phobia: 'ФОБИЯ',
        trait: 'ХАРАКТЕР',
        body_type: 'ТЕЛОСЛОЖЕНИЕ' 
    };
    return keys[key] || key.toUpperCase();
};

const handleJoinRoomApi = async (roomId) => {
    try {
        const response = await fetch('/api/join_room.php', { 
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_id: Number(roomId) 
            }),
        });

        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            console.log("Игрок успешно добавлен в комнату:", result.message);
            console.log("Текущее количество игроков:", result.current_players);
            return result;
        } else {
            console.error("Ошибка при входе в комнату:", result.message);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Сетевая ошибка при входе в комнату:", error);
        throw error;
    }
};

// Покидание комнаты
const handleLeaveRoomApi = async (roomId) => {
    try {
        const response = await fetch('/api/leave_room.php', { 
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_id: Number(roomId) 
            }),
        });

        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            console.log("Игрок успешно покинул комнату:", result.message);
            console.log("Текущее количество игроков:", result.current_players);
            return result;
        } else {
            console.error("Ошибка при выходе из комнаты:", result.message);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Сетевая ошибка при выходе из комнаты:", error);
        throw error;
    }
};

const fetchUsernames = async (userIds) => {
    try {
        const response = await fetch('/api/get_user_by_id.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: userIds }),
            credentials: 'include'
        });
        
        if (response.ok) {
            return await response.json();
        }
        return {};
    } catch (error) {
        console.error('Ошибка получения имён:', error);
        return {};
    }
};

function GamePage({ user }){
    const { roomId } = useParams(); 
    const location = useLocation();
    const maxPlayers = location.state?.maxPlayers;
    const [players, setPlayers] = useState([]);
    const [myRole, setMyRole] = useState('participant');  
    const [currentRound, setCurrentRound] = useState('AwaitUser'); 
    const [statusMessage, setStatusMessage] = useState('СИСТЕМА: СВЯЗЬ УСТАНОВЛЕНА // ОЖИДАНИЕ ДАННЫХ');
    const socketRef = useRef(null); 
    const [nominatedList, setNominatedList] = useState([]); 
    const hasJoinedRoom = useRef(false);
    const [gameResult, setGameResult] = useState(null);
    const [leavingPlayers, setLeavingPlayers] = useState([]);
    const [gameState, setGameState] = useState({
        currentPlayerId: null, 
        isMyTurn: false        
    });

    const [myCards, setMyCards] = useState({
        profession: '???',
        health: '???',
        hobby: '???',
        age: '???',
        gender: '???',
        build: '???',
        phobia: '???',
        trait: '???',
        inventory: '???'
    });

    const joinRoomOnce = async (roomId) => {
        if (hasJoinedRoom.current) {
            console.log('Уже присоединились к комнате, пропускаем');
            return;
        }
        
        try {
            const result = await handleJoinRoomApi(roomId);
            if (result.status === 'success') {
                hasJoinedRoom.current = true;
                console.log('Успешно присоединились к комнате');
            }
        } catch (error) {
            console.error('Ошибка при входе в комнату:', error);
        }
    };

    useEffect(() => {
        console.log("Подключаемся как:", user.login, "ID:", user.id);
        const socket = new WebSocket('ws://localhost:2345'); 
        socketRef.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'clientInfo',
                userId: user.id,      
                username: user.login, 
                max_players: 6 

            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Сигнал из Бункера:", data);

            switch (data.type) {
                case 'roleAssignment':
                    setMyRole(data.role);
                    if (roomId) {
                            joinRoomOnce(roomId);
                    }
                break;

                case 'existingUsers':
                    setPlayers(data.users);
                    if (roomId) {
                            joinRoomOnce(roomId);
                    }
                break;

                case 'newUser':

                    setPlayers(prev => {
                    if (prev.find(p => Number(p.userId) === Number(data.userId))) return prev;
                    return [...prev, {
                        userId: data.userId,
                        username: data.username,
                        userData: data.userData,
                        isLeader: data.isLeader || false, 
                        openedChars: {} 
                    }];
                });
                break;

                case 'isRound':
                    setCurrentRound(data.round);
                    if (data.round !== 'VoteRound') setNominatedList([]);
                break;

                case'charsInfo':
                    setPlayers(prev => prev.map(p => {
                    if (Number(p.userId) === Number(data.userId)) {
                        return {
                            ...p,
                            openedChars: {
                                ...(p.openedChars || {}),
                                [data.element]: data.value
                            }
                        };
                    }
                        return p;
                    }));
                    console.log(`Игрок ${data.userId} раскрыл ${data.element}`);
                break;

                case 'newTurn':
                    setGameState(prev => ({
                        ...prev,
                        currentPlayerId: data.currentPlayerId,
                        isMyTurn: Number(data.currentPlayerId) === Number(user.id)
                    }));
                setStatusMessage(Number(data.currentPlayerId) === Number(user.id) ? "ВАШ ХОД" : `ХОД ИГРОКА ${data.currentPlayerId}`);
                break;

                case 'PlacinUserList':
                    const list = data.nominatedPlayers || [];
                    console.log("СПИСОК КАНДИДАТОВ НА ВЫЛЕТ:", list);
                    setNominatedList(list); 
                break;

                case 'error':
                    setStatusMessage(data.message);
                break;

                case 'GameResult':
                    console.log("Игра завершена!", data);

                    (async () => {
                        const allIds = data.remainingPlayers.map(Number);
                        const usernames = await fetchUsernames(allIds);
        
                        console.log("Полученные имена:", usernames);
        
                        setGameResult({
                            survivors: data.remainingPlayers.map(id => ({
                            userId: id,
                            username: usernames[id] || `Игрок ${id}`,
                            userData: players.find(p => Number(p.userId) === Number(id))?.userData || {}
                        })),
                        allPlayers: players.map(p => ({
                        ...p,
                        isSurvivor: data.remainingPlayers.includes(Number(p.userId))
                        })),
                        message: data.message
                    });
                    })();
    
                    setCurrentRound('EndGame');
                    setStatusMessage("ИГРА ЗАВЕРШЕНА");
                break;

                case 'playerEliminated':
                    console.log("Игрока кикнули", data);
    
                    const eliminatedPlayer = players.find(p => Number(p.userId) === Number(data.playerId));
                    const eliminatedUsername = eliminatedPlayer ? eliminatedPlayer.username : `Игрок ${data.playerId}`;
    
                    if (Number(data.playerId) === Number(user.id)) {
                        if (roomId) {
                            handleLeaveRoomApi(roomId);
                        }
                        setStatusMessage("ВЫ ИСКЛЮЧЕНЫ ИЗ БУНКЕРА");
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 3000);
                    }
    
  
                    setPlayers(prev => prev.map(p => {
                    if (Number(p.userId) === Number(data.playerId)) {
                        return { ...p, isEliminated: true };
                    }
                    return p;
                    }));
    
                    setStatusMessage(`ИГРОК ${eliminatedUsername} ИСКЛЮЧЕН ИЗ БУНКЕРА`);
                break;

                case 'userLeft':
                    console.log("Игрок вышел", data);
    
                    setPlayers(prev => {
                        const newPlayers = prev.filter(p => Number(p.userId) !== Number(data.playerId || data.userId));
        
                        if (newPlayers.length <= 2 && currentRound !== 'AwaitUser') {
                            setCurrentRound('EndGame');
                            setGameResult({
                                survivors: newPlayers.map(p => ({
                                userId: p.userId,
                                username: p.username,
                                userData: p.userData
                            })),
                            allPlayers: newPlayers.map(p => ({
                            ...p,
                            isSurvivor: true
                        })),
                        message: `Игра завершена досрочно! В бункер попадают: ${newPlayers.map(p => p.username).join(' и ')}`
                    });
                    setStatusMessage("ИГРА ЗАВЕРШЕНА (НЕДОСТАТОЧНО ИГРОКОВ)");
                    }
        
                        return newPlayers;
                    });
    
                    setStatusMessage(`ИГРОК ${data.username || 'Неизвестный'} ПОКИНУЛ БУНКЕР`);
                break;
            }

            
        };
        return () => socket.close();
    }, [user]);

  const handleRevealChar = (key, value) => {
    if (!gameState.isMyTurn) {
        setStatusMessage("ОШИБКА: СЕЙЧАС НЕ ВАШ ХОД");
        return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
            type: 'charsInfo',
            element: key,
            value: value,
            userId: user.id
        }));
        setPlayers(prev => prev.map(p => {
            if (Number(p.userId) === Number(user.id)) {
                return {
                    ...p,
                    openedChars: {
                        ...(p.openedChars || {}),
                        [key]: value
                    }
                };
            }
            return p;
        }));

        setStatusMessage(`ДАННЫЕ ПЕРЕДАНЫ: [${translateKey(key)}]`);
    }
    };

    const handleNominatePlayer = (targetUserId, targetUsername) => {и
        if (!gameState.isMyTurn || currentRound !== 'PlacinRound') return;
        if (Number(targetUserId) === Number(user.id)) {
            setStatusMessage("ОШИБКА: НЕЛЬЗЯ ВЫДВИНУТЬ САМОГО СЕБЯ");
            return;
        }
        if (!window.confirm(`ВЫДВИНУТЬ [${targetUsername}] НА ГОЛОСОВАНИЕ?`)) return;
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'PlacinData',
                userId: targetUserId 
            }));
            setStatusMessage(`ЦЕЛЬ УСТАНОВЛЕНА: ${targetUsername.toUpperCase()}`);
        }
    };

    const handleVote = (targetUserId, targetUsername) => {
        if (!gameState.isMyTurn || currentRound !== 'VoteRound') return;
        if (Number(targetUserId) === Number(user.id)) {
            setStatusMessage("ОШИБКА: НЕЛЬЗЯ ГОЛОСОВАТЬ ЗА СЕБЯ");
            return;
        }

        if (!window.confirm(`ВЫГНАТЬ [${targetUsername}] ИЗ БУНКЕРА?`)) return;

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'VoteData',
                userId: targetUserId 
            }));
            setStatusMessage(`ГОЛОС ОТДАН: ${targetUsername.toUpperCase()}`);
        }
    };


    return (
    <div className={styles.gameWrapper}>
        <header className={styles.gameHeader}>
            <h1>
                РАУНД: {
                    currentRound === 'AwaitUser' ? 'ОЖИДАНИЕ' :
                    currentRound === 'CharInfoRound' ? 'РАСКРЫТИЕ ХАРАКТИРИСТИК' :
                    currentRound === 'PlacinRound' ? 'ВЫДВИЖЕНИЕ КАНДИДАТОВ' :
                    currentRound === 'VoteRound' ? 'ГОЛОСОВАНИЕ' :
                    currentRound === 'EndGame' ? 'КОНЕЦ ИГРЫ' : currentRound
                }
            </h1>

            {currentRound !== 'AwaitUser' && (
                <>
                    <div className={styles.turnIndicator}>
                        {gameState.isMyTurn ? (
                            <span className={styles.blink}>[ ВАШ ХОД! ]</span>
                        ) : (
                            <span>
                                ХОД ИГРОКА: {players.find(p => Number(p.userId) === Number(gameState.currentPlayerId))?.username || 'СИНХРОНИЗАЦИЯ...'}
                            </span>
                        )}
                    </div>
                    {gameState.isMyTurn && (
                        <button 
                            className={styles.skipBtn}
                            onClick={() => {
                                if (socketRef.current) {
                                    socketRef.current.send(JSON.stringify({ 
                                        type: 'skipTurn', 
                                        userId: user.id 
                                    }));
                                }
                            }}
                        >
                            ПРОПУСТИТЬ ХОД
                        </button>
                    )}
                </>
            )}
        </header>

        <main className={styles.mainLayout}>
            <div className={styles.cardsGrid}>
                {players.map((player) => {
                    const isMe = Number(player.userId) === Number(user.id);
                    const isNominated = nominatedList.includes(Number(player.userId));
                    const isEliminated = player.isEliminated; 
                    const canNominate = currentRound === 'PlacinRound' && gameState.isMyTurn && !isMe && !isEliminated;;
                    const canVote = currentRound === 'VoteRound' && gameState.isMyTurn && isNominated && !isMe && !isEliminated;;

                    return (
                        <div 
                            key={player.userId} 
                            className={`
                                ${styles.playerCard} 
                                ${isMe ? styles.myCard : ''} 
                                ${canNominate ? styles.canNominate : ''}
                                ${canVote ? styles.canVote : ''}
                                ${isNominated && currentRound === 'VoteRound' ? styles.targetCard : ''}
                            `}
                            onClick={() => {
                                if (isEliminated) return;
                                if (canNominate) handleNominatePlayer(player.userId, player.username);
                                if (canVote) handleVote(player.userId, player.username);
                            }}
                        >
                            <h3 className={styles.nickname}>
                                {player.username} {isMe ? " (ВЫ)" : ""}
                                {isEliminated && " [ИСКЛЮЧЕН]"}
                            </h3>

                            {player.isLeader && <div className={styles.leaderTag}>[КОМАНДИР]</div>}
                            {isNominated && currentRound === 'VoteRound' && <div className={styles.warningTag}>[ЦЕЛЬ]</div>}
                            {isEliminated && <div className={styles.eliminatedTag}>[ИСКЛЮЧЕН]</div>} 
                            <div className={styles.characterData}>
                                {['profession', 'health', 'hobby', 'age', 'inventory', 'trait', 'body_type', 'gender'].map((key) => {
                                    const isOpened = player.openedChars && player.openedChars[key];
                                    const canRevealNow = isMe && !isOpened && gameState.isMyTurn && currentRound === 'CharInfoRound'&& !isEliminated;;

                                    return (
                                        <p 
                                            key={key} 
                                            onClick={(e) => {
                                                if (canRevealNow) {
                                                    e.stopPropagation(); 
                                                    handleRevealChar(key, player.userData[key]);
                                                }
                                            }}
                                            className={`
                                                ${styles.charLine} 
                                                ${canRevealNow ? styles.clickableChar : ''} 
                                                ${isOpened ? styles.openedChar : ''}
                                            `}
                                        >
                                            <span className={styles.label}>{translateKey(key)}:</span>
                                            <span className={styles.value}>
                                                {(isMe || isOpened) ? (player.userData[key] || "НЕ УКАЗАНО") : "????"}
                                            </span>
                                            {isOpened && <span className={styles.openedMark}> [V]</span>}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
        <footer className={styles.gameFooter}>
            <div className={`${styles.terminalStatus} ${statusMessage.includes('ERROR') ? styles.errorColor : ''}`}>
                {statusMessage}
            </div>
        </footer>
        {gameResult && (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>ИГРА ОКОНЧЕНА</h2>
            
            <div className={styles.resultSection}>
                <h3>В БУНКЕР ПОПАДАЮТ:</h3>
                <div className={styles.survivorsList}>
                    {gameResult.survivors.map((survivor, index) => (
                        <div key={index} className={styles.survivorName}>
                            🏆 {survivor.username}
                        </div>
                    ))}
                </div>
            </div>

            <button 
                className={styles.exitButton}
                onClick={() => {
                    if (roomId) handleLeaveRoomApi(roomId);
                    window.location.href = '/';
                }}
            >
                ПОКИНУТЬ БУНКЕР
            </button>
        </div>
    </div>
)}
    </div>
);

}
export default GamePage