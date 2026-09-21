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
if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
    exit;
}
$input = json_decode(file_get_contents('php://input'), true);
$roomId = isset($input['room_id']) ? (int)$input['room_id'] : null;

if (!$roomId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Room ID is required']);
    exit;
}

try {
    $checkStmt = $pdo->prepare("SELECT id, current_players, max_players FROM rooms WHERE id = ?");
    $checkStmt->execute([$roomId]);
    $room = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Room not found']);
        exit;
    }
    
    $updateStmt = $pdo->prepare("UPDATE rooms SET current_players = GREATEST(current_players - 1, 0) WHERE id = ?");
    $updateStmt->execute([$roomId]);
    $countStmt = $pdo->prepare("SELECT current_players FROM rooms WHERE id = ?");
    $countStmt->execute([$roomId]);
    $newCount = $countStmt->fetch(PDO::FETCH_ASSOC);
    if ($newCount && $newCount['current_players'] < $room['max_players']) {
        $statusStmt = $pdo->prepare("UPDATE rooms SET status = 'waiting' WHERE id = ?");
        $statusStmt->execute([$roomId]);
    }
    
    echo json_encode([
        'status' => 'success', 
        'message' => 'Successfully left the room',
        'room_id' => $roomId,
        'current_players' => $newCount ? $newCount['current_players'] : 0
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Ошибка базы данных: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>