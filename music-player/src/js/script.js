
import './dataMusic.js';
import { dataMusic } from './dataMusic.js';

let playList = [];
const favoriteList = localStorage.getItem('favorite') ? JSON.parse(localStorage.getItem('favorite')) : [];

const audio = new Audio();
const headerLogo = document.querySelector('.header__logo');
const favoriteBtn = document.querySelector('.header__favorite_btn');
const catalogContainer = document.querySelector('.catalog__container');
const tracksCard = document.getElementsByClassName('track');
const player = document.querySelector('.player');
const pauseBtn = document.querySelector('.player__icon_pause');
const stopBtn = document.querySelector('.player__icon_stop');
const prevBtn = document.querySelector('.player__icon_prev');
const nextBtn = document.querySelector('.player__icon_next');
const likeBtn = document.querySelector('.player__icon_like');
const muteBtn = document.querySelector('.player__icon_mute');
const playerProgressInput = document.querySelector('.player__progress_input');
const playerTitle = document.querySelector('.player__info_title');
const playerArtist = document.querySelector('.player__artist');
const playerTimePassed = document.querySelector('.player__time_passed');
const playerTimeTotal = document.querySelector('.player__time_total');
const playerVolumeInput = document.querySelector('.player__volume_input');

const catalogAddBtn = document.createElement('button');
catalogAddBtn.classList.add('catalog__btn_add');
catalogAddBtn.innerHTML = `
    <span>Увидеть все</span>
    <svg width="24" height="24" viewbox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
    </svg>
`;

const pausePlayer = () => {
    const trackActive = document.querySelector('.track_active');

    if (audio.paused) {
        audio.play();
        pauseBtn.classList.remove('player__icon_play');
        trackActive.classList.remove('track_pause');
    } else {
        audio.pause();
        pauseBtn.classList.add('player__icon_play');
        trackActive.classList.add('track_pause');
    };
};

const playMusic = e => {

    e.preventDefault();

    const trackActive = e.currentTarget;

    if (trackActive.classList.contains('track_active')) {
        pausePlayer();
        return;
    };
    let i = 0;
    const id = trackActive.dataset.idTrack;

    const index = favoriteList.indexOf(id);
    if (index !== -1) {
        likeBtn.classList.add('player__icon_like_active');
    } else {
        likeBtn.classList.remove('player__icon_like_active');
    };

    const track = playList.find((item, ind) => {
        i = ind;
        return id === item.id;
    });

    audio.src = track.mp3;
    playerTitle.textContent = track.track;
    playerArtist.textContent = track.artist;
    audio.play();
    pauseBtn.classList.remove('player__icon_play');
    player.classList.add('player_active');

    const prevTrack = i === 0 ? playList.length - 1 : i - 1;
    const nextTrack = i + 1 === playList.length ? 0 : i + 1;
    prevBtn.dataset.idTrack = playList[prevTrack].id;
    nextBtn.dataset.idTrack = playList[nextTrack].id;
    likeBtn.dataset.idTrack = id;

    for (let i = 0; i < tracksCard.length; i++) {
        if (id === tracksCard[i].dataset.idTrack) {
            tracksCard[i].classList.add('track_active');
        } else {
            tracksCard[i].classList.remove('track_active');
        };
    };

};

const addHandlerTrack = ()=> {
    for (let i = 0; i < tracksCard.length; i++) {
        tracksCard[i].addEventListener('click', playMusic);
    };
};

pauseBtn.addEventListener('click', pausePlayer);

stopBtn.addEventListener('click', () => {
    player.classList.remove('player_active');
    audio.src = '';
    document.querySelector('.track_active').classList.remove('track_active');
});

const createCards = (data) => {
    const card = document.createElement('a');
    card.href = '#';
    card.classList.add('catalog__btn', 'track');
    card.dataset.idTrack = data.id;
    card.innerHTML = `
        <div class="track__img_wrap track__control_play">
        <img src='${data.poster}'
            alt="${data.artist} - ${data.track}" 
            class="track__poster"
            width="180"
            height="180">
        </div>
        <div class="track__info">
            <p class="track__title">${data.track}</p>
            <p class="track__artist">${data.artist}</p>
        </div>
    `;

    return card;
};

const renderCatalog = (dataList) => {
    playList = [...dataList];
    catalogContainer.textContent = '';
    const listCards = dataList.map(createCards);
    catalogContainer.append(...listCards);
    addHandlerTrack();
};

const checkCount = (i = 1) => {
    tracksCard[0];
    if (catalogContainer.clientHeight > tracksCard[0].clientHeight * 3) {
        tracksCard[tracksCard.length - i].style.display = 'none';
        checkCount(i + 1);
    } else if (i != 1) {
        catalogContainer.append(catalogAddBtn);
    };

    //prevBtn.addEventListener('click', playMusic);
    //nextBtn.addEventListener('click', playMusic);
};

const updateTime = () => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progress = (currentTime / duration) * 100;
    playerProgressInput.value = progress ? progress : 0;

    const minutesPassed = Math.floor(currentTime / 60) || '0';
    const secondssPassed = Math.floor(currentTime % 60) || '0';

    const minutesDuration = Math.floor(duration / 60) || '0';
    const secondssDuration = Math.floor(duration % 60) || '0';

    playerTimePassed.textContent = `${minutesPassed}:${secondssPassed < 10 ? '0' + secondssPassed : secondssPassed}`;
    playerTimeTotal.textContent = `${minutesDuration}:${secondssDuration < 10 ? '0' + secondssDuration : secondssDuration}`;
};

const init = () => {

    audio.volume = localStorage.getItem('volume') || 1;
    playerVolumeInput.value = audio.volume * 100;

    renderCatalog(dataMusic);
    checkCount();

    catalogAddBtn.addEventListener('click', () => {
        [...tracksCard].forEach(trackCard => {
            trackCard.style.display = 'block';
            catalogAddBtn.remove();
        });
    });

    prevBtn.addEventListener('click', playMusic);
    nextBtn.addEventListener('click', playMusic);

    audio.addEventListener('ended', () => {
        nextBtn.dispatchEvent(new Event('click', {bubbles: true}));
    });

    audio.addEventListener('timeupdate', updateTime);
    playerProgressInput.addEventListener('change', () => {
        const progress = playerProgressInput.value;
        audio.currentTime = (progress / 100) * audio.duration;
    });

    favoriteBtn.addEventListener('click', () => {
        favoriteBtn.style.color = 'tomato';
        const data = dataMusic.filter((item) => favoriteList.includes(item.id));
        renderCatalog(data);
        checkCount();
    });

    headerLogo.addEventListener('click', () => {
        favoriteBtn.style.color = '';
        renderCatalog(dataMusic);
        checkCount();
    });

    likeBtn.addEventListener('click', () => {
        const index = favoriteList.indexOf(likeBtn.dataset.idTrack);
        if (index === -1) {
            favoriteList.push(likeBtn.dataset.idTrack);
            likeBtn.classList.add('player__icon_like_active');
        } else {
            favoriteList.splice(index, 1);
            likeBtn.classList.remove('player__icon_like_active');
        };
        localStorage.setItem('favorite', JSON.stringify(favoriteList));
    });

    playerVolumeInput.addEventListener('input', () => {
        const value = playerVolumeInput.value;
        audio.volume = value / 100;
        
        if (audio.volume === 0) {
            muteBtn.classList.add('player__icon_mute_off');
        } else {
            muteBtn.classList.remove('player__icon_mute_off');
        }
    });

    muteBtn.addEventListener('click', () => {
        if (audio.volume) {
            localStorage.setItem('volume', audio.volume);
            audio.volume = 0;
            muteBtn.classList.add('player__icon_mute_off');
            playerVolumeInput.value = 0;
        } else {
            audio.volume = localStorage.getItem('volume');
            muteBtn.classList.remove('player__icon_mute_off');
            playerVolumeInput.value = audio.volume * 100;
        };
    });
};

init();