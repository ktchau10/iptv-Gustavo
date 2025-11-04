<?php
session_start();

// Verifica se o usuário está logado e é administrador
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    header('Location: ../login.html');
    exit;
}
?>
