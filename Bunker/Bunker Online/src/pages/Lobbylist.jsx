import React, { useState, useEffect } from 'react'; 
import { LobbyTable } from "../components/LobbyTable";
import { useLobbies } from '@/utils/useLobbies';


function LobbyList() {
    const { lobbies, isLoading, error } = useLobbies();
    
    if (isLoading) return <p>Загрузка данных...</p>;
    if (error) return <p>Ошибка при загрузке: {error}</p>;


  return (
    <>  
    <LobbyTable lobbies={lobbies} title="Все комнаты" />;
    </>
  );
}

export default LobbyList;