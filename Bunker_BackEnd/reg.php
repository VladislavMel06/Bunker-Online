<?php
  include 'app/controllers/users.php';
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добро пожаловать в бункер</title>
    <link rel="stylesheet" href="assets/css/regStyles/regStyle.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Underdog&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Rubik+Distressed&display=swap" rel="stylesheet">
    <script src="assets/js/app.js" defer></script>
    <script src="assets/libs/rain.js" defer></script>
</head>
<body>
    <section class="layers">
        <div class="layers__container">
            <div class="layers__item layer-1" style="background-image: url(assets/img/bunker.jpg);"></div>
            <div class="layers__item layer-2">
                <div class="logo"></i><h1>Добро пожаловать в бункер!</h1></div>
                <div class="hero-content">
                        <div class="reg-cont">
                            <form class="reg-form" action="reg.php" name="reg-form" method="post">
                                <div class="form">
                                    <div class="error">
                                        <p><?=$errMsg?></p>
                                    </div> 

                                    <div class="form__group">
                                        <i class="fa-regular fa-user"></i>
                                        <input type="text" id="login" name="login" value="<?=$login?>" placeholder="Имя" required>
                                    </div>
                                    <div class="form__group">
                                        <i class="fa-regular fa-eye"></i>
                                        <input type="password" id="password" name="password" placeholder="Пароль " required>
                                    </div>
                                    <div class="form__group">
                                        <i class="fa-regular fa-eye"></i>
                                        <input type="password" id="Repeatpassword" name="Repeatpassword"  placeholder="Пароль" required>
                                    </div>
                                    <div class="reg__btn">
      	                                <button type="submit" name="btn-reg">Зарегистрироваться</button>
                                        <a class="link-login" href="login.php">Войти</a>
                                    </div>
                                </div>
                            </form>
                        </div>
                </div>
            </div>
            <div class="layers__item layer-3">
                <canvas class="rain"></canvas>
            </div>
            <div class="layers__item layer-4" style="background-image: url(assets/img/layer-6.png);"></div>
        </div>
    </section>
</body>
</html>