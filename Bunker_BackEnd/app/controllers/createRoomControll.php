<?php 
  
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');


if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Пользователь не авторизован']);
    exit;
}

$errMsg = '';
$resultData = [];


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $roomName = trim(htmlspecialchars($_POST['nameRoom'] ?? ''));
    $playerCount = trim(htmlspecialchars($_POST['playerCount'] ?? ''));
    $difficulty = trim(htmlspecialchars($_POST['difficulty'] ?? 'normal'));
    $rawPassword = $_POST['password'] ?? ''; 
    $password = !empty($rawPassword) ? password_hash($rawPassword, PASSWORD_BCRYPT) : null;

    $nameLen = mb_strlen($roomName);
    if ($nameLen < 3 || $nameLen > 9) {
        $errMsg .= "Имя комнаты должно быть от 3 до 9 символов. ";
    }

    $playerCountInt = intval($playerCount);
    if ($playerCountInt < 2 || $playerCountInt > 12) {
        $errMsg .= "Количество игроков должно быть от 2 до 12. ";
    }

    $validDifficulties = ['easy', 'normal', 'hard'];
    if (!in_array($difficulty, $validDifficulties)) {
        $difficulty = 'normal';
    }

    if (empty($errMsg)) {
        try {
            $paramsCheck = ['name' => $roomName];
            $existingRoom = selectOne('rooms', $paramsCheck);

            if ($existingRoom) {
                http_response_code(409); 
                echo json_encode([
                    'success' => false, 
                    'message' => 'Комната с таким названием уже существует!'
                ]);
                exit;
            }
            
            $params = [
                'name' => $roomName,
                'max_players' => $playerCountInt,
                'difficulty' => $difficulty,
                'password' => $password,
                'current_players' => 1, 
                'status' => 'waiting'
            ];

            $last_id = insert('rooms', $params);

            if ($last_id) {
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Лобби успешно создано!',
                    'room_id' => $last_id,
                    'max_players' => $playerCountInt 
                ]);
            } else {
                throw new Exception("Не удалось получить ID новой комнаты");
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Ошибка базы данных: ' . $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => trim($errMsg)
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
}

?>

