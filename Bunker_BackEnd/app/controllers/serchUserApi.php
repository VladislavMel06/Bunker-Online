<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include '../db/db.php';
$searchTerm = trim($_GET['username'] ?? '');

if (mb_strlen($searchTerm) < 2) { 
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

try {
    $currentId = $_SESSION['id'] ?? 0;
    
    $sql = "SELECT id, username, online, wins, game_count FROM users 
            WHERE username LIKE :term AND id != :my_id LIMIT 5";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':term' => "%$searchTerm%", ':my_id' => $currentId]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Сбой системы поиска']);
}

?>