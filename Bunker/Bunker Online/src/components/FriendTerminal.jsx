import React, { useState } from 'react';
import styles from "@/styles/FriendTerminal.module.scss";

const FriendTerminal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['СПИСОК_ДРУЗЕЙ', 'ПОИСК_ИГРОКОВ', 'ЗАПРОСЫ'];

  const handleNext = () => setActiveTab((prev) => (prev + 1) % tabs.length);
  const handlePrev = () => setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalHeader}>
        <button className={styles.navBtn} onClick={handlePrev}>{"<"}</button>
        <div className={styles.terminalTitle}>{tabs[activeTab]}</div>
        <button className={styles.navBtn} onClick={handleNext}>{">"}</button>
      </div>

      <div className={styles.terminalScreen}>
        <div className={styles.scanline}></div>
        {activeTab === 0 && (
          <div className={styles.tabContent}>
            <div className={styles.userRow}>
              <span>STALKER_BONY</span>
              <span className={styles.statusOnline}>[В СЕТИ]</span>
            </div>
            <div className={styles.userRow}>
              <span>RADIO_GAGA</span>
              <span className={styles.statusOffline}>[OFFLINE]</span>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div className={styles.tabContent}>
            <p>СИСТЕМА ПОИСКА АКТИВНА...</p>
            <input 
              type="text" 
              className={styles.terminalInput} 
              placeholder="ВВЕДИТЕ ID ИЛИ ИМЯ..."
            />
          </div>
        )}
        {activeTab === 2 && (
          <div className={styles.tabContent}>
            <div className={styles.userRow}>
              <span>STRANGER_404</span>
              <div>
                <button className={styles.actionBtn}>ПРИНЯТЬ</button>
                <button className={styles.actionBtn}>ОТКАЗ</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{fontSize: '0.7rem', marginTop: '5px', opacity: 0.5}}>
        CONNECTION: STABLE // AUTH: OK
      </div>
    </div>
  );
};

export default FriendTerminal;