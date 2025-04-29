document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const videoPlayerScreen = document.getElementById('video-player');
    const introVideo = document.getElementById('intro-video');
    const skipVideoButton = document.getElementById('skip-video-button');
    const gameScreen = document.getElementById('game-screen');
    const startMusic = document.getElementById('start-music'); // Get the audio element
    const fullscreenPrompt = document.getElementById('fullscreen-prompt');
    const enterFullscreenButton = document.getElementById('enter-fullscreen-button');
    
    // Game screen elements
    const gameVideo = document.getElementById('game-video');
    const energyBar = document.getElementById('energy-bar');
    const energyValue = document.getElementById('energy-value');
    const boredomBar = document.getElementById('boredom-bar');
    const boredomValue = document.getElementById('boredom-value');
    const milesValue = document.getElementById('miles-value');
    const mileMarker = document.getElementById('mile-marker');
    const markerValue = document.getElementById('marker-value');
    const brakeCheckButton = document.getElementById('brake-check-button');
    const blastButton = document.getElementById('blast-button');

    // Static stars system (replacing dynamic particles)
    const particlesContainer = document.getElementById('particles-container');
    const numStars = 100; // Number of subtle stars
    
    // Initialize static stars with subtle glow effects
    function initStars() {
        // Clear any existing particles
        particlesContainer.innerHTML = '';
        
        // Create static stars
        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random star properties
            const size = Math.random() * 2 + 0.5; // Size between 0.5-2.5px
            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;
            const baseOpacity = Math.random() * 0.15 + 0.05; // Very faint
            
            // Set styles
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.left = posX + 'px';
            star.style.top = posY + 'px';
            star.style.opacity = baseOpacity.toString();
            
            // Add random animation delay for the glow effect
            const animDelay = Math.random() * 5;
            star.style.animationDelay = animDelay + 's';
            
            // Add to container
            particlesContainer.appendChild(star);
        }
    }
    
    // Initialize stars
    initStars();

    // Game state
    let gameState = {
        energy: 100,
        boredom: 0,
        milesLeft: 200,
        lastMileMarker: 0,
        gameStartTime: 0,
        alienCar: false,
        alienCarTimeout: null,
        carChecked: false,
        brakeCheckActive: false,
    };

    let musicStarted = false; // Flag to track if music has successfully started
    let userInteracted = false; // Flag for first user interaction

    // Attempt to play start music when page loads
    function attemptPlayMusic() {
        if (musicStarted) return; // Don't try if already playing
        
        startMusic.play().then(() => {
            console.log("Start music playing.");
            musicStarted = true;
        }).catch(error => {
            console.log("Start music autoplay blocked, waiting for interaction.");
            // Music will likely start on first interaction
        });
    }
    attemptPlayMusic();

    // Try playing music on the very first user interaction anywhere on the page
    function handleFirstInteraction() {
        if (!userInteracted) {
            userInteracted = true;
            console.log("First user interaction detected.");
            attemptPlayMusic(); 
            // Remove this listener after first interaction
            document.removeEventListener('click', handleFirstInteraction, true);
            document.removeEventListener('keydown', handleFirstInteraction, true);
        }
    }
    // Listen for click or keydown anywhere
    document.addEventListener('click', handleFirstInteraction, true);
    document.addEventListener('keydown', handleFirstInteraction, true);

    // Function to switch screens (simplifies music handling slightly)
    function showScreen(screenToShow) {
        // Check fullscreen again when showing a screen
        checkFullscreen(); 

        startScreen.style.display = 'none';
        videoPlayerScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        screenToShow.style.display = 'flex';

        // Stop music if not on start screen
        if (screenToShow !== startScreen && musicStarted) {
            startMusic.pause();
            startMusic.currentTime = 0;
            musicStarted = false; // Allow music to restart if we return to start screen
        } else if (screenToShow === startScreen && !musicStarted && userInteracted) {
            // If returning to start screen AND user has interacted, try playing again
             attemptPlayMusic();
        }
    }

    // --- Fullscreen Handling --- 
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    }

    function checkFullscreen() {
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // Not fullscreen - show the prompt
            fullscreenPrompt.classList.remove('hidden');
        } else {
            // Is fullscreen - hide the prompt
            fullscreenPrompt.classList.add('hidden');
        }
    }

    // Button to enter fullscreen
    enterFullscreenButton.addEventListener('click', enterFullscreen);

    // Check fullscreen state on change
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);

    // Initial check
    checkFullscreen();

    // --- Start Button & Enter Key --- 
    function triggerStart() {
        console.log('Game starting...');
        
        // 1. Stop music first
        if (musicStarted) {
            startMusic.pause();
            startMusic.currentTime = 0;
            musicStarted = false;
        }

        // 2. Add transition class to body
        const body = document.body; // Get body for adding class
        body.classList.add('transition-active');

        // 3. Set timeout to match CSS animation duration
        setTimeout(() => {
            // 4. Inside timeout: Remove transition class
            body.classList.remove('transition-active');
            
            // 5. Show video player screen
            showScreen(videoPlayerScreen);
            
            // 6. Play intro video
            introVideo.play().catch(error => {
                console.error('Video play failed:', error);
                // If video fails, maybe skip directly to game?
                // startGame(); 
            });
        }, 800); // Match the 0.8s duration of the CSS animation
    }

    startButton.addEventListener('click', triggerStart);

    // Enter key listener
    document.addEventListener('keydown', (event) => {
        // Check if the start screen is currently displayed
        if (startScreen.style.display !== 'none' && event.key === 'Enter') {
            console.log('Enter key pressed on start screen.');
            // Prevent default Enter behavior (like triggering button if focused)
            event.preventDefault(); 
            triggerStart();
        }
    });

    // --- Skip Video Button --- 
    skipVideoButton.addEventListener('click', () => {
        console.log('Skip video button clicked');
        introVideo.pause(); 
        introVideo.currentTime = 0;
        // Stop music if skipping (showScreen in startGame will handle it)
        // if (musicStarted) { startMusic.pause(); startMusic.currentTime = 0; musicStarted = false; }
        startGame();
    });

    // --- Video End --- 
    introVideo.addEventListener('ended', () => {
        console.log('Intro video finished');
        // Stop music if ending (showScreen in startGame will handle it)
        // if (musicStarted) { startMusic.pause(); startMusic.currentTime = 0; musicStarted = false; }
        startGame();
    });

    // --- Video Error Handling ---
    introVideo.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
        alert('Could not load intro video. Skipping to game.');
        // Stop music if error (showScreen in startGame will handle it)
        // if (musicStarted) { startMusic.pause(); startMusic.currentTime = 0; musicStarted = false; }
        startGame();
    });

    // Game start function
    function startGame() {
        showScreen(gameScreen); // This now handles stopping the music
        gameState.gameStartTime = Date.now();
        gameVideo.play().catch(error => {
            console.error('Game video play failed:', error);
            alert('Could not play game video. Please reload the page.');
        });
        gameLoop();
        scheduleAlienCar();
    }
    
    // Game loop - updates stats and UI
    function gameLoop() {
        if (gameState.milesLeft <= 0) {
            endGame(true); // Win
            return;
        }
        
        if (gameState.energy <= 0 || gameState.boredom >= 100) {
            endGame(false); // Lose
            return;
        }
        
        // Calculate elapsed time in seconds
        const elapsedSecs = (Date.now() - gameState.gameStartTime) / 1000;
        
        // Update miles left (at 60 miles per minute or 1 mile per second)
        gameState.milesLeft = Math.max(0, 200 - Math.floor(elapsedSecs));
        
        // Show mile marker every 60 miles
        const currentMarker = 200 - Math.floor(gameState.milesLeft / 60) * 60;
        if (currentMarker !== gameState.lastMileMarker && gameState.milesLeft % 60 === 0) {
            gameState.lastMileMarker = currentMarker;
            showMileMarker(currentMarker);
        }
        
        // Decrease energy over time
        gameState.energy = Math.max(0, gameState.energy - 0.1);
        
        // Increase boredom over time
        gameState.boredom = Math.min(100, gameState.boredom + 0.05);
        
        // Update UI
        updateUI();
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Update game UI based on current state
    function updateUI() {
        // Update values
        energyValue.textContent = `${Math.floor(gameState.energy)}%`;
        boredomValue.textContent = `${Math.floor(gameState.boredom)}%`;
        milesValue.textContent = gameState.milesLeft;

        // Remove bar updates
        // energyBar.style.width = `${gameState.energy}%`;
        // boredomBar.style.width = `${gameState.boredom}%`;
    }
    
    // Show mile marker notification
    function showMileMarker(markerNumber) {
        markerValue.textContent = markerNumber;
        mileMarker.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            mileMarker.classList.add('hidden');
        }, 3000);
    }
    
    // Schedule random alien car encounter
    function scheduleAlienCar() {
        // Random time between 5-15 seconds
        const randomTime = 5000 + Math.random() * 10000;
        
        gameState.alienCarTimeout = setTimeout(() => {
            spawnAlienCar();
        }, randomTime);
    }
    
    // Spawn an alien car encounter
    function spawnAlienCar() {
        if (gameState.milesLeft <= 0 || gameState.brakeCheckActive) return; // Don't spawn if game is over or brake check active
        
        gameState.alienCar = true;
        gameState.carChecked = false;
        
        // Visual cue that there's a car (could be a flash on screen or sound)
        gameVideo.style.filter = "brightness(1.3)";
        
        // If player doesn't react in 5 seconds, they lose energy
        setTimeout(() => {
            if (gameState.alienCar && !gameState.carChecked) {
                gameState.energy = Math.max(0, gameState.energy - 15);
                gameState.alienCar = false;
                gameVideo.style.filter = "none";
                scheduleAlienCar(); // Schedule next encounter
            }
        }, 5000);
    }
    
    // Handle brake check button
    brakeCheckButton.addEventListener('click', () => {
        if (gameState.brakeCheckActive) return;
        
        startBrakeCheck();
        
        if (!gameState.alienCar) {
            gameState.energy = Math.max(0, gameState.energy - 5);
            gameState.boredom = Math.min(100, gameState.boredom + 5);
        } else {
            gameState.carChecked = true;
        }
    });
    
    // Start the brake check effect - PAUSE VIDEO
    function startBrakeCheck() {
        gameState.brakeCheckActive = true;
        brakeCheckButton.disabled = true;
        
        // Pause the video
        gameVideo.pause();
        
        // Finish brake check after 0.5 seconds
        setTimeout(finishBrakeCheck, 500); // 500ms = 0.5 seconds
    }
    
    // Finish the brake check effect - RESUME VIDEO
    function finishBrakeCheck() {
        // Resume the video
        gameVideo.play().catch(error => {
            console.error("Error resuming video after brake check:", error);
            // Handle potential error if video can't play
        });
        
        brakeCheckButton.disabled = false;
        gameState.brakeCheckActive = false;
            
        // Process the result (alien check, etc.)
        if (gameState.alienCar && gameState.carChecked) {
             const isAlien = Math.random() > 0.3;
             if (isAlien) {
                 gameVideo.style.filter = "brightness(1) sepia(1) hue-rotate(300deg)";
                 blastButton.classList.remove('hidden');
                 setTimeout(() => {
                     if (gameState.alienCar) {
                         gameState.energy = Math.max(0, gameState.energy - 20);
                         resetCarEncounter();
                     }
                 }, 3000);
             } else {
                 gameVideo.style.filter = "brightness(1.5)";
                 setTimeout(() => {
                     gameVideo.style.filter = "none";
                     resetCarEncounter();
                 }, 1000);
             }
         } else if (gameState.alienCar && !gameState.carChecked) {
             // If an alien appeared but wasn't checked during the pause, reset it now
             gameVideo.style.filter = "none";
             resetCarEncounter();
         }
        // Note: No timeout needed here as video resumes instantly
    }
    
    // Handle blast button
    blastButton.addEventListener('click', () => {
        if (!gameState.alienCar || !gameState.carChecked) return;
        
        // Successfully blasted alien
        gameState.energy = Math.min(100, gameState.energy + 10); // Energy boost
        gameState.boredom = Math.max(0, gameState.boredom - 15); // Reduce boredom
        
        // Visual feedback
        gameVideo.style.filter = "brightness(1.5) contrast(1.2)";
        setTimeout(() => {
            resetCarEncounter();
        }, 1000);
    });
    
    // Reset car encounter state
    function resetCarEncounter() {
        gameState.alienCar = false;
        gameState.carChecked = false;
        gameVideo.style.filter = "none";
        blastButton.classList.add('hidden');
        
        // Only schedule next encounter if not in brake check
        if (!gameState.brakeCheckActive) {
            scheduleAlienCar();
        }
    }
    
    // End game function
    function endGame(isWin) {
        clearTimeout(gameState.alienCarTimeout);
        
        // Make sure video is playing if game ends abruptly during pause
        if(gameVideo.paused) {
            gameVideo.play().catch(()=>{}); // Attempt to play, ignore error on end screen
        }

        if (isWin) {
            alert("Congratulations! You've reached Area 53!");
        } else {
            if (gameState.energy <= 0) {
                alert("You ran out of energy and fell asleep at the wheel!");
            } else {
                alert("Your boredom reached maximum and you turned back home!");
            }
        }
        
        // Could redirect to a win/lose screen or restart
        location.reload(); // For now, just reload the page
    }

    console.log('Game script loaded. Waiting for start.');
}); 