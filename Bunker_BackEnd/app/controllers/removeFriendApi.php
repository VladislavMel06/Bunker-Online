<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $currentUserId = intval($_SESSION['id'] ?? 0);
    $friendId = intval($_POST['friend_id'] ?? 0);

    if ($currentUserId === 0 || $friendId === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "ОШИБКА ИДЕНТИФИКАЦИИ"]);
        exit;
    }

    try {
        if (deleteFriendship($currentUserId, $friendId)) {
            echo json_encode([
                "success" => true, 
                "message" => "СВЯЗЬ ПРЕРВАНА УСПЕШНО"
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "ОБЪЕКТ НЕ НАЙДЕН В БАЗЕ"
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "ОШИБКА БАЗЫ ДАННЫХ"]);
    }
}
?>
