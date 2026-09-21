<?php

header("Access-Control-Allow-Origin: http://localhost:5173/");

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


include 'connect.php';

ini_set('session.cookie_path', '/');
ini_set('session.cookie_domain', 'localhost'); 
ini_set('session.cookie_httponly', 1);

session_start();
function dbCherError($query){
      
    $errInfo= $query -> errorInfo();

    if($errInfo[0] !== PDO::ERR_NONE){
        echo $errInfo[2];
        die();
    }
}
function selectAl($table){
    global $pdo;

    $sql = "SELECT * FROM $table";
    $query = $pdo -> prepare($sql);
    $query -> execute();

    dbCherError($query);

    return $query ->fetchAll();

}

function selectOne($table, $params = []){
     global $pdo;
    $sql = "SELECT * FROM $table";

    if (!empty($params)) {
        $sql .= " WHERE ";
        $conditions = [];
        foreach ($params as $key => $value) {
            $conditions[] = "$key = :$key";
        }
        $sql .= implode(" AND ", $conditions);
    }

    $query = $pdo->prepare($sql);
    $query->execute($params); 
    
    dbCherError($query);
    return $query->fetch();
}
function insert($table, $params){
    global $pdo;

    $cols = [];
    $placeholders = [];
    $binds = [];
    
    foreach ($params as $key => $value) {
        $cols[] = $key;
        $placeholders[] = ":$key"; 
        $binds[":$key"] = $value;
    }

    $colString = implode(", ", $cols);
    $placeholderString = implode(", ", $placeholders);
    
    $sql = "INSERT INTO $table ($colString) VALUES ($placeholderString)";

    $query = $pdo->prepare($sql);
    $query->execute($binds); 
    dbCherError($query);

    return $pdo -> lastInsertId();
}
function update($table, $params, $id) {
    global $pdo;

    $sets = [];
    $binds = [];

    foreach ($params as $key => $value) {
        $sets[] = "$key = :$key";
        $binds[":$key"] = $value;
    }

    $setString = implode(", ", $sets);
    
    $sql = "UPDATE $table SET $setString WHERE id = :id";
    $binds[":id"] = $id;

    $query = $pdo->prepare($sql);
    $query->execute($binds);
    dbCherError($query);

    return $query->rowCount(); 
}
function checkFriendship($userId1, $userId2, $status = 'accepted') {
    global $pdo;

    $sql = "SELECT COUNT(*) FROM friends 
            WHERE (user_id = :userId1 AND friend_id = :userId2)
            AND status = :status";  
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2, ':status' => $status]);
    $count = $stmt->fetchColumn();

    return $count > 0;
}

function addFriendRequest($userId1, $userId2) {
    global $pdo;

    if (checkFriendship($userId1, $userId2, 'pending') || checkFriendship($userId2, $userId1, 'pending') || checkFriendship($userId1, $userId2, 'accepted') || checkFriendship($userId2, $userId1, 'accepted')) {
        return false; 
    }
    $sql = "INSERT INTO friends (user_id, friend_id, status) VALUES (:userId1, :userId2, 'pending')";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function acceptFriendRequest($userId1, $userId2) {
    global $pdo;


    if (!checkFriendship($userId2, $userId1, 'pending')) {
        error_log("acceptFriendRequest: Запрос в друзья не найден для user_id = " . $userId1 . " и friend_id = " . $userId2);
        return false; 
    }

    try {
        $sql = "UPDATE friends SET status = 'accepted' WHERE user_id = :userId2 AND friend_id = :userId1 AND status = 'pending'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':userId2' => $userId2, ':userId1' => $userId1]);

        $sql = "INSERT INTO friends (user_id, friend_id, status) VALUES (:userId1, :userId2, 'accepted')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2]);

        return true; 
    } catch (PDOException $e) {
        error_log("acceptFriendRequest: Ошибка базы данных: " . $e->getMessage());
        return false;
    }
}

function declineFriendRequest($userId1, $userId2) {
    global $pdo;
    if (!checkFriendship($userId1, $userId2, 'pending')) {
        error_log("declineFriendRequest: Запрос в друзья не найден для user_id = " . $userId1 . " и friend_id = " . $userId2);
        return false; 
    }

    $sql = "DELETE FROM friends WHERE user_id = :userId1 AND friend_id = :userId2 AND status = 'pending'";
    $stmt = $pdo->prepare($sql);

    try {
        $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2]);
        $deleted = $stmt->rowCount() > 0;

        if (!$deleted) {
            error_log("declineFriendRequest: Не удалось удалить запрос в друзья для user_id = " . $userId1 . " и friend_id = " . $userId2);
        }

        return $deleted; 
    } catch (PDOException $e) {
        error_log("declineFriendRequest: Ошибка базы данных: " . $e->getMessage());
        return false;
    }
}

function blockUser($userId1, $userId2) {
    global $pdo;
    removeFriendship($userId1, $userId2);
    $sql = "INSERT INTO friends (user_id, friend_id, status) VALUES (:userId1, :userId2, 'blocked')
            ON DUPLICATE KEY UPDATE status = 'blocked'";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}


function removeFriendship($userId1, $userId2) {
    global $pdo;

    $sql = "DELETE FROM friends WHERE (user_id = :userId1 AND friend_id = :userId2) OR (user_id = :userId2 AND friend_id = :userId1)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([':userId1' => $userId1, ':userId2' => $userId2]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function getFriends($userId) {
    global $pdo;

    $sql = "
        SELECT u.id, u.username, 
               (CASE WHEN u.last_activity > NOW() - INTERVAL 2 MINUTE THEN 1 ELSE 0 END) as online
        FROM users u
        WHERE u.id IN (
            SELECT friend_id FROM friends WHERE user_id = :user_id AND status = 'accepted'
            UNION
            SELECT user_id FROM friends WHERE friend_id = :user_id AND status = 'accepted'
        )
    ";

    try {
        $query = $pdo->prepare($sql);
        $query->execute([':user_id' => $userId]);
        $res = $query->fetchAll(PDO::FETCH_ASSOC);
        error_log("Результат SQL для ID $userId: " . count($res) . " строк");
        
        return $res;
    } catch (PDOException $e) {
        return [];
    }
}

function getPendingFriendRequests($userId) {
  global $pdo;

  $sql = "SELECT user_id FROM friends WHERE friend_id = :userId AND status = 'pending'";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':userId' => $userId]);

  $requests = $stmt->fetchAll(PDO::FETCH_COLUMN); 

  return $requests; 
}

function getUsersInfo($userIds) {
  global $pdo;
  if (!is_array($userIds) || empty($userIds)) {
    return [];
  }

  $placeholders = implode(',', array_fill(0, count($userIds), '?'));

  $sql = "SELECT id, username FROM users WHERE id IN ($placeholders)";
  $stmt = $pdo->prepare($sql);

  for ($i = 0; $i < count($userIds); $i++) {
    $stmt->bindValue($i + 1, $userIds[$i], PDO::PARAM_INT);
  }

  $stmt->execute();
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function deleteFriendship($user_id, $friend_id) {
    global $pdo;
    
    $sql = "DELETE FROM friends 
            WHERE (user_id = :u_id AND friend_id = :f_id) 
               OR (user_id = :f_id AND friend_id = :u_id)";
               
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':u_id' => $user_id, 
        ':f_id' => $friend_id
    ]);
    
    return $stmt->rowCount() > 0;
}

?>


