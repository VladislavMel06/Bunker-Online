import React, { useState } from 'react';
import styles from '@/styles/PasswordModal.module.scss';
import lockOpenImg from "@/img/lock-open.png";
import lockClosedImg from "@/img/lock-closed.png";

export const PasswordModal = ({ isOpen, onClose, onSuccess, lobbyId }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('room_id', lobbyId);
            formData.append('password', password);

            const res = await fetch("/api/check_room_password.php", {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await res.json();

            if (data.success) {
                onSuccess(); 
            } else {
                setError(data.message || 'Неверный пароль');
            }
        } catch (err) {
            setError('Ошибка связи с сервером');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.Overlay}>
            <div className={styles.InputContainer}>
                <button className={styles.CloseBtn} onClick={onClose}>&times;</button>
                <h2>Введите пароль</h2>
                <div className={styles.InputWrapper}>
                    <input 
                        type="text"
                        placeholder="Пароль от комнаты"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        autoFocus
                    />
                    <span className={styles.highlight}></span>
                    <img 
                        src={password.length > 0 ? lockClosedImg : lockOpenImg} 
                        alt="lock" 
                    />
                </div>
                <button 
                    className={styles.SubmitBtn} 
                    onClick={handleSubmit}
                    disabled={isLoading || !password}
                >
                    {isLoading ? 'Проверка...' : 'Войти'}
                </button>
                {error && <p className={styles.Error}>{error}</p>}
            </div>
        </div>
    );
};
