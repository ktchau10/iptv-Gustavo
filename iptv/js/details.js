// TMDB API Configuration (mantendo consistência com main.js)
const TMDB_API_KEY = '2c19bf5eb981d886122e44a78fed935d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Elements
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const movieInfo = document.getElementById('movie-info');
const trailerContainer = document.getElementById('trailer-container');

// Get movie ID from URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Format runtime to hours and minutes
function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
}

// Format date to Brazilian format
function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Fetch movie details
async function fetchMovieDetails(movieId) {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
    );

    if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do filme');
    }

    return response.json();
}

// Fetch movie videos (trailers)
async function fetchMovieVideos(movieId) {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
        throw new Error('Falha ao carregar vídeos do filme');
    }

    const data = await response.json();
    
    // Find the first YouTube trailer
    return data.results.find(
        video => video.site === 'YouTube' && 
        video.type === 'Trailer'
    );
}

// Fetch movie credits (cast)
async function fetchMovieCredits(movieId) {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
    );

    if (!response.ok) {
        throw new Error('Falha ao carregar elenco do filme');
    }

    return response.json();
}

// Render movie details
function renderMovieDetails(movie, trailer, credits) {
    // Set backdrop
    const backdropPath = movie.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3';
    
    document.getElementById('backdrop-image').style.backgroundImage = `url('${backdropPath}')`;

    // Set poster
    const posterPath = movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3';
    
    document.getElementById('poster-container').innerHTML = `
        <img src="${posterPath}" alt="${movie.title}">
    `;

    // Set basic info
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('release-year').innerHTML = `
        <i class="far fa-calendar"></i>
        ${formatDate(movie.release_date)}
    `;
    document.getElementById('runtime').innerHTML = `
        <i class="far fa-clock"></i>
        ${formatRuntime(movie.runtime)}
    `;
    document.getElementById('rating').innerHTML = `
        <i class="fas fa-star"></i>
        ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
    `;

    // Set genres
    document.getElementById('genres').innerHTML = movie.genres
        .map(genre => `<span class="genre-tag">${genre.name}</span>`)
        .join('');

    // Set overview
    document.getElementById('overview').textContent = movie.overview;

    // Set trailer if available
    if (trailer) {
        trailerContainer.style.display = 'block';
        trailerContainer.querySelector('.trailer-wrapper').innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${trailer.key}"
                title="Trailer de ${movie.title}"
                allowfullscreen>
            </iframe>
        `;
    }

    // Set cast
    if (credits && credits.cast) {
        const castList = document.getElementById('cast-list');
        castList.innerHTML = credits.cast
            .slice(0, 8) // Limit to 8 cast members
            .map(actor => {
                const profilePath = actor.profile_path
                    ? `${TMDB_IMAGE_BASE_URL}/w185${actor.profile_path}`
                    : 'https://images.unsplash.com/photo-1535704882196-765e5fc62a53?ixlib=rb-4.0.3&auto=format&fit=crop&w=185&h=278';
                
                return `
                    <div class="cast-card">
                        <img src="${profilePath}" alt="${actor.name}" class="cast-image">
                        <div class="cast-info">
                            <h3>${actor.name}</h3>
                            <p>${actor.character}</p>
                        </div>
                    </div>
                `;
            })
            .join('');
    }
}

// Adicionar aos Favoritos
function initializeFavoriteButton() {
    const favoriteBtn = document.getElementById('add-favorite-btn');
    favoriteBtn.addEventListener('click', function() {
        // Obter dados do filme exibido
        const movieId = getMovieIdFromUrl();
        const titulo = document.getElementById('movie-title').textContent;
        const ano = document.getElementById('release-year').textContent;
        const nota = document.getElementById('rating').textContent;
        const posterImg = document.querySelector('#poster-container img');
        const poster = posterImg ? posterImg.src : '';
        // Evitar duplicidade
        let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        if (favoritos.some(filme => filme.id == movieId)) {
            favoriteBtn.textContent = 'Já está nos Favoritos';
            favoriteBtn.classList.add('favorited');
            return;
        }
        favoritos.push({ id: movieId, titulo, ano, nota, poster });
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        favoriteBtn.textContent = 'Adicionado aos Favoritos!';
        favoriteBtn.classList.add('favorited');
    });
}

// Main function to initialize the page
async function initializeMovieDetails() {
    const movieId = getMovieIdFromUrl();

    if (!movieId) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorState.textContent = 'ID do filme não encontrado na URL.';
        return;
    }

    // Show loading state
    loadingState.style.display = 'block';
    movieInfo.style.display = 'none';
    errorState.style.display = 'none';

    try {
        // Fetch all data in parallel
        const [movie, trailer, credits] = await Promise.all([
            fetchMovieDetails(movieId),
            fetchMovieVideos(movieId),
            fetchMovieCredits(movieId)
        ]);

        // Render everything
        renderMovieDetails(movie, trailer, credits);

        // Hide loading and show content
        loadingState.style.display = 'none';
        movieInfo.style.display = 'block';

        // Initialize favorite button after rendering
        initializeFavoriteButton();

    } catch (error) {
        console.error("Erro ao inicializar detalhes do filme:", error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorState.textContent = 'Não foi possível carregar os detalhes do filme. Tente novamente mais tarde.';
    }
}

// Inicializar ao carregar DOM
document.addEventListener('DOMContentLoaded', () => {
    initializeMovieDetails();
});
