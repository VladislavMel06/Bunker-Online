<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $friend_id = intval($_POST["friend_id"] ?? 0);
    $user_id = intval($_SESSION['id'] ?? 0);

    if ($user_id === 0 || $friend_id === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Сессия истекла"]);
        exit;
    }
    if (declineFriendRequest($user_id, $friend_id)) {
        echo json_encode([
            "success" => true, 
            "message" => "Запрос успешно отозван"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Не удалось отозвать запрос или он уже принят"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Метод не поддерживается"]);
}
?>