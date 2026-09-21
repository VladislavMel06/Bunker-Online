<?php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');

if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

try {
    $currentUserId = $_SESSION['id'];
    $stmt = $pdo->prepare("
        SELECT u.id, u.username 
        FROM users u
        INNER JOIN friends f ON u.id = f.friend_id
        WHERE f.user_id = ? AND f.status = 'pending'
    ");
    $stmt->execute([$currentUserId]);
    $pendingOutgoing = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pendingOutgoing ?: []);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка базы данных']);
}


?>