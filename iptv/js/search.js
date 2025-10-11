// TMDB API Configuration
const TMDB_API_KEY = '2c19bf5eb981d886122e44a78fed935d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || '';
}

async function fetchSearchResults(query) {
    const moviesCarousel = document.getElementById('search-movies-carousel');
    moviesCarousel.innerHTML = '<div class="loading">Buscando...</div>';
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`
        );
        if (!response.ok) throw new Error('Falha na busca');
        const data = await response.json();
        moviesCarousel.innerHTML = '';
        if (!data.results.length) {
            moviesCarousel.innerHTML = '<div class="error">Nenhum filme encontrado.</div>';
            return;
        }
        data.results.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.dataset.movieId = movie.id;
            const posterPath = movie.poster_path
                ? `${TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`
                : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=450';
            movieCard.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}" loading="lazy">
                <h3>${movie.title}</h3>
                <div class="movie-info">
                    <span class="rating">
                        <i class="fas fa-star"></i>
                        ${movie.vote_average.toFixed(1)}
                    </span>
                    <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
                </div>
                <button class="details-button" data-movie-id="${movie.id}">Ver detalhes</button>
            `;
            moviesCarousel.appendChild(movieCard);
        });
        attachDetailsButtonListeners();
    } catch (error) {
        moviesCarousel.innerHTML = '<div class="error">Erro ao buscar filmes.</div>';
    }
}

function attachDetailsButtonListeners() {
    const detailButtons = document.querySelectorAll('.movies-carousel .details-button');
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const movieCard = this.closest('.movie-card');
            const movieId = movieCard.dataset.movieId;
            if (movieId) {
                window.location.href = `movie-details.html?id=${movieId}`;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const query = getQueryParam('q');
    if (query) {
        fetchSearchResults(query);
    } else {
        document.getElementById('search-movies-carousel').innerHTML = '<div class="error">Nenhum termo de busca informado.</div>';
    }
});
