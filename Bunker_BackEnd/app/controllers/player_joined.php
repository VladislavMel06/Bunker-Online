<?php
define('ROOT_PATH', __DIR__ . '/../..');
include(ROOT_PATH . '/app/db/db.php');   
include(ROOT_PATH . '/app/db/path.php');
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$roomId = $data['roomId'] ?? null;
$playerId = $data['userId'] ?? null; 

if (!is_numeric($roomId) || $roomId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid room ID.']);
    exit();
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT IGNORE INTO players_in_rooms (room_id, player_id, created_at) VALUES (:roomId, :playerId, NOW())");
    $stmt->bindParam(':roomId', $roomId, PDO::PARAM_INT);
    $stmt->bindParam(':playerId', $playerId, PDO::PARAM_INT);
    $stmt->execute();
    $rowsAffectedInParticipants = $stmt->rowCount();

    if ($rowsAffectedInParticipants > 0) {
        $stmt = $pdo->prepare("UPDATE rooms SET current_players = current_players + 1 WHERE id = :roomId");
        $stmt->bindParam(':roomId', $roomId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Player ' . $playerId . ' joined room ' . $roomId . ' successfully.']);
        } else {
            $pdo->rollBack(); 
            echo json_encode(['success' => false, 'message' => 'Room with ID ' . $roomId . ' not found.']);
        }
    } else {
        $pdo->commit(); 
        echo json_encode(['success' => true, 'message' => 'Player ' . $playerId . ' is already in room ' . $roomId . '.']);
    }
    

} catch (PDOException $e) {
    $pdo->rollBack(); 
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}


