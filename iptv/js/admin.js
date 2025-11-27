// iptv/js/admin.js

// Configurações da API TMDB (Chave do main.js)
const TMDB_API_KEY = '2c19bf5eb981d886122e44a78fed935d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Elementos
const searchInput = document.getElementById('admin-search-input');
const searchButton = document.getElementById('admin-search-btn');
const resultsContainer = document.getElementById('tmdb-results');
const activeContentList = document.getElementById('active-content-list');
const loadingState = document.getElementById('loading-state');
const adminStatus = document.getElementById('admin-status');

// Elementos NOVO
const suggestionResultsContainer = document.getElementById('suggestion-results');
const tabButtons = document.querySelectorAll('.tab-button');

// Variável para armazenar o ID do TMDB ativo no catálogo
let activeTmdbIds = new Set();
let currentSuggestionType = 'movie'; // Novo: Para controlar a aba ativa

// ==========================================================
// FUNÇÕES DE ADMINISTRAÇÃO (ADD/REMOVE)
// ==========================================================

// 1. Busca no catálogo local e popula 'activeTmdbIds' (e a lista de remoção)
async function fetchActiveContentIds() {
    activeContentList.innerHTML = '<div class="loading">Carregando catálogo ativo...</div>';
    try {
        // Usa o novo endpoint público para obter a lista curada
        const response = await fetch('api/content/listar_ativos.php');
        if (!response.ok) throw new Error('Falha ao buscar catálogo ativo.');
        
        const data = await response.json();
        
        activeTmdbIds.clear(); // Limpa o Set
        data.conteudo.forEach(item => {
            activeTmdbIds.add(item.tmdb_id.toString());
        });

        // Popula a seção de remoção rápida
        renderActiveContentList(data.conteudo);
        // Anexa listeners de REMOÇÃO
        attachActionButtonListeners();

    } catch (error) {
        console.error('Erro ao carregar catálogo ativo:', error);
        activeContentList.innerHTML = '<div class="error">Erro ao carregar catálogo ativo.</div>';
    }
}

// 2. Renderiza a lista de conteúdo ativo para remoção
function renderActiveContentList(contentList) {
    activeContentList.innerHTML = ''; 
    contentList.forEach(item => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card'; 
        
        const posterPath = item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/w300${item.poster_path}`
            : '';

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${item.titulo}" loading="lazy">
            <h3>${item.titulo}</h3>
            <div class="movie-info">
                <span class="rating"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span>
                <span class="year">${item.release_year || 'N/A'}</span>
            </div>
            <button class="details-button btn-remove" data-tmdb-id="${item.tmdb_id}" data-media-type="${item.media_type}">
                <i class="fas fa-trash-alt"></i> Remover
            </button>
        `;

        activeContentList.appendChild(movieCard);
    });
    if (contentList.length === 0) {
        activeContentList.innerHTML = '<div class="error">O catálogo está vazio.</div>';
    }
}

// 3. Função de busca no TMDB (para o Admin)
async function fetchTmdbSearchResults(query) {
    loadingState.style.display = 'block';
    resultsContainer.innerHTML = '';

    try {
        // Busca mista (movie e tv) no TMDB
        const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Falha ao buscar TMDB');
        const data = await response.json();

        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 15); // Limita a 15 resultados na busca Admin

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="error">Nenhum resultado encontrado no TMDB.</div>';
        }

        results.forEach(item => {
            const card = renderAdminResultCard(item);
            if(card) resultsContainer.appendChild(card);
        });

        // Anexa listeners de ADIÇÃO
        attachActionButtonListeners();

    } catch (error) {
        console.error("Erro ao buscar TMDB:", error);
        resultsContainer.innerHTML = '<div class="error">Erro ao buscar resultados no TMDB.</div>';
    } finally {
        loadingState.style.display = 'none';
    }
}

// Renderiza um card de resultado da busca TMDB (e Sugestões) para o Admin
function renderAdminResultCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card'; // ALTERADO: Usa a classe de card do site
    card.dataset.tmdbId = item.id;
    card.dataset.mediaType = item.media_type;

    // Verifica se a mídia tem poster e é filme/série
    if (!item.poster_path || (item.media_type !== 'movie' && item.media_type !== 'tv')) {
        return null;
    }

    const posterPath = `${TMDB_IMAGE_BASE_URL}/w300${item.poster_path}`;
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
    const voteAverage = item.vote_average ? item.vote_average.toFixed(1) : 'N/A'; // Obtém o rating
    
    // Verifica se já está no catálogo
    const isAdded = activeTmdbIds.has(item.id.toString()); 
    // Button class usa as classes customizadas para admin (btn-add e added) + a classe base details-button
    const buttonClass = isAdded ? 'btn-add added' : 'btn-add'; 
    const buttonText = isAdded ? '<i class="fas fa-check"></i> Adicionado' : '<i class="fas fa-plus-circle"></i> Adicionar';

    // ALTERADO: Estrutura interna para bater com o .movie-card
    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" loading="lazy">
        <h3>${title}</h3>
        <div class="movie-info">
            <span class="rating">
                <i class="fas fa-star"></i>
                ${voteAverage}
            </span>
            <span class="year">${year}</span>
        </div>
        <button class="${buttonClass} details-button" data-tmdb-id="${item.id}" data-media-type="${item.media_type}" ${isAdded ? 'disabled' : ''}>
            ${buttonText}
        </button>
    `;
    return card;
}


// NOVO: 6. Função para carregar sugestões populares do TMDB
async function fetchSuggestions(mediaType) {
    currentSuggestionType = mediaType;
    suggestionResultsContainer.innerHTML = '<div class="loading">Carregando sugestões populares...</div>';

    try {
        // Chama o novo endpoint PHP
        const response = await fetch(`api/content/listar_sugestoes.php?type=${mediaType}`);
        
        if (!response.ok) throw new Error('Falha ao buscar sugestões.');
        const data = await response.json();

        if (!data.success || data.results.length === 0) {
            suggestionResultsContainer.innerHTML = '<div class="error">Nenhuma sugestão popular encontrada.</div>';
            return;
        }

        suggestionResultsContainer.innerHTML = '';
        data.results.forEach(item => {
            const card = renderAdminResultCard(item);
            if(card) suggestionResultsContainer.appendChild(card);
        });

        // Anexa listeners de ADIÇÃO
        attachActionButtonListeners(); 

    } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        suggestionResultsContainer.innerHTML = '<div class="error">Erro ao carregar sugestões.</div>';
    }
}


// 4. Lógica de Adicionar/Remover
async function handleContentAction(tmdbId, action, mediaType) {
    const endpoint = action === 'add' ? 'api/admin/adicionar.php' : 'api/admin/remover.php';
    const formData = new FormData();
    formData.append('tmdb_id', tmdbId);
    formData.append('media_type', mediaType);
    
    // Busca o botão clicado para desabilitar
    const targetButton = document.querySelector(`.admin-main button[data-tmdb-id="${tmdbId}"]:not([disabled])`);
    if (targetButton) {
        targetButton.disabled = true;
    }

    try {
        const response = await fetch(endpoint, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.success) {
            adminStatus.textContent = data.message;
            adminStatus.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
            adminStatus.style.display = 'block';

            // Atualiza o estado e a UI após a ação
            if (action === 'add') {
                activeTmdbIds.add(tmdbId.toString());
            } else {
                activeTmdbIds.delete(tmdbId.toString());
            }
            
            // Recarrega as três áreas para atualizar o status dos botões
            await fetchActiveContentIds(); // Recarrega a lista de remoção e atualiza activeTmdbIds
            if(searchInput.value) fetchTmdbSearchResults(searchInput.value); // Recarrega busca
            fetchSuggestions(currentSuggestionType); // Recarrega sugestões
            
        } else {
            adminStatus.textContent = data.error || 'Erro desconhecido';
            adminStatus.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
            adminStatus.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de API:', error);
        adminStatus.textContent = 'Erro de conexão com o servidor';
        adminStatus.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
        adminStatus.style.display = 'block';
    } finally {
        // Não é necessário re-habilitar manualmente, pois a recarga da lista já lida com o estado.
        setTimeout(() => { adminStatus.style.display = 'none'; }, 5000);
    }
}

// 5. Anexa listeners aos botões
function attachActionButtonListeners() {
    // Seleciona todos os botões de ação em todos os containers de resultado
    document.querySelectorAll('.movie-card .btn-add, .movie-card .btn-remove').forEach(button => {
        
        // Remove listener antigo (cria um clone para substituição segura)
        const newButton = button.cloneNode(true);
        button.replaceWith(newButton);

        newButton.addEventListener('click', function() {
            const tmdbId = this.dataset.tmdbId;
            const mediaType = this.dataset.mediaType;
            
            if (this.classList.contains('btn-remove')) {
                 // Botão na lista de ATIVOS
                 handleContentAction(tmdbId, 'remove', mediaType);
            } else if (this.classList.contains('btn-add')) {
                 // Botão na busca/sugestão (só é clicável se não estiver disabled)
                 handleContentAction(tmdbId, 'add', mediaType);
            }
        });
    });
}


// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carregar a lista de IDs ativos primeiro
    // A função fetchActiveContentIds agora chama attachActionButtonListeners para a lista de remoção
    await fetchActiveContentIds();

    // 2. Listener do botão de busca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchTmdbSearchResults(query);
        } else {
            adminStatus.textContent = 'Digite um termo de busca.';
            adminStatus.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
            adminStatus.style.display = 'block';
            setTimeout(() => { adminStatus.style.display = 'none'; }, 3000);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
    
    // 3. NOVO: Listeners para as abas de sugestão
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mediaType = this.dataset.type;
            
            // Atualiza a UI das abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Carrega o conteúdo
            fetchSuggestions(mediaType);
        });
    });

    // 4. NOVO: Carrega Filmes Populares por padrão
    document.getElementById('tab-movie').click(); // Simula o clique
});