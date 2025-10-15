# 🎬 CineStream

Sistema de streaming de filmes que utiliza a API do TMDB (The Movie Database) para exibir informações sobre filmes, permitindo busca por texto e categorias.

## 🛠 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScrip
- API TMDB v3

## 📋 Pré-requisitos

- XAMPP (7.4 ou superior)
- Navegador web moderno
- Conexão com internet

## 🚀 Instalação

1. Inicie o XAMPP e ative o Apache:
```bash
sudo /Applications/XAMPP/xamppfiles/xampp start
```

2. Clone o repositório na pasta htdocs:
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/
git clone [URL_DO_REPOSITÓRIO] iptv1
```

3. Acesse o projeto:
```
http://localhost/iptv1/
```

## 📁 Estrutura do Projeto

```
iptv1/
├── css/
│   └── style.css         # Estilos globais
├── js/
│   ├── auth.js          # Autenticação
│   ├── main.js          # Lógica principal
│   └── search.js        # Sistema de busca
├── index.html           # Página inicial
├── search.html          # Resultados de busca
└── movie-details.html   # Detalhes do filme
```

## 🔧 Configuração

O arquivo `js/search.js` contém as configurações da API:

```javascript
const APP = {
    api: {
        key: '2c19bf5eb981d886122e44a78fed935d',
        baseUrl: 'https://api.themoviedb.org/3',
        imageUrl: 'https://image.tmdb.org/t/p',
        language: 'pt-BR'
    }
}
```

## 💡 Funcionalidades

- Busca de filmes por texto
- Filtro por categorias:
  - Ação
  - Comédia
  - Drama
  - Terror
  - Aventura
- Visualização detalhada de filmes
- Sistema de favoritos
- Design responsivo

## 🔍 Como Usar

1. **Página Inicial**
   - Navegue pelos filmes em destaque
   - Use a barra de pesquisa
   - Selecione uma categoria

2. **Busca**
   - Digite um termo na barra de pesquisa
   - Clique em uma categoria disponível

3. **Detalhes do Filme**
   - Clique em "Ver detalhes" em qualquer filme
   - Acesse informações completas

## ⚠️ Solução de Problemas

1. **Página em branco:**
   - Verifique se o Apache está rodando
   - Confirme o caminho: `/Applications/XAMPP/xamppfiles/htdocs/iptv1`

2. **Imagens não carregam:**
   - Verifique sua conexão com internet
   - Confirme se a API key está ativa

3. **Busca não funciona:**
   - Abra o console (F12) para verificar erros
   - Limpe o cache do navegador

## 👤 Autor

[SEU_NOME]
- Email: [SEU_EMAIL]
- GitHub: [@seu_usuario](https://github.com/seu_usuario)

## 📄 Licença

Este projeto está sob a licença MIT.

---
Desenvolvido como projeto acadêmico para [NOME_DA_INSTITUIÇÃO].
