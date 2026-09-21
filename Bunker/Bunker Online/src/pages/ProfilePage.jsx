import React, { useState, useEffect, useCallback  } from 'react';
import styles from "@/styles/Profile.module.scss";

function ProfilePage(){
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['СПИСОК_ДРУЗЕЙ', 'ПОИСК_ИГРОКОВ', 'ЗАПРОСЫ'];
    const [friends, setFriends] = useState([]);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [statusMessage, setStatusMessage] = useState('CONNECTION: STABLE // AUTH: OK');
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    
    const fetchIncoming = useCallback (async()=> {
      try{
        const res = await fetch('/api/getReqApi.php', { credentials: 'include' });
        const data = await res.json();
        setIncomingRequests(Array.isArray(data) ? data : []);
      }catch (err){
        console.error('Ошибка загрузки входящих:', err);
      }
    }, [])

    useEffect(()=>{
      if(activeTab === 2) fetchIncoming();
    },[activeTab, fetchIncoming]);

    const fetchOutgoing = async() => {
      try{
        const res = await fetch('/api/get_pending_friend_requests.php');
        const data = await res.json();
        setOutgoingRequests(Array.isArray(data)?data:[]);
      }catch (err){
        console.error("Ошибка загрузки исходящих:", err);
      }
    }

    useEffect(()=>{
      if(activeTab ===1) fetchOutgoing();
    }, [activeTab]);

    useEffect(()=>{
      if(searchQuery.length < 2){
        setSearchResults([]);
        return;
      }
      const delayDebounceFn = setTimeout(async()=>{
        setIsSearching(true);
        try{
          const res = await fetch(`/api/serchUserApi.php?username=${searchQuery}`, { credentials: 'include' });
          const result = await res.json();
          if(result.success){ setSearchResults(result.data); }
        }catch(err){
          console.error("Ошибка поиска: ", err);
        }finally{
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }, [searchQuery])

    const fetchFriends = useCallback(async () => {
      try {
        const res = await fetch('/api/friendListApi.php', { credentials: 'include' });
        if (!res.ok) throw new Error('Ошибка сети!');
        const result = await res.json();
        
        if (result.success && Array.isArray(result.data)) {
          setFriends(result.data);
        }
      } catch (err) {
        console.error("Ошибка обновления статусов:", err);
      }
    }, []);

    useEffect(()=>{
      fetch("/api/api.php", {credentials:"include"})
      .then(res => {
        if(!res.ok) throw new Error ("Ошибка сервреа");
        return res.json();
      })
      .then (data=>{
        console.log("Получениые данные:", data);
        setUser(data);
      })
      .catch (err => console.error("Ошибка загрузки: ", err))
    },[])

    useEffect(() => {
      fetchFriends();
      const interval = setInterval(() => {
        fetchFriends();
      }, 10000); 

      return () => clearInterval(interval);
    }, [fetchFriends]);

    const handleNext = () => setActiveTab((prev) => (prev + 1) % tabs.length);
    const handlePrev = () => setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length);
    const handleAddFriend = async (friendUsername) =>{
      const formData = new FormData();
      formData.append('friend_username', friendUsername);
      try{
        const res = await fetch("/api/addFriand.php",{
          method: "POST",
          body: formData, 
          credentials: 'include'
        });
        const data = await res.json();
        if(data.status === 'success'){
          setStatusMessage(`SUCCESS: REQUEST SENT TO ${friendUsername} // DATA: SAVED`);
          setSearchResults(prev => prev.filter(u => u.username !== friendUsername));
        }else{
          setStatusMessage(`ERROR: ${data.message.toUpperCase()} // CODE: 403`);
        }
      }catch(err){
        console.error('Ошибка отправки запроса: ', err);
        setStatusMessage('CRITICAL ERROR: CONNECTION LOST // TERMINAL_OFFLINE');
      }finally{
        setTimeout(()=>{
          setStatusMessage('CONNECTION: STABLE // AUTH: OK');
        }, 5000)
      }
    }
    const handleCancelRequest = async (friendId) =>{
      setStatusMessage (`REVOKING REQUEST ID: ${friendId}...`);

      const formData = new FormData();
      formData.append('friend_id', friendId);
      try{
        const res = await fetch('/api/deleteReqApi.php',{
          method: "POST",
          body: formData,
          credentials: 'include'
        });
        const data = await res.json();
        if(data.success){
          setStatusMessage(`SUCCESS: REQUEST REVOKED // ID: ${friendId}`);
          setOutgoingRequests(prev => prev.filter(req => req.id !== friendId));
        }else{
          setStatusMessage('CRITICAL ERROR: UPLINK LOST');
          console.error(err);
        }
      }catch(err){
        setStatusMessage('CRITICAL ERROR: UPLINK LOST');
        console.error(err);
      }finally{
        setTimeout(() => setStatusMessage('CONNECTION: STABLE // AUTH: OK'), 4000);
      }
    }

    const handleAcceptFriend = async (friendId) =>{
      setStatusMessage(`ESTABLISHING CONNECTION: ID ${friendId}...`);
      const formData = new FormData();
      formData.append('friend_id', friendId);
      try{
        const res = await fetch('/api/acceptApi.php',{
          method: "POST",
          body: formData,
          credentials: 'include'
        });
        const data = await res.json();
        if(data.success){
          setStatusMessage(`SUCCESS: CONNECTION SECURED // ID: ${friendId}`);
          setIncomingRequests(prev => prev.filter(req => req.id !== friendId));
          if (typeof fetchFriends === 'function') fetchFriends();
        }
      }catch{
        setStatusMessage('ERROR: HANDSHAKE FAILED');
      }finally{
        setTimeout(() => setStatusMessage('CONNECTION: STABLE // AUTH: OK'), 4000);
      }
    }

    const handleDeclineFriend = async (friendId) => {
      setStatusMessage(`REJECTING SIGNAL: ID ${friendId}...`);
      const formData = new FormData();
      formData.append('friend_id', friendId);
      try {
        const res = await fetch('/api/canselReqApi.php', { 
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        if (res.ok) {
            setStatusMessage(`SIGNAL TERMINATED // ID: ${friendId}`);
            setIncomingRequests(prev => prev.filter(req => req.id !== friendId));
        }
      } catch (err) {
        setStatusMessage('ERROR: ACTION FAILED');
      }finally{
        setTimeout(() => setStatusMessage('CONNECTION: STABLE // AUTH: OK'), 4000);
      }
    };

   const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`ВНИМАНИЕ: ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ${friendName.toUpperCase()} ИЗ СПИСКА КОНТАКТОВ?`)) return;
      setStatusMessage(`TERMINATING CONNECTION WITH: ${friendName}...`);
      const formData = new FormData();
      formData.append('friend_id', friendId);
      try {
        const res = await fetch('/api/removeFriendApi.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            setStatusMessage(`SUCCESS: ${friendName} УДАЛЕН ИЗ БАЗЫ`);
            setFriends(prev => prev.filter(f => f.id !== friendId));
        } else {
            setStatusMessage(`ERROR: ${data.message} // CODE: 505`);
        }
      } catch (err) {
        setStatusMessage('CRITICAL ERROR: UPLINK FAILED');
      } finally {
        setTimeout(() => setStatusMessage('CONNECTION: STABLE // AUTH: OK'), 4000);
      }
    };
    
    if(!user) return <div>Загрузка...</div>
    const survaivalChanse = user.game_coutn > 0 ? Math.round((user.wins/user.game_count)*100) : 0;
    const getStatusClass = () => {
        if (statusMessage.includes('ERROR')) return styles.errorColor;
        if (statusMessage.includes('SUCCESS')) return styles.successColor;
        return '';
    };

    return(
    <div className={styles.Wrap}>
      <div className={styles.dossierFolder}>
        <div className={styles.dossierTab}>ЛИЧНОЕ ДЕЛО</div>
        <div className={styles.dossierContent}>
          <div className={styles.stampClassified}>TOP SECRET</div>
        
            <div className={styles.profileHeader}>
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoLabel}>ФОТО ОТСУТСТВУЕТ</span>
              </div>
              <h2 className={styles.username}>{user.username}</h2>
            </div>

              <div className={styles.statLine}>
                <span className={styles.label}>ПОПАДАНИЙ В БУНКЕР:</span>
                <span className="value">{user.wins}</span>
              </div>
              <div>
                <span className={styles.label}>ВСЕГО ОПЕРАЦИЙ (ИГР):</span>
                <span className="value">{user.game_count}</span>
              </div>
              <div>
                <span className={styles.label}>ШАНС ВЫЖИВАНИЯ:</span>
                <span className={styles.valueHighlight}>{survaivalChanse}%</span>
              </div>
        </div>
      </div>

      <div className={styles.terminalContainer}>
            <div className={styles.terminalHeader}>
              <button className={styles.navBtn} onClick={handlePrev}>{"<"}</button>
              <div className={styles.terminalTitle}>{tabs[activeTab]}</div>
              <button className={styles.navBtn} onClick={handleNext}>{">"}</button>
            </div>
      
            <div className={styles.terminalScreen}>
              <div className={styles.scanline}></div>
              <div className={styles.scanline}></div>
              {activeTab === 0 && (
                <div className={styles.tabContent}>
                    {friends.length > 0 ? (
                        friends.map((friend) => ( 
                            <div key={friend.id} className={styles.userRow}>
                                <span>{friend.username}</span>
                                <span className={Number(friend.online) === 1 ? styles.statusOnline : styles.statusOffline}>
                                  {Number(friend.online) === 1 ? '[В СЕТИ]' : '[OFFLINE]'}
                                </span>
                                <button className={styles.removeFriendBtn} onClick={() => handleRemoveFriend(friend.id, friend.username)} title="Прервать связь">[X]</button>
                            </div>
                        ))
                    ) : (
                      <div className={styles.userRow}>
                        <span style={{ opacity: 0.5 }}>[ДАННЫЕ ОТСУТСТВУЮТ]</span>
                      </div>
                    )}
                </div>
              )}
              {activeTab === 1 && (
                <div className={styles.tabContent}>
                  <p>СИСТЕМА ПОИСКА АКТИВНА...</p>
                  <input 
                    type="text" 
                    className={styles.terminalInput} 
                    placeholder="ВВЕДИТЕ ID ИЛИ ИМЯ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.resultsList}>
                    {isSearching && <p className={styles.blink}>[ИДЕТ ПОИСК...]</p>}
                      {searchResults.length > 0 ? (
                          searchResults.map(u => (
                            <div key={u.id} className={styles.userRow}>
                              <div className={styles.userInfo}>
                                <span>{u.username}</span>
                              </div>
                              <button 
                                className={styles.addBtn}
                                onClick={() => handleAddFriend(u.username)} 
                              >
                                [ДОБАВИТЬ]
                              </button>
                            </div>
                          ))
                      ) : (
                        searchQuery.length >= 2 && !isSearching && <p style={{opacity: 0.5}}>[ОБЪЕКТОВ НЕ ОБНАРУЖЕНО]</p>
                    )}
                  </div>
                  {outgoingRequests.length > 0 && (
                    <div className={styles.outgoingSection}>
                      <div className={styles.divider}>------------------------------------------------------------------------------------------------</div>
                      <p className={styles.statusLabel}>[ОЖИДАНИЕ ПОДТВЕРЖДЕНИЯ]:</p>
                      {outgoingRequests.map(req => (
                        <div key={req.id} className={styles.userRowMini}>
                          <span>{req.username}</span>
                          <span className={styles.blink}>...В ОЖИДАНИИ</span>
                          <button 
                            className={styles.cancelBtn} 
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            [ОТМЕНИТЬ]
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
      
              {activeTab === 2 && (
                <div className={styles.tabContent}>
                    {incomingRequests.length > 0 ? (
                      incomingRequests.map(req => (
                        <div key={req.id} className={styles.userRow}>
                          <div className={styles.userInfo}>
                            <span className={styles.blink}>[!] </span>
                            <span>{req.username}</span>
                          </div>
                          <div className={styles.actionButtons}>
                            <button  className={styles.addBtn } onClick={() => handleAcceptFriend(req.id)}>ПРИНЯТЬ</button>
                            <button className={styles.addBtn} onClick={() => handleDeclineFriend(req.id)}>ОТКЛОНИТЬ</button>
                          </div>
                        </div>
                      ))
                    ) : (
                  <div className={styles.userRow}>
                    <span style={{opacity: 0.5}}>[ВХОДЯЩИЕ СИГНАЛЫ ОТСУТСТВУЮТ]</span>
                  </div>
                )}
                  
                </div>
              )}
            </div>
            <div className={`${styles.terminalStatus} ${getStatusClass()}`}>
                  {statusMessage}
            </div>
          </div>
      </div>
        
   
    )
}
export default ProfilePage