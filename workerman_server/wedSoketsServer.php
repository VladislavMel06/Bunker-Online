<?php
header('Content-Type: application/json; charset=utf-8');
use Workerman\Worker;
use Workerman\Connection\TcpConnection;
use Workerman\Protocols\Websocket;

require_once __DIR__ . '/vendor/autoload.php';
$config = [
    'log_file' => __DIR__ . '/workerman.log', 
]
;

global $nominatedPlayers; 
$nominatedPlayers = $nominatedPlayers ?? [];

global $userCount;
$userCount = 0;

global $playersMadeMove;
$playersMadeMove = 0;

global $moveCountInfoChars;
$moveCountInfoChars = 0;

global $voteCounts;
if (!isset($voteCounts)) {
    $voteCounts = []; 
}

global $CurenRound;
$CurenRound = 'AwaitUser';

function addUniqueValue(&$array, $value) {
  if (!in_array($value, $array)) {
    $array[] = $value; 
  }
}

function generateBunkerConditions(): string {
    $sizes = [
        'Крошечный, тесный бункер',
        'Небольшой бункер',
        'Просторный бункер',
        'Огромный, роскошный бункер',
    ];

    $foodSupplies = [
        'с минимальным запасом еды (хватит на месяц)',
        'с небольшим запасом еды (хватит на полгода)',
        'с хорошим запасом еды (хватит на год)',
        'с огромным запасом еды (хватит на 3 года)',
        'с бесконечным запасом еды (есть собственная ферма)',
    ];

    $items = [
        'Отсутствуют полезные предметы',
        'В бункере есть аптечка и лом',
        'В бункере есть душевая кабинка и генератор',
        'В бункере есть библиотека и запас инструментов',
        'В бункере есть джакузи, кинотеатр и спортзал',
    ];

    $size = $sizes[array_rand($sizes)];
    $food = $foodSupplies[array_rand($foodSupplies)];
    $item = $items[array_rand($items)];

    return "$size $food. $item.";
}

function generateCataclysm(): string {
    $cataclysms = [
        'Глобальный потоп',
        'Ядерная зима',
        'Зомби-апокалипсис',
        'Падение огромного астероида',
        'Эпидемия смертельного вируса',
    ];

    $durations = [
        '6 месяцев',
        '1 год',
        '1.5 года',
        '2 года',
        '3 года',
    ];

    $cataclysm = $cataclysms[array_rand($cataclysms)];
    $duration = $durations[array_rand($durations)];

    return "$cataclysm. В бункере требуется провести $duration.";
}

function generateRandomCharsData() {
    $genders = ['мужской', 'женский'];
    $hobbies = [
    'охота',
    'рыбалка',
    'медицина',
    'инженерия',
    'программирование',
    'фермерство',
    'строительство',
    'радиосвязь',
    'механика',
    'психология',
    'кулинария',
    'электроника',
    'садоводство',
    'спортивная подготовка',
    'преподавание'
];

$health_statuses = [
    'Абсолютно здоров',
    'Астма (лёгкая форма)',
    'Диабет 2 типа (контролируемый)',
    'Гипертония (контролируемая)',
    'Аллергия на пыльцу',
    'Мигрени (редкие приступы)',
    'Старая травма колена',
    'Плохое зрение (нужны очки)',
    'Хронический бронхит',
    'Бессонница',
    'Гастрит (нужна диета)',
    'Абсолютно здоров (донор универсальной крови)',
    'Лёгкая форма ПТСР',
    'Ревматизм (реагирует на погоду)',
    'Абсолютно здоров (повышенный иммунитет)'
];

$professions = [
    'Врач-хирург',
    'Инженер-строитель',
    'Военный (спецназ)',
    'Биолог',
    'Фермер',
    'Электрик',
    'Механик',
    'Программист',
    'Психолог',
    'Пожарный',
    'Учитель химии',
    'Геолог',
    'Ветеринар',
    'Повар',
    'Радист',
    'Медсестра',
    'Архитектор',
    'Водолаз',
    'Лётчик',
    'Фармацевт'
];

$body_types = ['худощавое', 'атлетическое', 'плотное', 'крепкое', 'жилистое'];

$phobias = [
    'отсутствуют (стрессоустойчив)',
    'боязнь замкнутых пространств',
    'боязнь темноты',
    'боязнь высоты',
    'панический страх пауков',
    'боязнь громких звуков',
    'страх заражения',
    'социофобия',
    'отсутствуют (абсолютное спокойствие)',
    'боязнь огня',
    'страх утопления',
    'боязнь одиночества'
];

$traits = [
    'лидерские качества',
    'аналитический склад ума',
    'спокойный и рассудительный',
    'агрессивный и напористый',
    'дружелюбный и отзывчивый',
    'хитрый и изворотливый',
    'педантичный и организованный',
    'творческий и изобретательный',
    'подозрительный и недоверчивый',
    'решительный и смелый',
    'осторожный и предусмотрительный',
    'харизматичный и убедительный',
    'эгоистичный и расчётливый',
    'оптимистичный и жизнерадостный',
    'молчаливый и наблюдательный'
];

$inventories = [
    'Аптечка первой помощи',
    'Охотничий нож',
    'Фонарик с запасными батарейками',
    'Набор рыболовных снастей',
    'Огнестрельное оружие (пистолет, 12 патронов)',
    'Радиоприёмник',
    'Набор инструментов (отвёртки, молоток, пила)',
    'Запас консервов на 2 недели',
    'Книга по выживанию',
    'Топор',
    'Спальный мешок и палатка',
    'Семена овощей (набор для посадки)',
    'Солнечная батарея',
    'Противогаз и защитный костюм',
    'Верёвка (50 метров)',
    'Фляга с фильтром для воды',
    'Географическая карта местности',
    'Швейный набор и запас ткани',
    'Дозиметр',
    'Лом и кувалда'
];

    $age = rand(18, 90);
    $gender = $genders[array_rand($genders)];
    $hobby = $hobbies[array_rand($hobbies)];
    $health = $health_statuses[array_rand($health_statuses)];
    $profession = $professions[array_rand($professions)];
    $body_type = $body_types[array_rand($body_types)];
    $phobia = $phobias[array_rand($phobias)];
    $trait = $traits[array_rand($traits)];
    $inventory = $inventories[array_rand($inventories)];

    $gender = mb_convert_encoding($gender, 'UTF-8');
    $hobby = mb_convert_encoding($hobby, 'UTF-8');
    $health = mb_convert_encoding($health, 'UTF-8');
    $profession = mb_convert_encoding($profession, 'UTF-8');
    $body_type = mb_convert_encoding($body_type, 'UTF-8');
    $phobia = mb_convert_encoding($phobia, 'UTF-8');
    $trait = mb_convert_encoding($trait, 'UTF-8');
    $inventory = mb_convert_encoding($inventory, 'UTF-8');

    return [
        'age' => $age,
        'gender' => $gender,
        'hobby' => $hobby,
        'health' => $health,
        'profession' => $profession,
        'body_type' => $body_type,
        'phobia' => $phobia,
        'trait' => $trait,
        'inventory' => $inventory,
    ];
}


function startRound() {
    echo "\n🛑 ФУНКЦИЯ startRound() ВЫЗВАНА! Переменная userCount = " . $GLOBALS['userCount'] . "\n";
    global $userCount, $Roomsize, $round, $leaderId, $currentPlayerId;
    global $clients; 
    global $playersMadeMove; 

    $playersMadeMove = 0;
    $currentPlayerId = $leaderId;

    if (isset($clients[$currentPlayerId])) {
        sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
    }

    foreach ($clients as $userId => $connection) {
        sendMessage($connection, 'newTurn', ['currentPlayerId' => $currentPlayerId]);
    }
}

function allPlayersMadeMove() {
    global $clients; 
    global $playersMadeMove; 
    if (!is_array($clients) || !is_int($playersMadeMove)) {
        sendMessage($connection, 'error', ['message' => 'clients или playersMadeMove не существуют или имеют не правельный тип.']);
        return false; 
    }
    $totalPlayers = count($clients);
    return $playersMadeMove === $totalPlayers;
}

function getNextPlayerId($currentId) {
    global $clients; 
    
    $activePlayerIds = array_keys($clients);

    if (count($activePlayerIds) <= 1) {
        return !empty($activePlayerIds) ? $activePlayerIds[0] : null; 
    }
    $currentKeyIndex = array_search($currentId, $activePlayerIds);
    $nextKeyIndex = 0; 

    if ($currentKeyIndex !== false) {
        $nextKeyIndex = ($currentKeyIndex + 1) % count($activePlayerIds);
    } else {
        error_log("getNextPlayerId: Current player ID '$currentId' not found in active clients.");
    }
    return $activePlayerIds[$nextKeyIndex];
}

$ws_worker = new Worker("websocket://0.0.0.0:2345");


$ws_worker->name = 'MyWebSocketServer';


$clients = []; 

function logMessage(string $level, string $message): void {
    global $config;
    $logMessage = date('Y-m-d H:i:s') . " [$level] " . $message . "\n";
    error_log($logMessage, 3, $config['log_file']); 
}

function sendMessage(TcpConnection $connection, string $type, array $data = []): void {
    $message = json_encode(array_merge(['type' => $type], $data), JSON_UNESCAPED_UNICODE);
    $connection->send($message);
}

function sendMessageToAllExcept(string $excludeUserId, string $type, array $data = []): void {
    global $clients;
    foreach ($clients as $userId => $connection) {
        if ($userId != $excludeUserId) {
            sendMessage($connection, $type, $data);
        }
    }
}

function sendMessageToAll(string $type, array $data = []): void {
    global $clients;
    foreach ($clients as $userId => $connection) {
       
        sendMessage($connection, $type, $data);
        
    }
}

function getEliminatedPlayerId(array $voteCounts): ?int
{
    if (empty($voteCounts)) {
        return null; 
    }
    $maxVotes = max($voteCounts);
    $eliminationCandidates = array_keys($voteCounts, $maxVotes, true);
    if (count($eliminationCandidates) > 1) {
        return null;
    }
    return reset($eliminationCandidates);
}


$ws_worker->onConnect = function(TcpConnection $connection) use (&$clients) {
    echo "Новое соединение: " . $connection->getRemoteAddress() . "\n";
};

$ws_worker->onMessage = function(TcpConnection $connection, $data) use (&$clients) {
    error_log(date('Y-m-d H:i:s') . " [INFO] Получено сообщение от: " . $connection->getRemoteAddress() . ": " . $data);

    $clientInfo = json_decode($data, true); 

    if ($clientInfo === null && json_last_error() !== JSON_ERROR_NONE) {
        $error_message = "Ошибка декодирования JSON: " . json_last_error_msg();
        error_log(date('Y-m-d H:i:s') . " [ERROR] " . $error_message);
        sendMessage($connection, 'error', ['message' => 'Некорректный JSON формат.']);
        return;
    }

    switch ($clientInfo['type']) {
    case 'clientInfo':
        if ($clientInfo !== null) 
        {
            $userId = $clientInfo['userId'] ?? null;
            $username = $clientInfo['username'] ?? null;
            $maxPlayers = $clientInfo['max_players'] ?? null;
            echo "maxPlayers: " . $maxPlayers . "\n";
            global $userCount, $Roomsize,  $leaderId, $CurenRound; 
            $CurenRound = 'AwaitUser';
            $Roomsize = $maxPlayers; 
            if (!isset($userCount)) {
                $userCount = 0;
            }

            $userCount++;
            echo "UserCount увиличен до: " . $userCount . "\n"; 
            if ($userCount == 1) { 
                $leaderId = $userId; 
                $connection->isLeader = true; 
                sendMessage($connection, 'roleAssignment', ['role' => 'leader']); 
            }
            else{
                $connection->isLeader = false; 
                sendMessage($connection, 'roleAssignment', ['role' => 'participant']);  
            }
            
            if ($userId === null) {
                error_log(date('Y-m-d H:i:s') . " [ERROR] Отсутствует UserID в сообщении.");
                sendMessage($connection, 'error', ['message' => 'UserID не найден в сообщении.']);
                return;
            }

            if ($username === null) {
                error_log(date('Y-m-d H:i:s') . " [ERROR] Отсутствует username в сообщении.");
                sendMessage($connection, 'error', ['message' => 'Username не найден в сообщении.']);
                return;
            }
            $userData = generateRandomCharsData();

            $clients[$userId] = $connection;
            $connection->username = $username;
            $connection->userId = $userId;
            $connection->userData = $userData;

            $existingUsers = [];
            foreach ($clients as $existingUserId => $existingConnection) {
                $isLeader = ($existingUserId == $leaderId);
                $existingUsers[] = ['userId' => $existingUserId, 
                    'username' => $existingConnection->username ?? 'UnknownUser', 
                    'userData' => $existingConnection->userData ?? 'null',
                    'round' => $CurenRound,
                    'isLeader' => $isLeader ??
                []];
            }
            $isLeader = ($userId == $leaderId);
            sendMessage($connection, 'existingUsers', ['users' => $existingUsers]);
            sendMessageToAllExcept($userId, 'newUser', ['userId' => $userId, 'username' => $username, 'userData' => $userData, 'round' => $CurenRound,'isLeader' => $isLeader] ); 

            logMessage('INFO', "Пользователь зарегистрирован: UserID=" . $userId . ", Username=" . $username . ", Данные: " . json_encode($userData));
            if ($userCount >= $maxPlayers && $CurenRound !== 'CharInfoRound'){
                $CurenRound = 'CharInfoRound';
                logMessage('INFO', "Раунд запускается! Игроков: " . $userCount . " из " . $maxPlayers);
                startRound();
                sendMessageToAll('isRound', ['round' => $CurenRound]);
            } else {
                logMessage('DEBUG', "Проверка старта: Игроков " . $userCount . ", Нужно " . $maxPlayers . ", Текущий раунд: " . $CurenRound);
            }

            
            
        } else {
            $connection->send('Получено: ' . $data);
        }
        break;
        
    case 'charsInfo':
        global $clients, $CurenRound, $currentPlayerId, $playersMadeMove; 
        echo "Получено сообщение от " . $connection->getRemoteAddress() . ":\n";

        if ($clientInfo  === null && json_last_error() !== JSON_ERROR_NONE) {
            echo "Ошибка декодирования JSON: " . json_last_error_msg() . "\n";
            $connection->send("Ошибка: Некорректный JSON формат");
            return;
        }

        echo "Раунд: " .  $CurenRound  . ":\n";
        if ($CurenRound  != 'CharInfoRound') {
            sendMessage($connection, 'error', ['message' => 'Сейчас раунд не для раскрытия характеристик!']);
            return;
        }

        if (isset($clientInfo ['type']) && $clientInfo ['type'] === 'charsInfo') {
            echo "  Тип: charsInfo\n";
            echo "  Элемент: " . (isset($clientInfo ['element']) ? $clientInfo ['element'] : 'Не указан') . "\n";
            echo "  Значение: " . (isset($clientInfo ['value']) ? $clientInfo ['value'] : 'Не указано') . "\n";
            echo "  Значение: " . (isset($clientInfo ['userId']) ? $clientInfo ['userId'] : 'Не указано') . "\n";
            if ($connection->userId !== $currentPlayerId) {
                sendMessage($connection, 'error', ['message' => 'Сейчас не ваш ход!']);
                return;
            }
            if ($connection->userId !== $clientInfo ['userId']) {
                sendMessage($connection, 'error', ['message' => 'Несоответствие userId!']);
                return;
            }

            $dataToSend = [
                'element' => $clientInfo ['element'] ?? null, 
                'value'   => $clientInfo ['value'] ?? null,   
                'userId' => $clientInfo ['userId'] ?? null,   
            ];

            $playersMadeMove++;

            sendMessage($connection, 'charsInfo_ack', ['status' => 'ok', 'message' => 'Информация получена']); 
            sendMessageToAllExcept($connection->userId, 'charsInfo', $dataToSend);

            if (allPlayersMadeMove()) {
                $playersMadeMove = 0; 
                $activePlayerIds = array_keys($clients);
                if (!empty($activePlayerIds)) {
                    $currentPlayerId = $activePlayerIds[0];
                } else {
                    $currentPlayerId = null; 
                    error_log(date('Y-m-d H:i:s') . " [CRITICAL] Все игроки отключились во время перехода к новой фазе!");
                }
                $CurenRound =  'PlacinRound'; 
                sendMessageToAll('PlacinRound', ['message' => 'Все сделали ход, переходим к следующему раунду']);
                sendMessageToAll('isRound', ['round' => $CurenRound   ?? null,  ]);
                startRound();
            }
            else{
                $currentPlayerId = getNextPlayerId($currentPlayerId);

                sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
                if (isset($clients[$currentPlayerId])) {
                    sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
                }
                sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
            }

        } else {
            echo "Неизвестный тип сообщения\n";
            echo "  Сообщение: " . $data . "\n";
            $connection->send("Ошибка: Неизвестный тип сообщения");
        }
    break;


    case'SkipTurn':
        echo "Получено сообщение от " . $connection->getRemoteAddress() . ":\n";

        if ($clientInfo  === null && json_last_error() !== JSON_ERROR_NONE) {
            echo "Ошибка декодирования JSON: " . json_last_error_msg() . "\n";
            $connection->send("Ошибка: Некорректный JSON формат");
            return;
        }
        
        if ($CurenRound  === 'CharInfoRound') {
            sendMessage($connection, 'error', ['message' => 'В раунде раскрытия характиристик пропустить свой ход нельзя']);
            return;
        }
        global $currentPlayerId;
        if ($connection->userId !== $currentPlayerId) {
            sendMessage($connection, 'error', ['message' => 'Сейчас не ваш ход!']);
            return;
        }
        if ($connection->userId !== $clientInfo['userId']) {
            sendMessage($connection, 'error', ['message' => 'Несоответствие userId!']);
            return;
        }

        global $clients, $CurenRound, $currentPlayerId, $playersMadeMove;

        $playersMadeMove++;

        if (allPlayersMadeMove()) {
                $playersMadeMove = 0; 
                $activePlayerIds = array_keys($clients);
                if (!empty($activePlayerIds)) {
                    $currentPlayerId = $activePlayerIds[0];
                } else {
                    $currentPlayerId = null; 
                    error_log(date('Y-m-d H:i:s') . " [CRITICAL] Все игроки отключились во время перехода к новой фазе!");
                }

                if($CurenRound == 'PlacinRound'){
                    $CurenRound =  'VoteRound'; 
                    sendMessageToAll('PlacinRound', ['message' => 'Все сделали ход, переходим к следующему раунду']);
                    sendMessageToAll('isRound', ['round' => $CurenRound   ?? null,  ]);
                   
                }elseif ($CurenRound == 'VoteRound'){
                    $CurenRound =  'CharInfoRound'; 
                    sendMessageToAll('VoteRound', ['message' => 'Все сделали ход, переходим к следующему раунду']);
                    sendMessageToAll('isRound', ['round' => $CurenRound   ?? null,  ]);
                }
                startRound();
            }
        else{
            $currentPlayerId = getNextPlayerId($currentPlayerId); 
            if (isset($clients[$currentPlayerId])) {
                sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
            }
            sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
        }
    break;

    case 'PlacinData':
        echo "Получено сообщение от " . $connection->getRemoteAddress() . ":\n";

        if ($clientInfo  === null && json_last_error() !== JSON_ERROR_NONE) {
            echo "Ошибка декодирования JSON: " . json_last_error_msg() . "\n";
            $connection->send("Ошибка: Некорректный JSON формат");
            return;
        }

        global $currentPlayerId;
        if ($connection->userId !== $currentPlayerId) {
            sendMessage($connection, 'error', ['message' => 'Сейчас не ваш ход!']);
            return;
        }

        global $clients, $CurenRound,  $playersMadeMove,  $nominatedPlayers;

        if (isset($clientInfo['type']) && $clientInfo['type'] === 'PlacinData') {
            echo "  Тип: PlacinData\n";
            echo "  Выдвинутый игрок на голосование: " . (isset($clientInfo['userId']) ? $clientInfo['userId'] : 'Не указано') . "\n";
            $userId = $clientInfo['userId'] ?? null;
            if (!isset($nominatedPlayers)) {
                $nominatedPlayers = [];
            }
            if (!in_array($userId, $nominatedPlayers, true)) { 
                addUniqueValue($nominatedPlayers, $userId);
            }
           
            $playersMadeMove++;

            if (allPlayersMadeMove()) {
                $playersMadeMove = 0; 
                $activePlayerIds = array_keys($clients);
                if (!empty($activePlayerIds)) {
                    $currentPlayerId = $activePlayerIds[0];
                } else {
                    $currentPlayerId = null; 
                    error_log(date('Y-m-d H:i:s') . " [CRITICAL] Все игроки отключились во время перехода к новой фазе!");
                }

                $mess = 'кол - во ходов = кол во клиентов!';
                $dataToSend = [
                    'nominatedPlayers' => $nominatedPlayers ?? null, 
                    'mess' => $mess
                ];

                echo "  Отправка PlacinUserList всем \n";
                sendMessageToAll('PlacinUserList', $dataToSend);
                $CurenRound = 'VoteRound';
                sendMessageToAll('isRound', ['round' => $CurenRound ?? null,  ]);
                $nominatedPlayers = [];
                startRound();
            }
             else{
                $currentPlayerId = getNextPlayerId($currentPlayerId); 

                sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
                if (isset($clients[$currentPlayerId])) {
                    sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
                }
                sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
            }
        } else {
            echo "Неизвестный тип сообщения\n";
            echo "  Сообщение: " . $data . "\n";
            $connection->send("Ошибка: Неизвестный тип сообщения");
        }
        break;

    case 'VoteData':
        echo "Получено сообщение от " . $connection->getRemoteAddress() . ":\n";

        if ($clientInfo === null && json_last_error() !== JSON_ERROR_NONE) {
            echo "Ошибка декодирования JSON: " . json_last_error_msg() . "\n";
            $connection->send("Ошибка: Некорректный JSON формат");
            return;
        }
        if (!isset($clientInfo['userId'])) {
            echo "Ошибка: отсутствует userId в сообщении.\n";
            break; 
        }
        global $currentPlayerId;
        echo "текущий userId: ", $currentPlayerId;
        echo "текущий userId в соедении: ", $connection->userId;
        if ($connection->userId !== $currentPlayerId) {
            sendMessage($connection, 'error', ['message' => 'Сейчас не ваш ход!']);
            return;
        }

        global $clients, $CurenRound,  $playersMadeMove, $voteCounts,$leaderId; 

        $votedUserId = $clientInfo['userId']; 
        if ($votedUserId === $connection->userId) {
            sendMessage($connection, 'error', ['message' => 'Вы не можете голосовать за себя.']);
            return;
        }
        if (!isset($clients[$votedUserId])) {
            sendMessage($connection, 'error', ['message' => 'Вы пытаетесь проголосовать за несуществующего или выбывшего игрока.']);
            return;
        }
        if (isset($voteCounts[$votedUserId])) {
            $voteCounts[$votedUserId]++;
        } else {
            $voteCounts[$votedUserId] = 1;
        }

        echo "Голос за пользователя " . $votedUserId . " учтен.\n";
        echo "Текущие результаты голосования: \n";

        $playersMadeMove++;

        if (allPlayersMadeMove()) {
                $playersMadeMove = 0; 
                $activePlayerIds = array_keys($clients);
                if (!empty($activePlayerIds)) {
                    $currentPlayerId = $activePlayerIds[0];
                } else {
                    $currentPlayerId = null; 
                    error_log(date('Y-m-d H:i:s') . " [CRITICAL] Все игроки отключились во время перехода к новой фазе!");
                }
                $eliminatedPlayerId = getEliminatedPlayerId($voteCounts);
                if ($eliminatedPlayerId !== null) {

                    $eliminationMessage = "Игрок " . $eliminatedPlayerId . " выбывает из игры!";
                    echo $eliminationMessage . "\n";
                    sendMessageToAll('playerEliminated', ['playerId' => $eliminatedPlayerId, 'message' => $eliminationMessage]);
                    if (isset($clients[$eliminatedPlayerId])) {
                        if ($currentPlayerId === $eliminatedPlayerId) {

                            $currentPlayerId = getNextPlayerId($eliminatedPlayerId); 
                            if (isset($clients[$currentPlayerId])) {
                                sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
                            }
                            sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
                        }
                        unset($clients[$eliminatedPlayerId]);
                        echo "Игрок " . $eliminatedPlayerId . " удален из массива \$clients.\n";  
                        if (isset($leaderId) && $leaderId === $eliminatedPlayerId) {
                            $newLeaderId = getNextPlayerId($eliminatedPlayerId); 
                            $leaderId = $newLeaderId;
                            if (isset($clients[$newLeaderId])) {
                                $message = 'Вы стали новым ведущим раунда!';
                                sendMessage($clients[$newLeaderId], 'roleAssignment', ['role' => 'leader', 'message' => $message]);
                            }
        
                            sendMessageToAll('leaderChange', ['newLeaderId' => $newLeaderId, 'message' => "Игрок {$newLeaderId} назначен новым ведущим."]);
        
                            echo "Ведущий {$eliminatedPlayerId} выбыл. Новый ведущий: {$newLeaderId}.\n";
                        }
                    if (count($clients) === 2) {
                        $remainingPlayerIds = array_keys($clients);
            
                        $resultMessage = "Игра завершена! В бункер попадают игроки: " . implode(" и ", $remainingPlayerIds) . ".";
                        $CurenRound = 'EndGame';
                        sendMessageToAll('isRound', ['round' => $CurenRound ?? null,  ]);
                        sendMessageToAll('GameResult', [
                            'remainingPlayers' => $remainingPlayerIds, 
                            'message' => $resultMessage
                        ]);
                        return; 
                    }
                }
                } else {
                    echo "Нет игроков на выбывание (нет голосов или ничья).\n";
                }
                sendMessageToAll('totalVote', ['voteResults' => $voteCounts ?? null, 'mess' => 'Голосование завершено.']);

                $CurenRound = 'CharInfoRound';
                sendMessageToAll('isRound', ['round' => $CurenRound ?? null,  ]);

                $voteCounts = []; 
                startRound();
            }
        else{
            $currentPlayerId = getNextPlayerId($currentPlayerId); 
            if (isset($clients[$currentPlayerId])) {
                sendMessage($clients[$currentPlayerId], 'yourTurn', ['message' => 'Ваш ход!']);
            }
            sendMessageToAll('newTurn', ['currentPlayerId' => $currentPlayerId]);
        }
    break;

    default:
    }

   
};

$ws_worker->onClose = function(TcpConnection $connection) use (&$clients) {
    echo "Соединение закрыто: " . $connection->getRemoteAddress() . "n";
    $userId = isset($connection->userId) ? $connection->userId : null;
    global $userCount, $round, $Roomsize;
    $userCount--;
    echo "UserCount уменьшен до: " . $userCount . "\n"; 

    if ($userId !== null) {
        unset($clients[$userId]);
        $userLeftMessage = json_encode(['type' => 'userLeft', 'userId' => $userId, 'round' => $round]);
        foreach ($clients as $otherUserId => $otherConnection) {
            $otherConnection->send($userLeftMessage);
        }
    }

};

function getUsernameFromConnection(TcpConnection $connection) {
    return isset($connection->username) ? $connection->username : "UnknownUser";
}

//запуск сервера по команде в теримнале: php wedSoketsServer.php start
Worker::runAll();
