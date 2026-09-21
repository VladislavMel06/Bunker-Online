<?php
session_start();
include 'app/db/path.php';

unset($_SESSION['id']);
unset($_SESSION['login']);
unset($_SESSION['coast']);
unset($_SESSION['wins']);
unset($_SESSION['losses']);

header('location: ' . BASE_URL); 
?>

