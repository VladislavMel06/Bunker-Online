<?php
include '../db/db.php'; 

header('Content-Type: application/json');

if (isset($_SESSION['id'])) {
    echo json_encode([
        'authorized' => true,
        'user' => [
            'id' => $_SESSION['id'],
            'login' => $_SESSION['login']
        ]
    ]);
} else {
    echo json_encode([
        'authorized' => false,
        'message' => 'Сессия не найдена'
    ]);
}
