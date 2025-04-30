let readyForDialog = [];
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const videoPlayerScreen = document.getElementById('video-player');
    const introVideo = document.getElementById('intro-video');
    const skipVideoButton = document.getElementById('skip-video-button');
    const gameScreen = document.getElementById('game-screen');
    const dialog = document.getElementById('dialog');

    // Function to switch screens
    function showScreen(screenToShow) {
        readyForDialog = [false];
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
        readyForDialog[0] = true;
        createDialog("200 miles to nevada left . . .    Outrun the Alien Apocalypse to Area-51 Play games on your phone to stay sane.  Check your mirrors, and survive . . .");
    });

    // --- Video End --- 
    introVideo.addEventListener('ended', () => {
        console.log('Intro video finished');
        showScreen(gameScreen);  
        readyForDialog[0] = true;
        createDialog("200 miles to nevada left . . .    Outrun the Alien Apocalypse to Area-51 Play games on your phone to stay sane.  Check your mirrors, and survive . . .");
    });

    // Optional: Handle potential video loading errors
    introVideo.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
        // Maybe skip video automatically or show error
        alert('Could not load intro video. Skipping to game.');
        showScreen(gameScreen);
        readyForDialog[0] = true;
        createDialog("200 miles to nevada left . . .    Outrun the Alien Apocalypse to Area-51 Play games on your phone to stay sane.  Check your mirrors, and survive . . .");
    });

    

    console.log('Game script loaded. Waiting for start.');
}); 

function createDialog(message) {
    if (!readyForDialog[0]) return;

    const dialog = document.getElementById('dialog');
    const videoPlayerScreen = document.getElementById('video-player');
    const gameScreen = document.getElementById('game-screen');

    videoPlayerScreen.style.display = 'none';
    dialog.style.display = 'block';

    let messageArray = message.split(" ");
    let currentText = "";
    let index = 0;

    function showNextWord() {
        let waitingForClick = false;
        if (index >= messageArray.length) {
            index++;
            dialog.onclick = () => {
                if (index >= messageArray.length) {
                    dialog.style.display = 'none';
                }
            };
            return;
        }
        if ((currentText + messageArray[index] + " ").length >= 40) {   
            currentText = "";
            waitingForClick = true
            
            dialog.onclick = () => {
                if (index >= messageArray.length) {
                    dialog.style.display = 'none';
                }
                dialog.onclick = null; // Remove this listener after it's used
                currentText = "";
                if (index >= messageArray.length) return;
                showNextWord(); // Resume after click
            };
            return;
        }
        currentText += messageArray[index] + " ";
        dialog.innerHTML = `<p>${currentText}</p>`;
        index++;

        if (!waitingForClick) {
            setTimeout(showNextWord, 100);
        }
    }

    showNextWord();
}
