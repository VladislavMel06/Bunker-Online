import React, { useState } from 'react';
import styles from "@/styles/CreateLobby.module.scss";
import { useNavigate } from 'react-router-dom';
import lockOpenImg from "../img/lock-open.png";
import lockClosedImg from '../img/lock-closed.png';
function CreateLobby () {

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const [selectedDifficulty, setSelectedDifficulty] = useState('нормальная');
    const options = ['легкая', 'нормальная', 'сложная'];
    const [isLockedManually, setIsLockedManually] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');

    const [count, setCount] = useState(6);
    const min = 6;
    const max = 12;

    const [error, setError] = useState('');
    const [errorpass, setErrorPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIncrement = () => {
        if (count < max) setCount(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (count > min) setCount(prev => prev - 1);
    };

    const handleChange = (e) => {
        if (e.target.value === '') {
            setCount('');
            return;
        }
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) setCount(value);
    };

    const handleBlur = () => {
        if (count === '' || count < min) {
            setCount(min);
        } else if (count > max) {
            setCount(max);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option) => {
        setSelectedDifficulty(option);
        setIsOpen(false);
    };

    const handleCreateeLobby = async () =>{
        setError('');
        setErrorPass('');

        if (isLockedManually && password.length === 0) {
            setErrorPass('Вы закрыли комнату на замок, но не ввели пароль!');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const diffMap = {
            'легкая': 'easy',
            'нормальная': 'normal',
            'сложная': 'hard',
        }

        const formData = new FormData();
        formData.append('nameRoom', roomName);
        formData.append('password', password);
        formData.append('playerCount', count);
        formData.append('difficulty', diffMap[selectedDifficulty]||'normal');
        try{
            const res = await fetch("/api/createRoomControll.php",{
                method:'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if(data.success){
                navigate(`/game/${data.room_id}`, { 
                    state: { maxPlayers: data.max_players } 
                });
            }else{
                setError(data.message);
            }
        }
        catch(error){
            setError('Связь с бункером потерена! (ошибка сервера!)');
        }
        finally{
            setIsLoading(false);
        };
    }

  return (
    <>
    <div className={styles.bg}></div>
    <div className={styles.HeadWrap}>
        <h1>Создать комнату</h1>
        <canvas></canvas> 
    </div>

    <div className={styles.MainWrap}>
        <div className={styles.Wrap}>

            <div className={styles.LobbySetName}>
                <div className={styles.InputContainer}> 
                    <input placeholder='Название комнаты' value={roomName} onChange={(e)=>{setRoomName(e.target.value); if(error) setError('')}}></input>
                    <span className={styles.highlight}></span>
                </div>
                {error && <p className={styles.ErrorMessage}>[СИСТЕМНАЯ ОШИБКА]: {error}</p>}
            </div>

            <div className={styles.LobbySetName}>
                <div className={styles.InputContainer}> 
                    <div className={styles.InputPassContent}>
                        <input placeholder='Пароль' value={password} onChange={(e)=>{setPassword(e.target.value); if(errorpass) setErrorPass('')}}></input>
                        <span className={styles.highlight}></span>
                        <img 
                            src={(password.length > 0 || isLockedManually) ? lockClosedImg : lockOpenImg} 
                            className={styles.PasswordIconImg} 
                            alt="lock" 
                            onClick={() => setIsLockedManually(!isLockedManually)}
                            style={{ cursor: 'pointer' }} 
                        />
                    </div>
                </div>
                {errorpass && <p className={styles.ErrorMessage}>[СИСТЕМНАЯ ОШИБКА]: {errorpass}</p>}
            </div>

            <div className={styles.PlayerCountButton}>
                <p className={styles.AboutThis}>Количество игроков (от 6 до 12)</p>
                <button className={styles.ButtonMinus} onClick={handleDecrement} disabled={count <= min}>-</button>
                <input  
                    className={styles.NumInput}
                    value={count} 
                    onChange={handleChange}
                    style={{ textAlign: 'center', width: '50px' }}
                    onBlur={handleBlur} 
                />
                <button className={styles.ButtonPlas} onClick={handleIncrement} disabled={count >= max}>+</button>
            </div>

        <div className={styles.DificultiWrap}>
            <p className={styles.Label}>Сложность</p>
      
            <div className={styles.DropdownHeader} onClick={toggleDropdown}>
                <span>{selectedDifficulty}</span>
                <div className={`${styles.Triangle} ${isOpen ? styles.TriangleOpen : ''}`} />
            </div>

            {isOpen && (
                <ul className={styles.DropdownList}>
                    {options.map((option) => (
                        <li 
                            key={option} 
                            className={styles.DropdownItem} 
                            onClick={() => handleSelect(option)}
                        >
                    {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button className={styles.CreateBtn} onClick={handleCreateeLobby} disabled={isLoading||!roomName}>{isLoading ? 'Инициализация...' : 'Создать'}</button>
        </div>
    </div>
    </>
  );
}


export default CreateLobby;
