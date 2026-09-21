<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
include '../db/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $roomId = $_POST['room_id'] ?? '';
    $inputPassword = $_POST['password'] ?? '';
    $stmt = $pdo->prepare("SELECT password FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();

    if ($room) {

        if (password_verify($inputPassword, $room['password'])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный пароль!']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Комната не найдена']);
    }
}