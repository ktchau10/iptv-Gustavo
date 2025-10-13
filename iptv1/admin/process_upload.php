<?php
session_start();

// Função para retornar resposta JSON
function sendJsonResponse($success, $message) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Verifica se o usuário está logado e é administrador
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    sendJsonResponse(false, 'Acesso negado. Você precisa ser um administrador para realizar esta ação.');
}

// Verifica se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Método não permitido.');
}

// Validação do ID do TMDB
$tmdb_id = filter_input(INPUT_POST, 'tmdb_id', FILTER_VALIDATE_INT);
if (!$tmdb_id) {
    sendJsonResponse(false, 'ID do TMDB inválido.');
}

// Verifica se um arquivo foi enviado
if (!isset($_FILES['video_file']) || $_FILES['video_file']['error'] !== UPLOAD_ERR_OK) {
    $error = $_FILES['video_file']['error'] ?? 'Erro desconhecido';
    sendJsonResponse(false, 'Erro no upload do arquivo: ' . $error);
}

// Validação do tipo de arquivo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $_FILES['video_file']['tmp_name']);
finfo_close($finfo);

if ($mime_type !== 'video/mp4') {
    sendJsonResponse(false, 'Tipo de arquivo inválido. Apenas arquivos MP4 são permitidos.');
}

// Prepara o diretório de destino
$upload_dir = __DIR__ . '/../../videos/';
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        sendJsonResponse(false, 'Erro ao criar diretório de upload.');
    }
}

// Gera um nome único para o arquivo
$original_filename = pathinfo($_FILES['video_file']['name'], PATHINFO_FILENAME);
$file_extension = '.mp4';
$unique_filename = hash('sha256', time() . $original_filename) . $file_extension;
$upload_path = $upload_dir . $unique_filename;
$relative_path = '/videos/' . $unique_filename;

// Move o arquivo para o diretório final
if (!move_uploaded_file($_FILES['video_file']['tmp_name'], $upload_path)) {
    sendJsonResponse(false, 'Erro ao mover o arquivo para o diretório final.');
}

// Conexão com o banco de dados
try {
    require_once __DIR__ . '/../../config/database.php';
    
    // Insere o registro na tabela filmes_locais
    $stmt = $pdo->prepare('INSERT INTO filmes_locais (tmdb_movie_id, video_path) VALUES (?, ?)');
    if (!$stmt->execute([$tmdb_id, $relative_path])) {
        // Em caso de erro no banco, remove o arquivo
        unlink($upload_path);
        sendJsonResponse(false, 'Erro ao registrar o filme no banco de dados.');
    }
    
    sendJsonResponse(true, 'Filme uploadado com sucesso!');
    
} catch (PDOException $e) {
    // Em caso de erro no banco, remove o arquivo
    unlink($upload_path);
    sendJsonResponse(false, 'Erro ao conectar com o banco de dados: ' . $e->getMessage());
}
