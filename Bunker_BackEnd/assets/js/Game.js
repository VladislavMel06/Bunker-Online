let websocket;
let userId;
let username;
let max_players;
let chek;
let playerContainer = document.getElementById("player-container");
const openModalButton = document.getElementById('invite-friends-btn');// Находим кнопку открытия по её ID
// let show = document.getElementById("username_display");
let movePlayer = document.getElementById('movePlayer');
let Curround = document.getElementById('round'); 
let pElements = null
let selectedCharacteristic = null; 
let CardId = null;
let PlacingRound = false;
let voteRound = false;
let nominatedPlayers = [];
let votedPlayer;
let around = 'AwaitUser';
const SkipBtn = document.getElementById('skip-btn');
let hasNotifiedPhpOfJoin = false;
let currentRoomId = null; 
let currentMaxPlayers = null; 
const urlParams = new URLSearchParams(window.location.search);
const rawRoomId = urlParams.get('room_id'); 

if (rawRoomId) {
    // Преобразуем строковое значение в целое число (ID комнаты обычно число)
    const parsedRoomId = parseInt(rawRoomId, 10);

    // Проверяем, что это действительно число и оно положительное (ID обычно > 0)
    if (!isNaN(parsedRoomId) && parsedRoomId > 0) {
        currentRoomId = parsedRoomId;
        console.log("ID текущей комнаты:", currentRoomId);
    } else {
        console.error("Найден room_id в URL, но он не является корректным числом:", rawRoomId);
        // Здесь можно добавить логику, если ID комнаты некорректен,
        // например, перенаправить пользователя или показать ошибку.
    }
} else {
    console.error("Параметр room_id не найден в URL.");
    // Здесь можно добавить логику, если room_id отсутствует,
    // например, перенаправить пользователя на страницу выбора комнаты.
}

// --- 2. Извлекаем max_players ---
const rawMaxPlayers = urlParams.get('max_players');

if (rawMaxPlayers) {
    const parsedMaxPlayers = parseInt(rawMaxPlayers, 10);

    // Дополнительная валидация для max_players (например, диапазон 6-12, как на сервере)
    if (!isNaN(parsedMaxPlayers) && parsedMaxPlayers >= 2 && parsedMaxPlayers <= 12) {
        currentMaxPlayers = parsedMaxPlayers;
        console.log("Максимальное количество игроков:", currentMaxPlayers);
    } else {
        console.error("Найден max_players в URL, но он не является корректным числом или вне диапазона (6-12):", rawMaxPlayers);
        // Добавьте логику обработки некорректного max_players
    }
} else {
    console.warn("Параметр max_players не найден в URL. Возможно, используйте значение по умолчанию или обработайте это.");
    // Здесь вы можете, например, установить значение по умолчанию, если это применимо:
    // currentMaxPlayers = 12; // или любое другое разумное значение по умолчанию
}

window.addEventListener('beforeunload', function (e) {
    if (currentRoomId &&  userId) {
        const dataToSend = {
            roomId: currentRoomId,
            userId: userId
        };
        
        navigator.sendBeacon('http://localhost/AbyssCup/app/controllers/player_left.php', JSON.stringify(dataToSend));
    }
});

function connectAndSend() {
  websocket = new WebSocket("ws://localhost:2345");

  websocket.onopen = function(event) 
  {
    console.log("Connected to WebSocket server");
    
    fetch('app/controllers/api.php')
    .then(response => response.json())
    .then(json => 
    {
      // console.log(json);
      const { id, username: apiUsername } = json; 
      userId = id;
      username = apiUsername;
      max_players = currentMaxPlayers;
      // console.log(userId, username); 
      sendClientInfo();
    })
    .catch(error => {
      console.error('Ошибка при получении данных:', error);
    });

  
  };

const allPlayerCardsContainer = document.getElementById('all-player-cards-container');

if (SkipBtn) {
  SkipBtn.addEventListener('click', function() {
      console.log('Кнопка "Пропустить ход" нажата!');
      const message = { type: "SkipTurn", userId: userId }; // Используй глобальный userId
      websocket.send(JSON.stringify(message));
      console.log('Отправлено на сервер:', message);
      SkipBtn.style.display = 'none';
  });
}

// Функция для создания карточки игрока 
function createPlayerCard(userId, username, userData, chek) {
  // console.log('Функция createPlayerCard сработала для:', userId, username);
  const player_card = document.createElement('div');
  player_card.classList.add('player-card'); 
  player_card.dataset.userId = userId; 

  // Обработчик клика по карточке (выдвижение на голосование)
  player_card.addEventListener('click', () => {
    if (around != 'PlacinRound') {
      return; 
    }
    const SendToServerPlacinUserId = { userId }; 
    SendToServerPlacinData(SendToServerPlacinUserId);
  });

  const h3 = document.createElement('h3');
  const span = document.createElement('span');
  span.dataset.userId = userId;
  span.textContent = username;
  h3.appendChild(span);
  player_card.appendChild(h3);

  const details = document.createElement('div');
  details.classList.add('card__content');


  if (chek){

    details.innerHTML = `
    <p id = age>Возраст: ${userData?.age || "null"}</p>
    <p id = gender>Пол: ${userData?.gender || "null"}</p>
    <p id = health>Здоровье: ${userData?.health || "null"}</p>
    <p id = profession>Профессия: ${userData?.profession || "null"}</p>
    <p id = hobby>Хобби: ${userData?.hobby || "null"}</p>
    <p id = body_type>Телосложение: ${userData?.body_type || "null"}</p>
    <p id = phobia>Фобия: ${userData?.phobia || "null"}</p>
    <p id = trait>Особенность: ${userData?.trait || "null"}</p>
    <p id = inventory>Инвентарь: ${userData?.inventory || "null"}</p>
    `;

  }else if (!chek){

    details.innerHTML = `
    <p id = age>Возраст: Не раскрыто</p>
    <p id = gender>Пол: Не раскрыто</p>
    <p id = health>Здоровье: Не раскрыто</p>
    <p id = profession>Профессия: Не раскрыто</p>
    <p id = hobby>Хобби: Не раскрыто</p>
    <p id = body_type>Телосложение: Не раскрыто</p>
    <p id = phobia>Фобия: Не раскрыто</p>
    <p id = trait>Особенность: Не раскрыто</p>
    <p id = inventory>Инвентарь: Не раскрыто</p>
   `;

  }
  else{
    details.innerHTML = `
    <p>Возраст: "Ошибка"</p>
    <p>Пол: "Ошибка"</p>
    <p>Здоровье: "НОшибка"</p>
    <p>Профессия: "Ошибка"</p>
    <p>Хобби: "Ошибка"</p>
    <p>Телосложение: "Ошибка"</p>
    <p>Фобия: "Ошибка"</p>
    <p>Особенность: "Ошибка"</p>
    <p>Инвентарь: "Ошибка"</p>
   `;
  }

  pElements = details.querySelectorAll('p');

  pElements.forEach(p => {
    p.addEventListener('click', (event) => {
      // console.log('Раунд для нажатия на хакартиристку: ', around)
      if (around != 'startGame' && around != 'CharInfoRound') {
        // console.log("Клик по характеристике заблокирован!"); 
        return; 
      }

      const elementId = event.target.id;
      let value = "Информация не найдена";
      const playerCard = event.target.closest('.player-card');

      if (playerCard) {
        CardId = playerCard.dataset.userId;
        // console.log('CARDID ИЗ P EVENT: ', CardId)
      } else {
        console.warn("Элемент p с id '" + elementId + "' не находится внутри элемента с классом 'player-card'");
      }
    
      // console.log("ПОЛУЧЕН userID: ", CardId);

      switch (elementId) {
        case 'age':
          value = userData?.age || "Неизвестно";
          break;
        case 'gender':
          value = userData?.gender || "Неизвестно";
          break;
        case 'health':
          value = userData?.health || "Неизвестно";
          break;
        case 'profession':
          value = userData?.profession || "Неизвестно";
          break;
        case 'hobby':
          value = userData?.hobby || "Неизвестно";
          break;
        case 'body_type':
          value = userData?.body_type || "Неизвестно";
          break;
        case 'phobia':
          value = userData?.phobia || "Неизвестно";
          break;
        case 'trait':
          value = userData?.trait || "Неизвестно";
          break;
        case 'inventory':
          value = userData?.inventory || "Неизвестно";
          break;
        default:
          value = "Неизвестно";
      }
      
      selectedCharacteristic = { id: elementId, value: value }; 
      
      // console.log(`Вы выбрали ${elementId}: ${value}`);
      // console.log(`Сохраненная характеристика:`, selectedCharacteristic);
      sendDataToServer(selectedCharacteristic);
    });
  });
  player_card.appendChild(details);

  return player_card; 
}

// выдвижение на голосование
function enableNominatedPlayers(nominatedPlayers) {
  // if(around != 'voteRound'){
  //   return
  // }
  const playerCardsVote = document.querySelectorAll('.player-card');
  console.log(nominatedPlayers);

  playerCardsVote.forEach(card => {
    const playerId = parseInt(card.dataset.userId, 10);
    console.log(playerId);

    if (nominatedPlayers.includes(playerId)) {
      card.classList.add('clickable');

      // Исправлено: добавляем обработчик с использованием анонимной функции
      card.addEventListener('click', function(event) {
        handleCardClick(event, playerId);
      });
      console.log('КАРТОЧКА КЛИКАБЕЛЬНА У:', playerId);
    } else {
      card.classList.remove('clickable');

      // Исправлено: удаляем обработчик (если он был)
      card.removeEventListener('click', function(event) {
        handleCardClick(event, playerId);
      });
    }
  });
}

// Обработчик голосование
function handleCardClick(event, playerId) {
  if(around != 'VoteRound'){
    return
  }

  const card = event.currentTarget;
  // const votedPlayerId = parseInt(card.dataset.userId, 10);
  
  // const currentPlayerId = getCurrentPlayerId(); // ID текущего игрока

  // Здесь выполняем какие-либо действия, когда кликнули по карточке.
  console.log(`Кликнули по карточке игрока с ID: ${playerId}`);
  console.log('votedPlayer', votedPlayer )
  // Например, можно отправить запрос на сервер, чтобы "выбрать" этого игрока.

  // Проверяем, не голосует ли игрок сам за себя.
  if (playerId === votedPlayer) {
    // alert("Нельзя голосовать за самого себя!");
    return; // Прерываем функцию, если игрок пытается голосовать за себя.
  }

  console.log(`Игрок ${votedPlayer} проголосовал за игрока ${playerId}`);
  const votePayload = { votedPlayerId: playerId };

  // Теперь вызываем глобальную функцию SendToServerVoteData, передавая ей созданный объект
  SendToServerVoteData(votePayload);
}

// Функция для добавления пользователя в контейнер
function addUserToContainer(userId, username, userData, chek) {
  // console.log("addUserToContainer вызвана для:", userId, username, userData);
  const newPlayerCard = createPlayerCard(userId, username, userData, chek); 
  allPlayerCardsContainer.appendChild(newPlayerCard); 
}

// Функция для удаления пользователя из списка
function removeUserFromList(userId) {
  const selector = ".player-card[data-user-id='" + userId + "']"; 
  const elementToRemove = document.querySelector(selector);
  if (elementToRemove) {
    elementToRemove.remove();
  } else {
    console.warn("Элемент с userId ${userId} не найден для удаления.");
  }
}

// Функция для очистки контейнера (удаляет все карточки)
function clearPlayerContainer() {
  // console.log("Очищаем контейнер игроков");
  allPlayerCardsContainer.innerHTML = ''; 
}

websocket.onmessage = function(event) {
  if (event.data.startsWith('{')) {
    try {
      const data = JSON.parse(event.data);
      messageType = data.type;
      switch (String(data.type).trim()) {
        case 'isRound':
          console.log(data.round);
          around = data.round;
          console.log('Раунд: ', around)
          openModalButton.style.display = 'none';
      
        if (data.round === 'startGame') { 
          console.log("Обновляю текст Curround на 'Раскрытие характеристик'");
          Curround.textContent = 'Раскрытие характиристик';
          voteRound = false;
          PlacingRound = false;
        } else if (data.round === 'PlacinRound') {
          console.log("Обновляю текст Curround на 'Выдвижение на голосование'");
          Curround.textContent = 'Выдвижение на голосование';
          voteRound = false;
        } else if (data.round === 'VoteRound') {
          PlacingRound = false;
          console.log("Обновляю текст Curround на 'Голосование'");
          Curround.textContent = 'Голосование';
        } else if (data.round === 'CharInfoRound') {
          PlacingRound = false;
          voteRound = false;
          console.log("Обновляю текст Curround на 'Раскрытие характеристик' (CharInfoRound)");
          Curround.textContent = 'Раскрытие характиристик';
        } else if (data.round === 'EndGame') {
          PlacingRound = false;
          voteRound = false;
          movePlayer.textContent = ""
          console.log("Обновляю текст Curround на 'Конец игры!' (EndGame)");
          Curround.textContent = 'Конец игры!';
        } else {
          PlacingRound = false;
          console.log("Получен неизвестный тип раунда:", data.round);
        }  
        break;

        case 'PlacinRound':
          console.log(data.round);
          PlacingRound = true;
          voteRound = false;
          console.log('текущий раунд:', PlacingRound);
        break;

        case 'PlacinUserList':
          console.log(data.mess);
          console.log(data.nominatedPlayers);
          PlacingRound = false;
          voteRound = true;
          // nominatedPlayers  = data.nominatedPlayers;
          enableNominatedPlayers(data.nominatedPlayers);
          // const playerCards2 = document.querySelectorAll('.player-card');
          // let foundPlacinCard = false; 
          // Curround .textContent = 'Раунд: голосование';
        break;

        case 'GameResult':
          console.log(data.remainingPlayers);
          console.log(data.message);
        break;

        case 'newTurn':
          console.log("Ход игрока " + data.currentPlayerId);
          votedPlayer = data.currentPlayerId;
          movePlayer.textContent = "Ход игрока " + data.currentPlayerId;
          SkipBtn.style.display = 'none';
          SkipBtn.disabled = true; 
          if (data.currentPlayerId==userId){
            movePlayer.textContent = 'Ваш ход!';
            if(data.round != 'CharInfoRound'){
              SkipBtn.style.display = 'block'; // Показываем кнопку
              SkipBtn.disabled = false; // Делаем кнопку активной
              console.log('Кнопка должна быть видна и активна!');
            }
            else {
              // Если data.round == 'charInfoRound', то прячем кнопку
              SkipBtn.style.display = 'none'; // Скрываем кнопку
              SkipBtn.disabled = true; // Делаем кнопку неактивной (хорошая практика, даже если она скрыта)
              console.log('Кнопка пропуска хода: скрыта и неактивна.');
            }
          }
          // Обновляем интерфейс, показываем чей ход
          // updateCurrentPlayerDisplay(message.data.currentPlayerId);
          // Деактивируем/активируем элементы интерфейса в зависимости от того, наш сейчас ход или нет
          // if (message.data.currentPlayerId === myUserId) {
          //   enableCharacteristicSelection();
          // } else {
          //   // disableCharacteristicSelection();
          // }
          
        break;

        case 'yourTurn':
          const currentPlayerId = data.currentPlayerId;
          console.log("Ваш ход!");
          movePlayer.textContent = 'Ваш ход!';
  
        break;

        case 'error':
          console.error("Ошибка: " + data.message);
          // Отображаем сообщение об ошибке пользователю
          // displayErrorMessage(message.data.message);
        break;
        case 'VoteRound':
          console.log("Раунд голосования");
        break;

        case 'roleAssignment':
          if (data.role === 'leader') {
            // Клиент стал ведущим.  Изменяем интерфейс.
            console.log("Вы назначены ведущим!");
            // Например, показываем кнопки для управления игрой
          } else {
            // Клиент - обычный участник.
            console.log("Вы - участник игры.");
            // Убираем элементы интерфейса, доступные только ведущему
          }
        break;

        case 'newUser':
          // console.log("Received newUser message");
          addUserToContainer(data.userId, data.username, data.userData, false);
          // movePlayer.textContent = "Ход игрока " + data.currentPlayerId;
        break;

        case 'userLeft':
          removeUserFromList(data.userId);
        break;
        
        case 'totalVote':
          PlacingRound = false;
          voteRound = false;
          console.log(data.mess);
          console.log(data.voteResults);
        break;

        case 'playerEliminated':
          console.log(data.message);
          console.log(data.playerId);
          removeUserFromList(data.playerId);
        break;

        case 'cPlacinData_ack':
          // console.log("Получено подтверждение от сервера:");
        break;

        case 'PlacinData':
          // alert(`НА ГОЛОСОВАНИЕ ВЫДВИНУТ ИГРОК С ID: ${data.userId}`);
          console.log("НА ГОЛОСОВАНИЕ ВЫДВИНУТ ИГРОК С ID:", data.userId);
        break;

        case 'existingUsers':
          // console.log("Received existingUsers message");
          clearPlayerContainer();
          // Проверяем, если это первое сообщение existingUsers для этого клиента
          // и мы еще не уведомили PHP-сервер о присоединении.
          // И самое главное - убеждаемся, что currentRoomId существует.
          if (!hasNotifiedPhpOfJoin && currentRoomId) {
            console.log("Отправляем уведомление PHP-серверу о присоединении пользователя к комнате:", currentRoomId);
            console.log("Room ID:", currentRoomId); 
            console.log("User ID:", userId);    
            fetch('app/controllers/player_joined.php', { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ roomId: currentRoomId, userId: userId }) // Отправляем ID комнаты и ID пользователя
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                hasNotifiedPhpOfJoin = true; // Устанавливаем флаг, чтобы не отправлять повторно
                console.log('PHP-сервер успешно обновлен: current_players увеличен.', data.message);
              } else {
                console.error('Ошибка при уведомлении PHP-сервера:', data.message);
              }
            })
            .catch(error => {
                console.error('Ошибка сети при отправке уведомления PHP-серверу:', error);
            });
          }

          data.users.forEach(user => {
            // console.log("ЭТО СООБЩЕНИЕ ДЛЯ ПРОВЕРКИ ТЕКУЩИЕ ПОЛЬЗОВТАЕЛИ АКТИВИРОВАЛИСЬ!!!");
            // console.log("User:", user.userId, user.username, user.userData, user.round); 
            if(user.userId === userId){
              addUserToContainer(user.userId, user.username, user.userData, true); 
            }
            else{
              addUserToContainer(user.userId, user.username, user.userData, false); 
            }
        });
        data.users.forEach(user => {
          if (user.isLeader) {
            console.log(user.username + " - ведущий!");
          }
        });

        
        break;
        
        case 'charsInfo_ack':
        // console.log("Received charsInfo_ack message"); 
        // console.log("Информация успешно получена сервером.");
        break;
        case 'charsInfo':
        PlacingRound = false;
        voteRound = false;
        let moveId = data.userId;
        const element = data.element;
        const value = data.value;
        const playerCards = document.querySelectorAll('.player-card');
        // Итерируемся по карточкам и ищем нужную
        let foundCard = false; 
        playerCards.forEach(card => {
          const cardUserId = card.dataset.userId;

          if (cardUserId === String(moveId)) { 
            console.log("Found matching player card with userId:", moveId);
            foundCard = true;

            let elementToUpdate;
            let prefix = ""; 

            switch (element) 
            {
              case 'age':
                elementToUpdate = card.querySelector('#age');
                prefix = "Возраст: ";
                break;
              case 'gender':
                elementToUpdate = card.querySelector('#gender');
                prefix = "Пол: ";
                break;
              case 'hobby':
                elementToUpdate = card.querySelector('#hobby');
                prefix = "Хобби: ";
                break;
              case 'health':
                elementToUpdate = card.querySelector('#health');
                prefix = "Здоровье: ";
                break;
              case 'profession':
                elementToUpdate = card.querySelector('#profession');
                prefix = "Профессия: ";
                break;
              case 'body_type':
                elementToUpdate = card.querySelector('#body_type');
                prefix = "Телосложение: ";
                break;
              case 'phobia':
                elementToUpdate = card.querySelector('#phobia');
                prefix = "Фобия: ";
                break;
              case 'trait':
                elementToUpdate = card.querySelector('#trait');
                prefix = "Особеность: ";
                break;
              case 'inventory':
                elementToUpdate = card.querySelector('#inventory');
                prefix = "Инвентарь: ";
                break;
              default:
                console.warn("Unknown element type:", element);
                return; 
            }

            if (elementToUpdate) {
              elementToUpdate.textContent = prefix + value; 
              console.log("Updated element:", element, "with value:", value);
            } else {
              console.warn("Element with id '" + element + "' not found in card.");
            }
            return;
          }
        });

        if (!foundCard) {
          console.warn("No player card found with userId:", moveId);
        }
        break;

        default:
          console.warn("Неизвестный тип сообщения:", data.type);
        break;
      }
    } catch (e) {
      console.warn("Не удалось обработать сообщение JSON:", event.data, e);
    }
  } else {
    console.log("Получено текстовое сообщение:", event.data);
  }
};


  websocket.onerror = function(event)
  {
    console.error("WebSocket error:", event);
  };
}


function sendClientInfo() {
  if (!userId || !username) {
    console.warn("Информация о пользователе еще не получена. Повторная попытка...");
    setTimeout(sendClientInfo, 500);
    return;
  }

  const clientInfo = {
    type: 'clientInfo', 
    userId: userId,
    username: username,
    max_players: max_players
  };

  const message = JSON.stringify(clientInfo);
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    // console.log("Отправлено на сервер:", message);
  } else {
    console.warn("Websocket не открыт или не готов");
  }

}

function sendDataToServer(selectedCharacteristic) {
  const charsInfo = {
    type: 'charsInfo',
    userId: userId,
    element: selectedCharacteristic.id, 
    value: selectedCharacteristic.value 
  };

  const message = JSON.stringify(charsInfo);
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    // console.log("Отправлено на сервер:", message);
  } else {
    console.warn("Websocket не открыт или не готов");
  }
}

function SendToServerPlacinData(SendToServerPlacinUserId) {
  const PlacinData = {
    type: 'PlacinData',
    userId: SendToServerPlacinUserId.userId, 
  };

  const message = JSON.stringify(PlacinData);
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    // console.log("Отправлено на сервер:", message);
  } else {
    console.warn("Websocket не открыт или не готов");
  }
}


function SendToServerVoteData(voteData) {
  const VoteData = {
    type: 'VoteData',
    userId: voteData.votedPlayerId, 
  };

  const message = JSON.stringify(VoteData);
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    console.log("Отправлено на сервер:", message);
  } else {
    console.warn("Websocket не открыт или не готов");
  }
}

// Функция для отправки данных на сервер о пропуске хода игрока
function SendToServerSkipTurn(dataToSend) {
  const SkipTurnData = {
    type: 'SkipTurn', 
    userId: dataToSend.userId,
  };

  const message = JSON.stringify(SkipTurnData );
  
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    console.log("Отправлено на сервер:", message);
  } else {
    console.warn("Websocket не открыт или не готов. Сообщение не отправлено:", message);
  }
}

// Функция-обработчик клика по карточке
function handleCardClick(event) {
    const card = event.target;
    const cardUserIdP = card.dataset.userId;
    console.log(`Вы нажали на карточку пользователя ${cardUserIdP}!`);

    // Здесь можно добавить код для отправки информации о голосовании на сервер.
}

// Получаем элемент иконки по классу
// const dragonIcon = document.querySelector('.fa-solid.fa-dragon');

// if (dragonIcon) {
//   dragonIcon.addEventListener('click', () => {
//     PlacingRound = !PlacingRound;
//     // console.log('Состояние PlacingRound:', PlacingRound);
//   });
// } else {
//   console.error('Иконка дракона не найдена! Проверьте правильность класса.');
// } 




// Запускаем процесс подключения и отправки информации при загрузке страницы
window.onload = connectAndSend;






















