// iptv/js/main.js

const TMDB_API_KEY = '2c19bf5eb981d886122e44a78fed935d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            menu.classList.remove('active');
        }
    });
});

// Função genérica para criar card (reutilizada e corrigida para usar dados curados)
function createMediaCard(item, mediaType) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    // O id e o tipo vêm do catálogo curado
    movieCard.dataset.movieId = item.tmdb_id;
    movieCard.dataset.mediaType = mediaType; 

    const posterPath = item.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/w300${item.poster_path}`
        : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450';

    const title = item.titulo;
    const year = item.release_year || 'N/A';
    const voteAverage = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    movieCard.innerHTML = `
        <img src="${posterPath}" alt="${title}" loading="lazy">
        <h3>${title}</h3>
        <div class="movie-info">
            <span class="rating">
                <i class="fas fa-star"></i>
                ${voteAverage}
            </span>
            <span class="year">${year}</span>
        </div>
        <button class="details-button">Ver detalhes</button>
    `;
    return movieCard;
}


// NOVO: Função para carregar o catálogo curado e separar em Filmes e Séries
async function loadFeaturedContent() {
    const moviesCarousel = document.querySelector('#featured .movies-carousel');
    const tvCarousel = document.getElementById('tv-carousel'); 
    
    if (!moviesCarousel || !tvCarousel) return; // Garante que os elementos existem

    moviesCarousel.innerHTML = '<div class="loading">Carregando...</div>';
    tvCarousel.innerHTML = '<div class="loading">Carregando...</div>';

    try {
        // 1. Busca o conteúdo ativo da base de dados local
        const response = await fetch('api/content/listar_ativos.php');
        if (!response.ok) throw new Error('Falha ao carregar o catálogo ativo.');

        const data = await response.json();
        
        moviesCarousel.innerHTML = ''; // Limpa o loading
        tvCarousel.innerHTML = ''; 

        if (!data.success || data.conteudo.length === 0) {
            moviesCarousel.innerHTML = '<div class="error">Nenhum conteúdo em destaque.</div>';
            tvCarousel.innerHTML = '';
            return;
        }

        let hasMovies = false;
        let hasTv = false;
        
        // Ordena por título alfabeticamente para a exibição em destaque
        const sortedContent = data.conteudo.sort((a, b) => a.titulo.localeCompare(b.titulo));

        // 2. Filtra e exibe o conteúdo
        sortedContent.forEach(item => {
            const mediaType = item.media_type;
            const mediaCard = createMediaCard(item, mediaType);

            if (mediaType === 'movie') {
                moviesCarousel.appendChild(mediaCard);
                hasMovies = true;
            } else if (mediaType === 'tv') {
                tvCarousel.appendChild(mediaCard);
                hasTv = true;
            }
        });

        if (!hasMovies) {
             moviesCarousel.innerHTML = '<div class="error">Nenhum filme em destaque.</div>';
        }
        if (!hasTv) {
             tvCarousel.innerHTML = '<div class="error">Nenhuma série em destaque.</div>';
        }

        attachDetailsButtonListeners(); 

    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        moviesCarousel.innerHTML = '<div class="error">Erro ao carregar o catálogo.</div>';
        tvCarousel.innerHTML = '';
    }
}

// Implement details button functionality (Mantida, mas adaptada para o novo card)
function attachDetailsButtonListeners() {
    // Seleciona todos os botões de detalhes em AMBOS os carrosséis
    const detailButtons = document.querySelectorAll('.movies-carousel .details-button');
    
    detailButtons.forEach(button => {
        // Remove listener antigo para evitar duplicação e re-seleciona
        button.replaceWith(button.cloneNode(true));
    });

    document.querySelectorAll('.movies-carousel .details-button').forEach(button => {
        button.addEventListener('click', function() {
            const movieCard = this.closest('.movie-card');
            const movieId = movieCard.dataset.movieId;
            const mediaType = movieCard.dataset.mediaType; 
            
            if (movieId && mediaType) {
                // Constrói o link com o tipo
                window.location.href = `movie-details.html?id=${movieId}&type=${mediaType}`;
            }
        });
    });
}

// Inicialização: Chama a função principal de carregamento
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedContent();
});