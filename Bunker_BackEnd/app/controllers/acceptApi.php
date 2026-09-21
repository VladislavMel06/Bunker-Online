<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include(__DIR__ . '/../db/db.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $user_id = $_SESSION['id'];


  $friend_id = $_POST['friend_id'];


  $user_id = intval($user_id);
  $friend_id = intval($friend_id);

  if ($user_id <= 0 || $friend_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Неверные ID пользователей."]);
    exit;
  }

  try {
    $result = acceptFriendRequest($user_id, $friend_id);

    if ($result) {
      echo json_encode([
        "success" => true, 
        "message" => "Запрос в друзья успешно принят."
      ]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Ошибка при принятии запроса."]);
    }

  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Ошибка сервера: " . $e->getMessage()]);
  }

} else {
  http_response_code(400);
  echo json_encode(["message" => "Неверный запрос."]);
}
?>