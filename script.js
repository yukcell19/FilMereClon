// TMDB Movie API
const API_KEY = "api_key=ccc02c6859a478a36dd9740b6835eb1b"; // API Key
const BASE_URL = "https://api.themoviedb.org/3";
let sort_by = "popularity.desc";
let API_URL = `${BASE_URL}/discover/movie?sort_by=${sort_by}&${API_KEY}`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = `${BASE_URL}/search/movie?${API_KEY}`;

const main = document.getElementById("main");
const search_bar = document.querySelector(".search-bar");
const search = document.getElementById("search");
const categories = document.querySelectorAll(".cat");
const categorySection = document.getElementById("categories");

const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const currentButton = document.getElementById("current");

//filmleri görüntüleme
fetch(API_URL)
  .then((response) => response.json())
  .then((data) => {
    displayMovies(data.results);
  });

function displayMovies(movies) {
  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("movie");
    movieItem.innerHTML = `
             <img id=movie_img src="${IMAGE_URL + movie.poster_path}">
             <div class="movie-info">
               <h3>${movie.title}</h3>
               <span class="${movieRateColor(movie.vote_average)}">${movie.vote_average}</span>   
             </div>
             <div class="overview">
                <h3>Overview
                <button class="show-actors" data-id="${movie.id}">Show Actors</button></h3>
                <p class="movie-overview">${movie.overview}</p>
                <br/> 
                <button class="know-more" id="${movie.id}">Know More</button>
                <div class="rating-container">
                  <span class="rate-span">Rate:<input type="number" class="rating-input" min="1" max="10" placeholder="1-10" /></span>
                </div>
              </div>`;

    const movieimg = movieItem.querySelector("img");
    if (movieimg.src == "https://image.tmdb.org/t/p/w500null") {
      movieimg.src = "img/image_nf.jpg";
    }
    main.appendChild(movieItem);

    //---

    const knowMoreButton = movieItem.querySelector(".know-more");
    const kmContainer = document.getElementById("km-container");
    const movieName = document.getElementById("movie-name");

    knowMoreButton.addEventListener("click", () => {
      kmContainer.style.width = "100%";
      currentVideoIndex = 0;
      document.body.classList.add("hidden-scrollbar");
      movieName.innerHTML = movie.title;
      getMovieVideos(movie.id);
    });

    let closeVideo = document.getElementById("close-video");
    closeVideo.addEventListener("click", () => {
      document.body.classList.remove("hidden-scrollbar");
      kmContainer.style.width = "0";
    });

    //---

    const ratingInput = movieItem.querySelector(".rating-input");
    const ratingContainer = movieItem.querySelector(".rating-container");
    const yourRateSpan = document.createElement("span");

    const savedRating = localStorage.getItem(`${movie.title}`);
    if (savedRating) {
      yourRateSpan.innerHTML = `
      <span class="your-rate">Your Rate: ${savedRating}</span>`;
      ratingContainer.appendChild(yourRateSpan);
    }

    ratingInput.addEventListener("keyup", (e) => {
      if (e.key == "Enter") {
        const rating = ratingInput.value;
        if (rating >= 1 && rating <= 10) {
          localStorage.setItem(`${movie.title}`, rating);
          yourRateSpan.innerHTML = `
          <span class="your-rate">Your Rate: ${rating}</span>`;
          ratingContainer.appendChild(yourRateSpan);
          ratingInput.value = "";
        } else {
          alert("Please enter a rating between 1 and 10");
        }
      }
    });

    //---

      const showActors = movieItem.querySelector(".show-actors")
      showActors.addEventListener("click", () => {
          const movieId = showActors.getAttribute("data-id");
          showActorsCard(movieId);
      });
  });
}

//filmin değerlendirmesine göre renk ayarlama
function movieRateColor(movieVote) {
  if (movieVote >= 8) {
    return "green";
  } else if (movieVote >= 6) {
    return "orange";
  } else {
    return "red";
  }
}

//sayfa değiştirme işlemleri
let currentPage = 1;
prevButton.classList.remove("enabled");
prevButton.classList.add("disabled");
function otherPages(page) {
  fetch(`${API_URL}&page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      displayMovies(data.results);
    });
}
otherPagesEvents();

function otherPagesEvents() {
  //sonraki sayfa
  nextButton.addEventListener("click", () => {
    prevButton.classList.remove("disabled");
    prevButton.classList.add("enabled");
    main.innerHTML = "";
    currentPage++;
    if (selectedCategories) {
      getMoviesByCategory(selectedCategories, currentPage); //kategori seçtikten sonra sayfa değiştirme
    } else if (API_URL.includes("top_rated")) {
      getTopMovies(currentPage); // En iyi filmler arasında sayfa değiştirme
    } else if (API_URL.includes("upcoming")) {
      getUpcomingMovies(currentPage); // yakında yayınlanacak filmler arasında sayfa değiştirme
    } else if (searchContent) {
      searchMovies(searchContent, currentPage); //film aradıktan sonra sayfa değiştirme
    } else {
      otherPages(currentPage); //anasayfada sayfa değiştirme
    }
    currentButton.innerHTML = currentPage;
  });

  //önceki sayfa
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      main.innerHTML = "";
      currentPage--;
      if (selectedCategories) {
        getMoviesByCategory(selectedCategories, currentPage);
      } else if (searchContent) {
        searchMovies(searchContent, currentPage);
      } else if (API_URL.includes("top_rated")) {
        getTopMovies(currentPage);
      } else if (API_URL.includes("upcoming")) {
        getUpcomingMovies(currentPage);
      } else {
        otherPages(currentPage);
      }

      currentButton.innerHTML = currentPage;

      if (currentButton.innerHTML == 1) {
        prevButton.classList.remove("enabled");
        prevButton.classList.add("disabled");
      }
    }
  });
}

//film arama işlemleri
search_bar.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const scontent = search.value.trim();
    if (scontent) {
      currentPage = 1;
      currentButton.innerHTML = 1;
      if (currentButton.innerHTML == 1) {
        prevButton.classList.remove("enabled");
        prevButton.classList.add("disabled");
      }
      searchMovies(scontent);
    }
  }
});

let searchContent = "";
function searchMovies(scontent, page = 1) {
  searchContent = scontent;
  API_URL = `${SEARCH_URL}&query=${scontent}`;
  fetch(`${SEARCH_URL}&query=$${scontent}&page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      main.innerHTML = "";
      console.log(data.total_pages);
      if (data.total_pages > 0) {
        displayMovies(data.results);
      }
      categorySection.style.display = "none";
      if (page == data.total_pages) {
        nextButton.classList.remove("enabled");
        nextButton.classList.add("disabled");
      } else {
        nextButton.classList.remove("disabled");
        nextButton.classList.add("enabled");
      }
    });
}

//kategoriye göre film getirme işlemleri

selectedCategories = [];
categories.forEach((category) => {
  category.addEventListener("click", () => {
    if (category.classList.contains("highlight")) {
      category.classList.remove("highlight");
      selectedCategories = selectedCategories.filter(
        (id) => id !== category.id
      );
      console.log(selectedCategories);
      currentPage = 1;
      currentButton.innerHTML = currentPage;
      prevButton.classList.remove("enabled");
      prevButton.classList.add("disabled");
      getMoviesByCategory(selectedCategories, currentPage);
      if (selectedCategories.length == 0) {
        currentPage = 1;
        currentButton.innerHTML = currentPage;
        prevButton.classList.remove("enabled");
        prevButton.classList.add("disabled");
        main.innerHTML = "";
        otherPages(currentPage);
      }
    } else {
      category.classList.add("highlight");
      selectedCategories.push(category.id);
      currentPage = 1;
      currentButton.innerHTML = currentPage;
      prevButton.classList.remove("enabled");
      prevButton.classList.add("disabled");
      getMoviesByCategory(selectedCategories, currentPage);
      console.log(selectedCategories);
    }
  });
});

function getMoviesByCategory(selectedCategories, page = 1) {
  fetch(`${API_URL}&with_genres=${selectedCategories}&page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      main.innerHTML = "";
      if (data.total_pages > 0) {
        displayMovies(data.results);
      }
      if (page == data.total_pages) {
        nextButton.classList.remove("enabled");
        nextButton.classList.add("disabled");
      } else {
        nextButton.classList.remove("disabled");
        nextButton.classList.add("enabled");
      }
    });
}

//Filmle alaklı videoları görüntüleme işlemleri
let currentVideoIndex = 0;
let videos = [];

const videoContainer = document.querySelector(".video-container");
function getMovieVideos(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}/videos?${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      videos = data.results;
      if (videos.length > 0) {
        displayVideo(currentVideoIndex);
      } else {
        videoContainer.innerHTML = "<p>No videos available for this movie.</p>";
        currentVideo.innerHTML = "";
      }
    });
}

const currentVideo = document.getElementById("current-video");
function displayVideo(index) {
  const video = videos[index];
  videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${video.key}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  currentVideo.innerHTML = `${index + 1} / ${videos.length}`;
}

const nextVideo = document.querySelector("#next-video");
nextVideo.addEventListener("click", () => {
  if (currentVideoIndex < videos.length - 1) {
    currentVideoIndex++;
    displayVideo(currentVideoIndex);
  }
});

const prevVideo = document.querySelector("#prev-video");
prevVideo.addEventListener("click", () => {
  if (currentVideoIndex > 0) {
    currentVideoIndex--;
    displayVideo(currentVideoIndex);
  }
});

//en iyi filmleri getirme işlemleri
const topMoviesButton = document.getElementById("top-rated");

topMoviesButton.addEventListener("click", () => {
  necessaryActions();
  getTopMovies();
});

function getTopMovies(page = 1) {
  let TOP_MOVIES_URL = `${BASE_URL}/movie/top_rated?${API_KEY}&page=${page}`;
  API_URL = TOP_MOVIES_URL;
  fetch(TOP_MOVIES_URL)
    .then((response) => response.json())
    .then((data) => {
      main.innerHTML = "";
      displayMovies(data.results);
      pageActions(data.total_pages);
    });
}

// yakında yayınlanacak filmleri getirme işlemleri
const upcomingMoviesButton = document.getElementById("upcoming");

upcomingMoviesButton.addEventListener("click", () => {
  necessaryActions();
  getUpcomingMovies();
});

function getUpcomingMovies(page = 1) {
  let UPCOMING_MOVIES_URL = `${BASE_URL}/movie/upcoming?${API_KEY}&page=${page}`;
  API_URL = UPCOMING_MOVIES_URL;
  fetch(UPCOMING_MOVIES_URL)
    .then((response) => response.json())
    .then((data) => {
      main.innerHTML = "";
      displayMovies(data.results);
      pageActions(data.total_pages);
    });
}

// en çok oylanan filmleri getirme işlemleri
const mostVotedButton = document.getElementById("most-voted");

mostVotedButton.addEventListener("click", () => {
  necessaryActions();
  sort_by = "vote_count.desc";
  getMostVotedMovies(currentPage);
});

function getMostVotedMovies(page = 1) {
  API_URL = `${BASE_URL}/discover/movie?sort_by=${sort_by}&${API_KEY}&page=${page}`;
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      main.innerHTML = "";
      displayMovies(data.results);
      pageActions(data.total_pages);
    });
}

// tekrarlayan işlemler
function necessaryActions() {
  currentPage = 1;
  currentButton.innerHTML = currentPage;
  prevButton.classList.remove("enabled");
  prevButton.classList.add("disabled");
  selectedCategories = [];
  categories.forEach((category) => category.classList.remove("highlight"));
  categorySection.style.display = "none";
}

function pageActions(totalPage) {
  if (totalPage > 1) {
    nextButton.classList.remove("disabled");
    nextButton.classList.add("enabled");
  } else {
    nextButton.classList.remove("enabled");
    nextButton.classList.add("disabled");
  }
}


// filmin popüler aktörlerini gösterme işlemleri
const actorsCard = document.createElement("div");
actorsCard.classList.add("actors-card");
document.body.appendChild(actorsCard);

function showActorsCard(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}/credits?${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      const actors = data.cast.slice(0, 5);
      let actorsHtml = "";
      actors.forEach((actor) => {
        actorsHtml += `
          <div class="actor-item">
            <img src="${IMAGE_URL + actor.profile_path}">
            <span class="actor-name">${actor.name}</span>
          </div>
        `;
      });
      
      actorsCard.innerHTML = `
      <div class= "actors-div">
        <span class="close-actors">&times;</span>
        <h4>Popular Actors</h4>
        ${actorsHtml}
      </div>
      `;

      actorsCard.style.display = "block";

      const closeActors = actorsCard.querySelector(".close-actors");
      closeActors.addEventListener("click", () => {
        actorsCard.style.display = "none";
      });
    });
}

