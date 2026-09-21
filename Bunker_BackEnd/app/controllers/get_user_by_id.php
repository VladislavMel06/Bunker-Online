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
$input = json_decode(file_get_contents('php://input'), true);
$userIds = isset($input['userIds']) ? $input['userIds'] : [];

if (empty($userIds)) {
    echo json_encode([]);
    exit;
}

try {
    $placeholders = implode(',', array_fill(0, count($userIds), '?'));
    $query = "SELECT id, username FROM users WHERE id IN ($placeholders)";
    $stmt = $pdo->prepare($query);
    $stmt->execute($userIds);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result = [];
    foreach ($users as $user) {
        $result[$user['id']] = $user['username'];
    }

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Ошибка базы данных: " . $e->getMessage());
    echo json_encode(['error' => 'Database error']);
}
?>