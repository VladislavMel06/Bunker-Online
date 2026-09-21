<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Content-Type: application/json; charset=UTF-8");
include '../db/db.php';

try{
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {

    $sql = "SELECT id, name, max_players, difficulty, current_players, status, created_at, 
            (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as hasPassword 
            FROM `rooms` 
            ORDER BY created_at DESC";
            
    $stmt = $pdo->query($sql);
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rooms as &$room) {
        $room['hasPassword'] = (bool)$room['hasPassword'];
    }

    echo json_encode([
        'success' => true,
        'data' => $rooms,
        'count' => count($rooms)
    ]);
    }else{
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Метод не поддерживается'
        ]);
    }
}catch (PDOException $e){
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Внутренняя ошибка сервера',
        'error' => $e->getMessage()
    ]);
}

?>