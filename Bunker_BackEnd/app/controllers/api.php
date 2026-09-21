<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Content-Type: application/json; charset=UTF-8");
include '../db/db.php';

if (!$pdo) {
   http_response_code(500);
   echo json_encode(['error' => 'Не удалось подключиться к БД']);
   exit;
}

if (isset($_SESSION['id'])) {
    $userId = $_SESSION['id'];
    try {
        $updateStatus = $pdo->prepare("UPDATE users SET last_activity = NOW(), online = 1 WHERE id = ?");
        $updateStatus->execute([$userId]);
        $query = "SELECT id, username, game_count, wins, online FROM users WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$_SESSION['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Ошибка базы данных: " . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]); 
    }
} else {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
}
?>