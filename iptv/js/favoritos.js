// favoritos.js
// Exibe os filmes favoritos salvos no localStorage

document.addEventListener('DOMContentLoaded', function() {
    const favoritesList = document.getElementById('favorites-list');
    const noFavorites = document.getElementById('no-favorites');
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    function renderFavorites() {
        favoritesList.innerHTML = '';
        if (favoritos.length === 0) {
            noFavorites.style.display = 'block';
            return;
        }
        noFavorites.style.display = 'none';
        favoritos.forEach(filme => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${filme.poster}" alt="${filme.titulo}" class="movie-poster">
                <div class="movie-info">
                    <h3>${filme.titulo}</h3>
                    <p><strong>Ano:</strong> ${filme.ano}</p>
                    <p><strong>Nota:</strong> ${filme.nota}</p>
                    <button class="remove-favorite-btn" data-id="${filme.id}">Remover dos Favoritos</button>
                </div>
            `;
            favoritesList.appendChild(card);
        });
    }

    favoritesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-favorite-btn')) {
            const id = e.target.getAttribute('data-id');
            favoritos = favoritos.filter(filme => filme.id != id);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            renderFavorites();
        }
    });

    renderFavorites();
});
