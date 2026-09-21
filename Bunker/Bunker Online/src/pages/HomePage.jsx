import React, { useState, useEffect } from 'react'; 
import styles from "@/styles/homepage.module.scss"; 
import { useLobbies } from '@/utils/useLobbies';
import { getTopLobbies } from '@/utils/lobbyFilters';
import { LobbyTable } from "../components/LobbyTable";


function HomePage() {

  const { lobbies, isLoading, error } = useLobbies();
  const topLobbies = getTopLobbies(lobbies, 3); 

  if (isLoading) return <p>Загрузка данных...</p>;
  if (error) return <p>Ошибка при загрузке: {error}</p>;

  return (
    <>
    <div className={styles.MainWrap}>
        <div className={styles.AboutGame}>
            <div className={styles.HeadAboutGame}>
                <h1>i</h1>
            </div>
            <h2>Мир на грани катастрофы!</h2>
            <p>
                Хватит ли тебе аргументов, чтобы выжить?
                «Бункер» — это дискуссионная игра на выживание, где каждый получает случайный набор характеристик. 
                Твоя цель: убедить остальных, что именно ты достоин места в убежище, 
                чтобы восстановить цивилизацию после апокалипсиса. 
            </p>
        </div>
    </div>

    <LobbyTable lobbies={topLobbies} title="Активные комнаты" />;

    </>
  );
}

export default HomePage;