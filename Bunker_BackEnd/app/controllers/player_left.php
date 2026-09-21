<?php
define('ROOT_PATH', __DIR__ . '/../..'); 
include(ROOT_PATH . '/app/db/db.php');   
include(ROOT_PATH . '/app/db/path.php');

header('Content-Type: application/json');


$input = file_get_contents('php://input');
$data = json_decode($input, true);

$roomId = $data['roomId'] ?? null;
$playerId = $data['userId'] ?? null; 

error_log("leaveRoom.php: Request received for roomId=" . $roomId . ", playerId=" . $playerId);


if (!is_numeric($roomId) || $roomId <= 0) {
    error_log("leaveRoom.php: Invalid room ID provided: " . $roomId);
    echo json_encode(['success' => false, 'message' => 'Invalid room ID.']);
    exit();
}
if (!is_numeric($playerId) || $playerId <= 0) { 
    error_log("leaveRoom.php: Invalid player ID provided: " . $playerId);
    echo json_encode(['success' => false, 'message' => 'Invalid player ID.']);
    exit();
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("DELETE FROM players_in_rooms WHERE room_id = :roomId AND player_id = :playerId");
    $stmt->bindParam(':roomId', $roomId, PDO::PARAM_INT);
    $stmt->bindParam(':playerId', $playerId, PDO::PARAM_INT);
    $stmt->execute();

    $rowsAffectedInParticipants = $stmt->rowCount();
    error_log("leaveRoom.php: DELETE FROM players_in_rooms rowCount = " . $rowsAffectedInParticipants);

    if ($rowsAffectedInParticipants > 0) {
        $stmt = $pdo->prepare("UPDATE rooms SET current_players = current_players - 1 WHERE id = :roomId AND current_players > 0"); // <-- Исправлен оператор => на >
        $stmt->bindParam(':roomId', $roomId, PDO::PARAM_INT);
        $stmt->execute();

        $rowsAffectedInRooms = $stmt->rowCount();
        error_log("leaveRoom.php: UPDATE rooms rowCount = " . $rowsAffectedInRooms);

        if ($rowsAffectedInRooms > 0) {
             $pdo->commit(); 
             echo json_encode(['success' => true, 'message' => 'Player ' . $playerId . ' left room ' . $roomId . ' successfully.']);
        } else {
            $pdo->rollBack(); 
            error_log("leaveRoom.php: Room with ID " . $roomId . " not found or current_players already 0. Rolling back.");
            echo json_encode(['success' => false, 'message' => 'Room with ID ' . $roomId . ' not found or player count already at zero.']);
        }
    } else {
        $pdo->commit(); 
        error_log("leaveRoom.php: Player " . $playerId . " was not found in room " . $roomId . ". Nothing to delete.");
        echo json_encode(['success' => true, 'message' => 'Player ' . $playerId . ' was not in room ' . $roomId . '.']);
    }

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Database error in leaveRoom.php: " . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => "Database error: " . $e->getMessage()]);
}