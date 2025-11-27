# 🎬 CineStream

Sistema de streaming de filmes e séries que utiliza a API do **TMDB (The Movie Database)** para metadados e possui um sistema de **Catálogo Curado** e **Painel Administrativo** com autenticação de usuário.

---

## 🛠 Tecnologias Utilizadas

O projeto utiliza uma arquitetura **LAMP/XAMPP** com integrações externas:

* **Frontend:** HTML5, CSS3, JavaScript.
* **Backend:** **PHP** (para API REST de autenticação, favoritos e catálogo).
* **Banco de Dados:** **MySQL** (via PDO).
* **APIs Externas:**
    * **TMDB API v3:** Metadados de filmes e séries (Chave: `2c19bf5eb981d886122e44a78fed935d`).
    * **Superflix API:** Link para o player de vídeo incorporado (`https://superflixapi.asia/`).

---

## 📋 Pré-requisitos

* **XAMPP / WAMP / MAMP** (com Apache e MySQL ativos).
* **PHP** (Versão 7.4 ou superior).
* Navegador web moderno.
* Conexão com internet.

---

## 🚀 Instalação e Configuração

1.  **Inicie o Apache e o MySQL** no seu ambiente XAMPP/WAMP/MAMP.
2.  **Clone** o repositório na pasta `htdocs` (ou equivalente) e renomeie-o (ex: para `cinestream`):
    ```bash
    cd /Applications/XAMPP/xamppfiles/htdocs/
    git clone [URL_DO_REPOSITÓRIO] cinestream
    ```
3.  **Configuração do Banco de Dados:**
    * Acesse o phpMyAdmin.
    * Crie um novo banco de dados chamado **`cinestream`**.
    * Importe o arquivo **`iptv/database/schema.sql`** para criar as tabelas necessárias (`usuarios`, `catalogo_curado`, `favoritos`, etc.).
4.  **Configuração PHP:**
    * Abra o arquivo **`iptv/database/config.php`**.
    * Verifique e ajuste as credenciais de acesso ao banco se necessário (o padrão é `DB_USER: 'root'` e `DB_PASSWORD: ''`).
5.  **Acesso ao Projeto:**
    ```
    http://localhost/cinestream/iptv/
    ```

---

## 🔒 Credenciais de Acesso (Login)

O sistema possui dois tipos de acesso: **Usuário Comum** e **Administrador**.

### Acesso de Administrador (Pré-cadastrado)

Para acessar o **Painel de Administração** (`admin.html`) e gerenciar o catálogo, utilize as seguintes credenciais que devem ser inseridas no banco de dados (`usuarios`):

* **E-mail:** `admin@gmail.com`
* **Senha:** `12345678a@`

O login com estas credenciais irá redirecionar automaticamente para a página **`admin.html`**.

### Cadastro de Usuário Comum

Para o acesso normal de visualização do catálogo, basta utilizar o link **"Cadastre-se"** na página de login (`login.html`) e criar um novo usuário.

---

## 💡 Funcionalidades Principais

* **Sistema de Autenticação Completo** (Login, Cadastro, Logout).
* **Catálogo Curado:** O conteúdo em destaque (`index.html`) e as listagens (`index_list.html`) são controlados pelo administrador no banco de dados.
* **Painel de Administração (`admin.html`):** Permite buscar conteúdo no TMDB e adicionar/remover do catálogo curado.
* **Busca Mista:** Pesquisa por filmes **E** séries através da barra de busca.
* **Detalhes e Player:** Visualização de sinopse, elenco e um player funcional para Filmes (por ID IMDb) e Séries (por Temporada/Episódio).
* **Favoritos:** Usuários podem adicionar filmes/séries à sua lista pessoal.

---

## 📁 Estrutura do Projeto

```
iptv/
├── css/
│   └── style.css         # Estilos globais
├── js/
│   ├── auth.js          # Autenticação
│   ├── main.js          # Lógica principal
│   └── search.js        # Sistema de busca
├── index.html           # Página inicial
├── search.html          # Resultados de busca
└── movie-details.html   # Detalhes do filme


iptv/
├── api/
│   └── admin/
│   └── content/
│   └── favoritos/
├── auth/
├── css/
├── database/
├── js/
├── admin.html
├── cadastro.html
├── favoritos.html
├── index.html
├── index_list.html
├── login.html
├── movie-details.html # Página de Detalhes
└── README.md
```

## 👤 Autor

Gustavo Fernandes
- Email: gh5857750@gmail.com
- GitHub: (https://github.com/ktchau10)

---
Desenvolvido como projeto acadêmico para UFOPA - Universiade Federal do Oeste do Pará.
