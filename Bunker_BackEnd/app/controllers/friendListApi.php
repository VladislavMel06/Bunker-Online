<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');


if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Пользователь не авторизован']);
    exit;
}

$currentUserId = $_SESSION['id'];

try {
    $friends = getFriends($currentUserId);
    if ($friends === false) {
        throw new Exception("Ошибка при запросе к базе");
    }

    echo json_encode([
        'success' => true,
        'data' => $friends
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
}

?>