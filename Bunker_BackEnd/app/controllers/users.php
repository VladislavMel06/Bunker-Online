<?php 
include 'app/db/db.php';
include 'app/db/path.php';

$errMsg='';
if($_SERVER ['REQUEST_METHOD'] === 'POST' && isset($_POST['btn-reg'])){
  $login = htmlspecialchars(trim($_POST['login']));
  $pass = trim($_POST['password']);
  $RepPass = trim($_POST['Repeatpassword']);
  if($login === '' || $pass === '' || $RepPass === '') {

    $errMsg = 'Не все поля заполнены!';

  } elseif($pass !== $RepPass)
  {

    $errMsg = 'Пароли не совпадают!';

  }
  else
  {
    $ext = selectOne('users', ['username' => $login]);

        if (is_array($ext) && !empty($ext)) 
        {  
            if ($ext['username'] === $login) 
            {
              $errMsg = 'Данный логин уже занят!';
            } else 
            {
              $passToDB = password_hash($_POST['password'], PASSWORD_DEFAULT);

              $post = [
                'username' => $login,
                'password' => $passToDB,
              ];

              $id = insert('users', $post);

              $errMsg = "Пользователь " . $login . " успешно зарегитсрован!";

            }
        } else 
        {
          $passToDB = password_hash($_POST['password'], PASSWORD_DEFAULT);

          $post = [
            'username' => $login,
            'password' => $passToDB,
            'game_count' => 0,
            'wins' => 0,
            'online' => 1
          ];

          $id = insert('users', $post);
          $user = selectOne('users', ['id' => $id]); 	

          $_SESSION['id'] = $user['id'];
          $_SESSION['login'] = $user['username'];
          $_SESSION['game_count'] = $user['game_count'] ?? 0;
          $_SESSION['wins'] = $user['wins'];
          $_SESSION['online'] = $user['online'] ?? 1;
          header('location: ' . BASE_URL); 
        }
      }

} else 
{
  $login = '';
}

if($_SERVER ['REQUEST_METHOD'] === 'POST' && isset($_POST['login-btn'])){

  $login = htmlspecialchars(trim($_POST['login']));
  $pass = trim($_POST['password']);
 

  if($login === '' || $pass === ''){
    $errMsg = 'Не все поля заполнены!';
  }else
  {
    $ext = selectOne('users', ['username' => $login]);

    if($ext  && password_verify($pass, $ext['password']))
    {
      $user = selectOne('users', ['username' => $login]);
      $_SESSION['id'] = $user['id'];
      $_SESSION['login'] = $user['username'];
      $_SESSION['game_count'] = $user['game_count'] ?? 0;
      $_SESSION['wins'] = $user['wins'];
      $_SESSION['online'] = $user['online'] ?? 1;
      header('location: ' . BASE_URL); 

    }else{
      $errMsg = 'Не верный логин или пароль!';
    }
  }
}else
{
  $login = '';
}

?>

