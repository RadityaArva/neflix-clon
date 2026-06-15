const { createApp, ref, onMounted, onUnmounted } = Vue;

createApp({
    setup() {
        const isScrolled = ref(false);
        const heroBgStyle = ref({ backgroundPosition: '80% 30%' });
        const heroContentStyle = ref({});
        const videoStyle = ref({}); 
        
        const showVideo = ref(true); 
        const heroVideo = ref(null); 

        const subMenus = ref([
            "Coming Soon", "Everyone's Watching", "Top 10 TV Shows", 
            "Top 10 Movies", "Only on Netflix", "New Releases",
        ]);

        const movieRows = ref([
            {
                title: "TV Dramas",
                movies: [
                    { image: "asset/IMG_0087.JPG", topBadge: "1", isHovered: false },
                    { image: "asset/IMG_1618.JPG", label: "New Episodes", isHovered: false },
                    { image: "asset/IMG_1679.jpg", label: "Recently Added", isHovered: false },
                    { image: "asset/IMG_1774.JPG", isHovered: false },
                    { image: "asset/IMG_1985.jpg", isHovered: false },
                    { image: "asset/IMG_2192.jpg", label: "Recently Added", isHovered: false },
                ],
            },
            {
                title: "Romance TV Shows",
                movies: [
                    { image: "asset/IMG_2225.JPG", isHovered: false },
                    { image: "asset/IMG_2350.jpg", isHovered: false },
                    { image: "asset/IMG_2469.jpg", isHovered: false },
                    { image: "asset/IMG_0012.jpg", label: "Recently Added", isHovered: false },
                    { image: "asset/IMG_2471.jpg", isHovered: false },
                    { image: "asset/IMG_2507.JPG", label: "New Episodes", isHovered: false },
                ],
            },
            {
                title: "TV Sci-Fi & Horror",
                movies: [
                    { image: "asset/IMG_2508.JPG", label: "Recently Added", isHovered: false },
                    { image: "asset/IMG_8935.jpg", isHovered: false },
                    { image: "asset/IMG_2513.jpg", isHovered: false },
                    { image: "asset/IMG_2516.JPG", label: "New Episodes", isHovered: false },
                    { image: "asset/IMG_8935.jpg", isHovered: false },
                    { image: "asset/IMG_2192.jpg", label: "New Episodes", isHovered: false },
                ],
            },
        ]);

        const handleScroll = () => {
            const scrollY = window.scrollY;
            isScrolled.value = scrollY > 50;

            const parallaxY = Math.min(scrollY * 0.05, 20);
            heroBgStyle.value = { backgroundPosition: `70% calc(30% + ${parallaxY}%)` };
            
            videoStyle.value = { 
                transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
                objectPosition: '70% center'
            };
            
            const scale = Math.max(0.95, 1 - scrollY / 5000);
            heroContentStyle.value = { transform: `translate3d(0, ${Math.min(scrollY / 4, 35)}px, 0) scale(${scale})` };
        };

        const isPlayerOpen = ref(false);
        const isPlayerLoading = ref(false);
        const mainVideoPlayer = ref(null);
        const isPlaying = ref(false);
        const progressPercent = ref(0);
        const volume = ref(1);
        const brightness = ref(100);
        const controlsVisible = ref(true);
        const formattedTime = ref("00:00");
        const formattedDuration = ref("00:00");
        
        const showSubMenu = ref(false);
        const activeSub = ref('en'); 
        let controlsTimeout;

        const toggleSubMenu = () => {
            showSubMenu.value = !showSubMenu.value;
        };

        const setSubtitle = (lang) => {
            activeSub.value = lang;
            showSubMenu.value = false;
            
            if (mainVideoPlayer.value) {
                const tracks = mainVideoPlayer.value.textTracks;
                for (let i = 0; i < tracks.length; i++) {
                    if (lang === 'off') {
                        tracks[i].mode = 'hidden';
                    } else {
                        tracks[i].mode = tracks[i].language === lang ? 'showing' : 'hidden';
                    }
                }
            }
        };

        const showPlayerControls = () => {
            controlsVisible.value = true;
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (isPlaying.value && !showSubMenu.value) {
                    controlsVisible.value = false;
                }
            }, 3000);
        };

        const hidePlayerControls = () => {
            if (isPlaying.value && !showSubMenu.value) {
                controlsVisible.value = false;
            }
        };

        const openPlayer = () => {
            isPlayerOpen.value = true;
            isPlayerLoading.value = true; 
            
            if (heroVideo.value) {
                heroVideo.value.pause();
            }

            const modalElement = document.querySelector('.video-modal');
            if (modalElement && modalElement.requestFullscreen && !document.fullscreenElement) {
                modalElement.requestFullscreen().catch((e) => console.log(e.message));
            }
            
            setTimeout(() => {
                if (mainVideoPlayer.value) {
                    isPlayerLoading.value = false;

                    const playPromise = mainVideoPlayer.value.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => console.log(e));
                    }
                    isPlaying.value = true;
                    showPlayerControls();
                }
            }, 1500); 
        };

        const closePlayer = () => {
            isPlayerOpen.value = false;
            showSubMenu.value = false;
            if (mainVideoPlayer.value) {
                mainVideoPlayer.value.pause();
                isPlaying.value = false;
            }
            
            if (heroVideo.value) {
                heroVideo.value.muted = false; 
                heroVideo.value.play().catch(e => console.log(e));
            }

            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(e => console.log(e));
            }
        };

        const togglePlay = () => {
            if (mainVideoPlayer.value) {
                if (mainVideoPlayer.value.paused) {
                    mainVideoPlayer.value.play();
                    isPlaying.value = true;
                } else {
                    mainVideoPlayer.value.pause();
                    isPlaying.value = false;
                    showPlayerControls(); 
                }
            }
        };

        const skip = (seconds) => {
            if (mainVideoPlayer.value) {
                mainVideoPlayer.value.currentTime += seconds;
            }
        };

        const handleKeyDown = (event) => {
            if (isPlayerOpen.value) {
                if (event.code === 'Space' || event.key === ' ') {
                    event.preventDefault();
                    togglePlay();
                    showPlayerControls();
                } else if (event.key === 'Escape' || event.code === 'Escape') {
                    event.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(e => console.log(e));
                    } else {
                        closePlayer();
                    }
                } else if (event.key === 'ArrowRight' || event.code === 'ArrowRight') {
                    event.preventDefault();
                    skip(10);
                    showPlayerControls();
                } else if (event.key === 'ArrowLeft' || event.code === 'ArrowLeft') {
                    event.preventDefault();
                    skip(-10);
                    showPlayerControls();
                }
            }
        };

        const changeVolume = () => {
            if (mainVideoPlayer.value) {
                mainVideoPlayer.value.volume = volume.value;
            }
        };

        const formatTime = (time) => {
            if (isNaN(time)) return "00:00";
            const min = Math.floor(time / 60);
            const sec = Math.floor(time % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        const handleTimeUpdate = () => {
            if (mainVideoPlayer.value) {
                const current = mainVideoPlayer.value.currentTime;
                const dur = mainVideoPlayer.value.duration;
                if (dur) {
                    progressPercent.value = (current / dur) * 100;
                    formattedTime.value = formatTime(current);
                }
            }
        };

        const handleVideoLoaded = () => {
            if (mainVideoPlayer.value) {
                formattedDuration.value = formatTime(mainVideoPlayer.value.duration);
                setSubtitle(activeSub.value);
            }
        };

        const seekVideo = (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            if (mainVideoPlayer.value) {
                mainVideoPlayer.value.currentTime = pos * mainVideoPlayer.value.duration;
            }
        };

        const toggleFullScreen = () => {
            const modalElement = document.querySelector('.video-modal');
            if (!document.fullscreenElement) {
                if (modalElement && modalElement.requestFullscreen) {
                    modalElement.requestFullscreen().catch((e) => console.log(e));
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        };

        onMounted(() => {
            handleScroll();

            window.addEventListener("scroll", handleScroll, { passive: true });
            window.addEventListener("keydown", handleKeyDown);

            if (heroVideo.value) {
                heroVideo.value.muted = true;
                heroVideo.value.play().catch(e => console.log(e));
            }

            const forceUnmute = () => {
                if (heroVideo.value && heroVideo.value.muted && !isPlayerOpen.value) {
                    heroVideo.value.muted = false;
                    heroVideo.value.currentTime = 0; 
                    heroVideo.value.play().catch(e => console.log(e));
                }
                document.body.removeEventListener('click', forceUnmute);
                window.removeEventListener('scroll', forceUnmute);
            };

            document.body.addEventListener('click', forceUnmute);
            window.addEventListener('scroll', forceUnmute, { once: true });

            setTimeout(() => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                        } else {
                            entry.target.classList.remove('in-view');
                        }
                    });
                }, { threshold: 0.1 });

                document.querySelectorAll('.fade-section, .fade-card').forEach(el => {
                    observer.observe(el);
                });
            }, 100);
        });

        onUnmounted(() => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("keydown", handleKeyDown);
            clearTimeout(controlsTimeout);
        });

        return {
            isScrolled, heroBgStyle, heroContentStyle, videoStyle, showVideo, heroVideo, subMenus, movieRows,
            isPlayerOpen, isPlayerLoading, mainVideoPlayer, isPlaying, progressPercent, volume, brightness, controlsVisible,
            formattedTime, formattedDuration, showSubMenu, activeSub, toggleSubMenu, setSubtitle,
            showPlayerControls, hidePlayerControls, openPlayer, closePlayer, togglePlay, skip, changeVolume,
            handleTimeUpdate, handleVideoLoaded, seekVideo, toggleFullScreen
        };
    },
}).mount("#app");