<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
include(__DIR__ . '/../db/db.php');

if ($_SERVER["REQUEST_METHOD"] == "GET") {
  $user_id = $_SESSION['id']; 
  $user_id = intval($user_id);

  try {
    $friendRequests = getPendingFriendRequests($user_id);
    if (empty($friendRequests)) {
      echo json_encode([]);
      exit;
    }

    $users = getUsersInfo($friendRequests);

    echo json_encode($users);

  } catch (PDOException $e) {
    http_response_code(500); 
    echo json_encode(["message" => "Ошибка сервера: " . $e->getMessage()]); 
  }

} else {
  http_response_code(400); 
  echo json_encode(["message" => "Неверный запрос"]); 
}
?>