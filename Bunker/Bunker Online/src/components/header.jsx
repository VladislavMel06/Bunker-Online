import styles from "@/styles/header.module.scss"; 
import React from 'react';
import { Link } from 'react-router-dom';

function Header(){
    return(
        <header>
            <div className={styles.headerWrap}>
                <div className={styles.headerLogo}>
                    <Link to="/">Бункер</Link>
                    <div  className={styles.parallelogram}>  /  /  /</div>
                </div>

                <div className={styles.headerContent}>
                    <ul className={styles.headerLinkList}>
                        <li><Link to="/listLobby">Присоединиться</Link></li>
                        <li><Link to="/createlobby">Создать комнату</Link></li>
                        <li><Link to="/profile">Профиль</Link></li>
                        <li><Link to="/logout">Выйти</Link></li>
                    </ul>
                </div>

            </div>
        </header>
    )
}

export default Header