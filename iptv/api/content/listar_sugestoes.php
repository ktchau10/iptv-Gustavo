<?php
// iptv/api/content/listar_sugestoes.php
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../utils/functions.php';
require_once __DIR__ . '/../../database/config.php';

// Protegido: Apenas administradores podem acessar
requireAdmin();

// Configurações da API TMDB
$TMDB_API_KEY = '2c19bf5eb981d886122e44a78fed935d';
$TMDB_BASE_URL = 'https://api.themoviedb.org/3';
$LANGUAGE = 'pt-BR';

// Recebe o tipo de mídia via GET
$mediaType = sanitizeInput($_GET['type'] ?? '');

if (!in_array($mediaType, ['movie', 'tv'])) {
    jsonResponse(['error' => 'Tipo de mídia inválido'], 400);
}

try {
    // URL para buscar o conteúdo popular (até 20 resultados por página)
    $url = "$TMDB_BASE_URL/$mediaType/popular?api_key=$TMDB_API_KEY&language=$LANGUAGE&page=1";
    
    // Consulta a API do TMDB
    $tmdbResponse = @file_get_contents($url);
    
    if ($tmdbResponse === FALSE) {
        throw new Exception("Falha ao buscar sugestões na API TMDB.");
    }

    $data = json_decode($tmdbResponse, true);

    // Adiciona a tag 'media_type' a cada resultado e renomeia 'name' para 'title' se for série
    $results = array_map(function($item) use ($mediaType) {
        if ($mediaType === 'tv' && isset($item['name'])) {
            $item['title'] = $item['name'];
        }
        $item['media_type'] = $mediaType;
        return $item;
    }, $data['results'] ?? []);
    
    // Filtra por itens com poster
    $filteredResults = array_filter($results, function($item) {
        return !empty($item['poster_path']);
    });
    
    jsonResponse([
        'success' => true,
        'results' => array_values($filteredResults) // Reindexa o array
    ]);

} catch (Exception $e) {
    error_log("Erro ao buscar sugestões: " . $e->getMessage());
    jsonResponse(['error' => 'Erro interno ao buscar sugestões'], 500);
}