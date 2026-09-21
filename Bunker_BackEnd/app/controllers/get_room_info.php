<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); 
header('Access-Control-Allow-Credentials: true');

include(__DIR__ . '/../db/db.php');

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);
$roomId = intval($data['roomId'] ?? $_POST['roomId'] ?? $_GET['roomId'] ?? 0);

if ($roomId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Некорректный ID комнаты"]);
    exit();
}

try {
    $room = selectOne('rooms', ['id' => $roomId]);

    if ($room) {
        echo json_encode($room);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Комната не найдена']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка БД']);
}

?>