<?
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db/db.php');


if (!isset($_SESSION['id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Пользователь не авторизован"]);
    exit;
}

$currentUserId = $_SESSION['id'];
$friendUsername = $_POST['friend_username'] ?? null;

if (!$friendUsername) {
    echo json_encode(["message" => "Введите имя пользователя"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$friendUsername]);
    $friend = $stmt->fetch();

    if (!$friend) {
        echo json_encode(["status" => "error", "message" => "Пользователь не найден"]);
        exit;
    }

    $friendId = $friend['id'];

    if ($friendId == $currentUserId) {
        echo json_encode(["status" => "error", "message" => "Нельзя добавить самого себя"]);
        exit;
    }
    $result = addFriendRequest($currentUserId, $friendId);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Запрос успешно отправлен"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Запрос уже существует или вы в черном списке"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Ошибка базы данных"]);
}

?>