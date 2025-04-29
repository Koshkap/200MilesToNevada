document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const videoPlayerScreen = document.getElementById('video-player');
    const introVideo = document.getElementById('intro-video');
    const skipVideoButton = document.getElementById('skip-video-button');
    const gameScreen = document.getElementById('game-screen');

    // Function to switch screens
    function showScreen(screenToShow) {
        startScreen.style.display = 'none';
        videoPlayerScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        screenToShow.style.display = 'flex'; // Use flex as defined in CSS
    }

    // --- Start Button --- 
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        showScreen(videoPlayerScreen);
        // Attempt to play video, handle potential errors
        introVideo.play().catch(error => {
            console.error('Video play failed:', error);
            // Maybe show an error message or fallback
        });
    });

    // --- Skip Video Button --- 
    skipVideoButton.addEventListener('click', () => {
        console.log('Skip video button clicked');
        introVideo.pause(); 
        introVideo.currentTime = 0; // Reset video 
        showScreen(gameScreen); 
    });

    // --- Video End --- 
    introVideo.addEventListener('ended', () => {
        console.log('Intro video finished');
        showScreen(gameScreen);
    });

    // Optional: Handle potential video loading errors
    introVideo.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
        // Maybe skip video automatically or show error
        alert('Could not load intro video. Skipping to game.');
        showScreen(gameScreen);
    });

    console.log('Game script loaded. Waiting for start.');
}); 