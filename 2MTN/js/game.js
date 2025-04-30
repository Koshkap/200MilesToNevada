document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    // const videoPlayerScreen = document.getElementById('video-player'); // Removed
    // const introVideo = document.getElementById('intro-video'); // Removed
    // const skipVideoButton = document.getElementById('skip-video-button'); // Removed
    const gameScreen = document.getElementById('game-screen');
    const startMusic = document.getElementById('start-music'); // Get the audio element
    const fullscreenPrompt = document.getElementById('fullscreen-prompt');
    const enterFullscreenButton = document.getElementById('enter-fullscreen-button');
    const blipVideo = document.getElementById('blip-video');
    const epilepsyWarning = document.getElementById('epilepsy-warning');
    // Cutscene elements
    const cutsceneImage = document.getElementById('cutscene-image');
    const ambientSound = document.getElementById('ambient-sound');
    const engineStartSound = document.getElementById('engine-start-sound');
    const accelerationSound = document.getElementById('acceleration-sound');
    const honkSound = document.getElementById('honk-sound'); // Added
    const creepySignalSound = document.getElementById('creepy-signal-sound'); // Added for second event
    // const idleSound = document.getElementById('idle-sound'); // Removed
    const degaussOverlay = document.getElementById('degauss-overlay');
    
    // Game screen elements
    const gameVideo = document.getElementById('game-video');
    const lookBackVideo = document.getElementById('look-back-video');
    const statsContainer = document.getElementById('stats-container');
    const energyBar = document.getElementById('energy-bar');
    const energyValue = document.getElementById('energy-value');
    const boredomBar = document.getElementById('boredom-bar');
    const boredomValue = document.getElementById('boredom-value');
    const milesValue = document.getElementById('miles-value');
    const mileMarker = document.getElementById('mile-marker');
    const markerValue = document.getElementById('marker-value');
    const brakeCheckButton = document.getElementById('brake-check-button');
    const blastButton = document.getElementById('blast-button');
    const markiplierBeamButton = document.getElementById('markiplier-beam-button');
    const lookBackButton = document.getElementById('look-back-button');
    const whiteFadeOverlay = document.getElementById('white-fade-overlay');
    const cliContainer = document.getElementById('cli-container');
    const cliText = document.getElementById('cli-text');

    let accelerationHalfwayPoint = 0;
    accelerationSound.addEventListener('loadedmetadata', () => {
        accelerationHalfwayPoint = accelerationSound.duration / 2;
        console.log(`Acceleration halfway point set to: ${accelerationHalfwayPoint}`);
    });

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
        // First mirror event flags
        isBrightFlashEventActive: false,
        isAlienInMirror: false,
        mirrorEventTimeout: null,
        // Second mirror event flags
        isSecondEventActive: false,
        isSecondEventAlienSeen: false,
        isRedFlashActive: false,
        secondEventTimeout: null,
        // Third event flags (Markiplier beam)
        isThirdEventActive: false,
        thirdEventTimeout: null,
        thirdEventAutoResolveTimeout: null
    };

    let musicStarted = false; // Flag to track if music has successfully started
    let userInteracted = false; // Flag for first user interaction

    let originalLookBackSrc = ''; // Store original look back video src
    let isLookingBack = false; // Track hover state for look back button

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
        // videoPlayerScreen.style.display = 'none'; // Removed
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
        console.log('Start triggered, showing epilepsy warning...');
        
        // Stop start music immediately
        if (musicStarted) {
            startMusic.pause();
            startMusic.currentTime = 0;
            musicStarted = false;
        }
        
        // Show epilepsy warning
        epilepsyWarning.classList.remove('hidden');
        
        // After 1 second, hide warning and proceed
        setTimeout(() => {
            epilepsyWarning.classList.add('hidden');
            console.log('Epilepsy warning hidden, playing blip...');
            
            // Now play the blip video
            blipVideo.style.display = 'block'; 
            blipVideo.play().then(() => {
                // Add listener for when blip finishes
                blipVideo.onended = () => {
                    console.log('Blip finished, proceeding to cutscene...');
                    // Hide blip video again
                    blipVideo.style.display = 'none';
                    playShakeCutscene(); // Play the shake cutscene
                };
            }).catch(error => {
                console.error('Blip video play failed:', error);
                // If blip fails, hide it and maybe proceed directly to cutscene
                blipVideo.style.display = 'none'; 
                playShakeCutscene();
            });
        }, 1000); // 1 second duration for the warning
    }

    // --- New Cutscene Function ---
    function playShakeCutscene() {
        console.log('Playing shake cutscene...');
        cutsceneImage.style.display = 'block';
        
        // Start with intense shake for 0.8 seconds
        cutsceneImage.classList.add('intense-shake');

        // Play sounds (handle potential errors)
        ambientSound.volume = 0.3; // Lower volume for ambient
        engineStartSound.volume = 1.0; // Max volume for engine start
        ambientSound.play().catch(e => console.error("Ambient sound play failed:", e));
        engineStartSound.play().catch(e => console.error("Engine start sound play failed:", e));

        // After 0.8 seconds, switch to normal shake
        setTimeout(() => {
            cutsceneImage.classList.remove('intense-shake');
            cutsceneImage.classList.add('shake');
        }, 800); // 800ms = 0.8 seconds

        // Stop shake after 3 seconds total
        setTimeout(() => {
            cutsceneImage.classList.remove('shake');
            cutsceneImage.classList.remove('intense-shake'); // Ensure intense shake is also removed
        }, 3000); // 3 seconds total duration

        // Set timeout for 3 seconds total duration
        setTimeout(() => {
            console.log('Shake cutscene finished.');
            // Stop shaking (redundant but safe) and hide image
            cutsceneImage.classList.remove('shake');
            cutsceneImage.classList.remove('intense-shake');
            cutsceneImage.style.display = 'none';

            // Stop sounds
            ambientSound.pause();
            ambientSound.currentTime = 0;
            engineStartSound.pause();
            engineStartSound.currentTime = 0;

            // Proceed directly to the game
            console.log('Proceeding directly to game start...');
            startGame();

        }, 3000); // 3 seconds
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
    // REMOVED - No longer needed
    // skipVideoButton.addEventListener('click', () => { ... });

    // --- Video End --- 
    // REMOVED - No longer needed
    // introVideo.addEventListener('ended', () => { ... });

    // --- Video Error Handling ---
    // REMOVED - No longer needed
    // introVideo.addEventListener('error', (e) => { ... });

    // Game start function
    function startGame() {
        console.log("Starting game...");
        showScreen(gameScreen);

        originalLookBackSrc = lookBackVideo.src; // Store original src
        const startRate = 0.1;
        const endRate = 1.0;
        const duration = 5000; // 5 seconds in milliseconds
        let startTime = null;
        let animationFrameId = null;

        // Ensure idle sound is ready but paused
        // idleSound.load(); // Preload if not already // Removed
        // idleSound.pause(); // Removed
        // idleSound.currentTime = 0; // Removed

        // Set initial playback rate and play video
        gameVideo.playbackRate = startRate;
        gameVideo.play().catch(error => {
            console.error('Game video initial play failed:', error);
            alert('Could not play game video. Please reload the page.');
            return; // Stop if video fails
        });

        // Play acceleration sound
        accelerationSound.currentTime = 0;
        accelerationSound.play().catch(e => console.error("Acceleration sound play failed:", e));

        // Add listener to handle looping from halfway point
        accelerationSound.addEventListener('seeked', handleAccelerationSeek);

        // Animation function to increase playback rate
        function accelerateVideo(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed < duration) {
                // Calculate new rate based on elapsed time
                const progress = elapsed / duration;
                const currentRate = startRate + (endRate - startRate) * progress;
                gameVideo.playbackRate = currentRate;
                // Request next frame
                animationFrameId = requestAnimationFrame(accelerateVideo);
            } else {
                // Ensure final rate is exactly 1.0
                gameVideo.playbackRate = endRate;
                console.log("Acceleration complete. Starting game loop.");
                // Start the main game loop and alien scheduling now
                gameState.gameStartTime = Date.now(); // Reset game timer to now
                gameLoop();
                scheduleAlienCar();
            }
        }

        // Start the acceleration animation
        animationFrameId = requestAnimationFrame(accelerateVideo);

        // Add loop event listener to apply degauss effect when video loops
        gameVideo.addEventListener('seeked', handleVideoSeek);
        // Also listen for the 'loop' event directly (browsers may handle it differently)
        gameVideo.addEventListener('loop', handleVideoLoop);

        // Add look back listeners after acceleration starts
        lookBackButton.addEventListener('mouseenter', handleLookBackStart);
        lookBackButton.addEventListener('mouseleave', handleLookBackEnd);

        // Schedule the mirror event trigger 10 seconds after acceleration completes
        // (Which is when the game loop actually starts)
        const accelerationDuration = 5000; // Match the duration used in accelerateVideo
        gameState.mirrorEventTimeout = setTimeout(triggerBrightFlashEvent, accelerationDuration + 10000);
    }

    // --- Mirror Event Logic ---
    function triggerBrightFlashEvent() {
        if (gameState.milesLeft <= 0) return; // Don't trigger if game over
        console.log("Triggering bright flash mirror event...");

        gameState.isBrightFlashEventActive = true;

        // If currently looking back, don't interrupt that view
        // but set up the state so when they look again they'll see the alien
        if (!isLookingBack) {
            // Apply flashing effect to main video
            gameVideo.classList.add('bright-flash-effect');
            
            // Start honking even when in normal view
            honkSound.currentTime = 0;
            honkSound.play().catch(e => console.error("Honk sound play failed:", e));
            
            // Keep stats visible during the event
            // statsContainer.style.opacity = '0';
            // statsContainer.style.pointerEvents = 'none';
        }
    }

    function resolveMirrorAlienEvent() {
        console.log("Resolving mirror alien event...");
        
        // Determine if this is the first or second event
        if (gameState.isSecondEventActive) {
            // Resolve second event
            gameState.isSecondEventActive = false;
            gameState.isSecondEventAlienSeen = false;
            gameState.isRedFlashActive = false;
            
            // Stop sounds
            honkSound.pause();
            honkSound.currentTime = 0;
            creepySignalSound.pause();
            creepySignalSound.currentTime = 0;
            
            // Reset video effects
            gameVideo.classList.remove('red-flash-effect');
            
            // Schedule third event 10 seconds later
            console.log("Scheduling third event (Markiplier beam) in 10 seconds...");
            gameState.thirdEventTimeout = setTimeout(triggerThirdEvent, 10000);
        } else {
            // Resolve first event
            gameState.isBrightFlashEventActive = false;
            gameState.isAlienInMirror = false;
            
            // Stop honking
            honkSound.pause();
            honkSound.currentTime = 0;
            
            // Reset main video brightness
            gameVideo.classList.remove('bright-flash-effect');
            
            // Schedule second event 15 seconds later
            console.log("Scheduling second event in 15 seconds...");
            gameState.secondEventTimeout = setTimeout(triggerSecondEvent, 15000);
        }

        // If still looking back, reset to the normal look back view
        if (isLookingBack) {
            lookBackVideo.src = originalLookBackSrc;
            lookBackVideo.load();
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Normal look back video play failed:", e));
        } else {
            // If in normal view, show stats again
            statsContainer.style.opacity = '1';
            statsContainer.style.pointerEvents = 'auto';
        }
        
        // Reset look back video source if it was changed
        if (!isLookingBack && lookBackVideo.src !== originalLookBackSrc) {
            lookBackVideo.src = originalLookBackSrc;
            lookBackVideo.load(); // Important to load the new source
        }
    }

    // Handle Look Back Start (Hover)
    function handleLookBackStart() {
        isLookingBack = true;
        
        // Make look back button wider when in rear view
        lookBackButton.style.width = '75%';
        
        // Always hide stats when looking back
        statsContainer.style.opacity = '0';
        statsContainer.style.pointerEvents = 'none';
        
        if (gameState.isSecondEventActive && !gameState.isSecondEventAlienSeen) {
            // First time looking back during second event - show second alien video
            console.log("Look back during second event: Showing second alien!");
            gameState.isSecondEventAlienSeen = true;
            gameState.isRedFlashActive = true;
            
            // Show the second alien video
            lookBackVideo.src = 'fbc19ceb-e150-4cef-98ca-7dc21a376822.mp4';
            lookBackVideo.load();
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Second alien video play failed:", e));
            
            // Switch from honk to creepy signal sound
            honkSound.pause();
            honkSound.currentTime = 0;
            
            creepySignalSound.currentTime = 0;
            creepySignalSound.play().catch(e => console.error("Creepy signal sound play failed:", e));
            
            // Apply red flash effect to main video for when they exit rear view
            gameVideo.classList.remove('bright-flash-effect');
            gameVideo.classList.add('red-flash-effect');
        } else if (gameState.isSecondEventActive && gameState.isSecondEventAlienSeen) {
            // Looking back again during second event
            lookBackVideo.src = 'fbc19ceb-e150-4cef-98ca-7dc21a376822.mp4';
            lookBackVideo.load();
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Second alien video play failed:", e));
            
            // Ensure creepy sound is playing
            if (creepySignalSound.paused) {
                creepySignalSound.currentTime = 0;
                creepySignalSound.play().catch(e => console.error("Creepy signal sound play failed:", e));
            }
        } else if (gameState.isBrightFlashEventActive && !gameState.isAlienInMirror) {
            // First time looking back during the first event - show alien
            console.log("Look back during bright flash: Showing alien!");
            gameState.isAlienInMirror = true;
            lookBackVideo.src = 'b9c594fb-85a2-442e-8f62-e649c808c236.mp4';
            lookBackVideo.load(); // Load the new source
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Alien look back video play failed:", e));
            
            // Start looping honk
            honkSound.currentTime = 0;
            honkSound.play().catch(e => console.error("Honk sound play failed:", e));
        } else if (gameState.isAlienInMirror) {
            // Looking back during an active alien event - show alien again
            console.log("Looking back at alien again");
            lookBackVideo.src = 'b9c594fb-85a2-442e-8f62-e649c808c236.mp4';
            lookBackVideo.load(); // Load the source
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Alien look back video play failed:", e));
            
            // Ensure honk is playing
            if (honkSound.paused) {
                honkSound.currentTime = 0;
                honkSound.play().catch(e => console.error("Honk sound play failed:", e));
            }
        } else {
            // Normal look back (no events active)
            lookBackVideo.style.display = 'block';
            lookBackVideo.play().catch(e => console.error("Look back video play failed:", e));
        }
    }

    // Handle Look Back End (Hover Off)
    function handleLookBackEnd() {
        isLookingBack = false;
        // Reset rear view button width to default
        lookBackButton.style.width = '';
        
        // Always pause and hide the rear view video when moving away
        lookBackVideo.pause();
        lookBackVideo.style.display = 'none';
        
        if (gameState.isSecondEventAlienSeen) {
            // During second event after seeing the alien, maintain red flash
            statsContainer.style.opacity = '0';
            statsContainer.style.pointerEvents = 'none';
            
            // Make sure main video has red flash effect
            if (!gameVideo.classList.contains('red-flash-effect')) {
                gameVideo.classList.add('red-flash-effect');
            }
            
            // Make sure creepy signal sound is playing
            if (creepySignalSound.paused) {
                creepySignalSound.currentTime = 0;
                creepySignalSound.play().catch(e => console.error("Creepy signal sound play failed:", e));
            }
        } else if (gameState.isAlienInMirror) {
            // First event alien is showing, keep stats hidden
            statsContainer.style.opacity = '0';
            statsContainer.style.pointerEvents = 'none';
            
            // Make sure main video is still flashing if event is active
            if (gameState.isBrightFlashEventActive && !gameVideo.classList.contains('bright-flash-effect')) {
                gameVideo.classList.add('bright-flash-effect');
            }
            
            // Make sure honk sound is playing
            if (honkSound.paused) {
                honkSound.currentTime = 0;
                honkSound.play().catch(e => console.error("Honk sound play failed:", e));
            }
        } else if (gameState.isSecondEventActive && !gameState.isSecondEventAlienSeen) {
            // Second event active but alien not seen yet
            statsContainer.style.opacity = '1';
            statsContainer.style.pointerEvents = 'auto';
            
            // Keep bright flash effect
            if (!gameVideo.classList.contains('bright-flash-effect')) {
                gameVideo.classList.add('bright-flash-effect');
            }
            
            // Make sure honk is playing
            if (honkSound.paused) {
                honkSound.currentTime = 0;
                honkSound.play().catch(e => console.error("Honk sound play failed:", e));
            }
        } else {
            // Normal state or just flashing event (no alien yet), show stats
            statsContainer.style.opacity = '1';
            statsContainer.style.pointerEvents = 'auto';
            
            // Make sure main video is still flashing if first event is active
            if (gameState.isBrightFlashEventActive && !gameVideo.classList.contains('bright-flash-effect')) {
                gameVideo.classList.add('bright-flash-effect');
            }
            
            // Ensure correct video src is loaded for next time
            if (lookBackVideo.src !== originalLookBackSrc) {
                lookBackVideo.src = originalLookBackSrc;
                lookBackVideo.load(); 
            }
        }
    }

    // Handle video seeking/looping
    let lastTime = 0;
    function handleVideoSeek() {
        // If the time jumps back significantly, it's likely a loop
        if (gameVideo.currentTime < lastTime && Math.abs(lastTime - gameVideo.currentTime) > 1) {
            console.log("Video loop detected, applying degauss effect");
            applyDegaussEffect();
        }
        lastTime = gameVideo.currentTime;
    }

    // Handle direct loop events
    function handleVideoLoop() {
        console.log("Loop event fired directly");
        applyDegaussEffect();
    }

    // Apply the degauss effect when the video loops
    function applyDegaussEffect() {
        // Only apply if game is running (after acceleration phase)
        if (gameVideo.playbackRate < 0.9) return;

        // Apply the effect to the overlay instead of the video
        degaussOverlay.classList.add('degauss');
        
        // Remove the effect after animation completes
        setTimeout(() => {
            degaussOverlay.classList.remove('degauss');
        }, 1200); // Match the animation duration (1.2s)
    }

    const STAT_UPDATE_INTERVAL = 500; // Update stats every 500ms
    let lastStatUpdateTime = 0;

    // Game loop - updates stats and UI
    function gameLoop(timestamp) { // Pass timestamp
        if (!gameState.gameStartTime) gameState.gameStartTime = timestamp; // Initialize start time if needed
        if (!lastStatUpdateTime) lastStatUpdateTime = timestamp; // Initialize last update time

        if (gameState.milesLeft <= 0) {
            endGame(true); // Win
            return;
        }
        
        // Remove loss conditions - keep tracking stats but don't end the game
        // if (gameState.energy <= 0 || gameState.boredom >= 100) {
        //     endGame(false); // Lose
        //     return;
        // }
        
        // Update miles left (at 60 miles per minute or 1 mile per second)
        // gameState.milesLeft = Math.max(0, 200 - Math.floor(totalElapsedSecs)); // Removed
        
        // Show mile marker every 60 miles
        // const currentMarker = 200 - Math.floor(gameState.milesLeft / 60) * 60; // Removed
        // if (currentMarker !== gameState.lastMileMarker && gameState.milesLeft % 60 === 0 && gameState.milesLeft < 200) { // Removed
        //     gameState.lastMileMarker = currentMarker; // Removed
        //     showMileMarker(currentMarker); // Removed
        // } // Removed

        // --- Slower Stat Updates ---
        const delta = timestamp - lastStatUpdateTime;
        if (delta >= STAT_UPDATE_INTERVAL) {
            const updatesToApply = Math.floor(delta / STAT_UPDATE_INTERVAL);
            
            // Decrease energy over time (scaled by number of intervals missed)
            // Adjust rate as needed (0.1 per frame was fast, maybe 0.5 per 500ms?)
            gameState.energy = Math.max(0, gameState.energy - 0.5 * updatesToApply); 
            
            // Increase boredom over time (scaled by number of intervals missed)
            // Adjust rate (0.05 per frame was fast, maybe 0.2 per 500ms?)
            gameState.boredom = Math.min(100, gameState.boredom + 0.2 * updatesToApply);
            
            lastStatUpdateTime = timestamp; // Reset timer
        }
        // --- End Slower Stat Updates ---
        
        // Update UI (happens every frame for smoothness)
        updateUI();
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Update game UI based on current state
    function updateUI() {
        // Update values
        energyValue.textContent = Math.floor(gameState.energy); // Removed %
        boredomValue.textContent = Math.floor(gameState.boredom); // Removed %
        milesValue.textContent = gameState.milesLeft; // Display fixed value

        // Remove bar updates
        // energyBar.style.width = `${gameState.energy}%`;
        // boredomBar.style.width = `${gameState.boredom}%`;
    }
    
    // Show mile marker notification
    // function showMileMarker(markerNumber) { ... } // Removed function
    
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
        
        // Visual cue that there's a car (brightness flash only, no sound)
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

        if (gameState.isSecondEventActive || gameState.isAlienInMirror || gameState.isBrightFlashEventActive) {
            // Resolve either event
            resolveMirrorAlienEvent();
            // Optionally add a small reward for resolving the event
            gameState.energy = Math.min(100, gameState.energy + 5);
        } else {
            // Normal brake check logic for road cars
            startBrakeCheck();
            if (!gameState.alienCar) {
                gameState.energy = Math.max(0, gameState.energy - 5);
                gameState.boredom = Math.min(100, gameState.boredom + 5);
            } else {
                gameState.carChecked = true;
            }
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
        
        // Stop any honking if it was going
        if (!honkSound.paused) {
            honkSound.pause();
            honkSound.currentTime = 0;
        }
            
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
        clearTimeout(gameState.mirrorEventTimeout); // Clear first mirror event schedule
        clearTimeout(gameState.secondEventTimeout); // Clear second mirror event schedule
        clearTimeout(gameState.thirdEventTimeout); // Clear third event schedule
        clearTimeout(gameState.thirdEventAutoResolveTimeout); // Clear auto-resolve timeout

        // Remove video loop event listeners
        gameVideo.removeEventListener('seeked', handleVideoSeek);
        gameVideo.removeEventListener('loop', handleVideoLoop);

        // Remove look back listeners
        lookBackButton.removeEventListener('mouseenter', handleLookBackStart);
        lookBackButton.removeEventListener('mouseleave', handleLookBackEnd);

        // Remove acceleration sound loop listener
        accelerationSound.removeEventListener('seeked', handleAccelerationSeek);

        // Stop any event sounds
        honkSound.pause();
        honkSound.currentTime = 0;
        creepySignalSound.pause();
        creepySignalSound.currentTime = 0;

        // Make sure video is playing if game ends abruptly during pause
        if(gameVideo.paused) {
            gameVideo.play().catch(()=>{}); // Attempt to play, ignore error on end screen
        }

        if (isWin) {
            alert("Congratulations! You've reached Area 53!");
        } else {
            // Never show losing message - player can only win
            // Keeping code commented in case we want to restore these conditions later
            // if (gameState.energy <= 0) {
            //     alert("You ran out of energy and fell asleep at the wheel!");
            // } else {
            //     alert("Your boredom reached maximum and you turned back home!");
            // }
            
            // Just in case endGame is called with isWin=false somehow
            alert("The game has ended unexpectedly. Restarting...");
        }
        
        // Could redirect to a win/lose screen or restart
        location.reload(); // For now, just reload the page
    }

    // Function to reset acceleration loop point
    function handleAccelerationSeek() {
        // If we know the halfway point AND the time reset to near the beginning after playing
        if (accelerationHalfwayPoint > 0 && accelerationSound.currentTime < 0.1) {
            console.log("Acceleration looped, resetting to halfway");
            accelerationSound.currentTime = accelerationHalfwayPoint;
        }
    }

    // Helper function to ensure honk is playing ONLY during mirror events
    function ensureHonkPlaying() {
        // IMPORTANT: Only play honk if there's a mirror event (bright flash or alien in mirror)
        // And only during first event or second event before alien is seen
        // Never play for regular alien car encounters
        
        // Handle second event after seeing alien (creepy signal instead of honk)
        if (gameState.isSecondEventAlienSeen) {
            // Play creepy signal instead of honk
            if (creepySignalSound.paused || creepySignalSound.ended) {
                creepySignalSound.currentTime = 0;
                creepySignalSound.play().catch(e => console.error("Creepy signal sound play failed:", e));
            }
            
            // Make sure honk is stopped
            if (!honkSound.paused) {
                honkSound.pause();
                honkSound.currentTime = 0;
            }
            return;
        }
        
        // First event or second event before seeing alien
        if (!gameState.isAlienInMirror && !gameState.isBrightFlashEventActive && !gameState.isSecondEventActive) {
            // No mirror event is active, make sure honking stops
            if (!honkSound.paused) {
                honkSound.pause();
                honkSound.currentTime = 0;
            }
            return;
        }
        
        // Make sure honk is playing during mirror events (first event or second event before seeing alien)
        if (honkSound.paused || honkSound.ended) {
            honkSound.currentTime = 0;
            honkSound.play().catch(e => console.error("Honk sound play failed:", e));
        }
    }
    
    // Check honk status every second
    setInterval(ensureHonkPlaying, 1000);

    // Trigger the second alien event
    function triggerSecondEvent() {
        if (gameState.milesLeft <= 0) return; // Don't trigger if game over
        console.log("Triggering second alien event (red flash)...");

        gameState.isSecondEventActive = true;

        // If currently looking back, don't interrupt that view
        if (!isLookingBack) {
            // Apply flashing effect to main video
            gameVideo.classList.add('bright-flash-effect');
            
            // Start honking even when in normal view
            honkSound.currentTime = 0;
            honkSound.play().catch(e => console.error("Honk sound play failed:", e));
        }
    }

    // Trigger the third alien event (Markiplier beam)
    function triggerThirdEvent() {
        if (gameState.milesLeft <= 0) return; // Don't trigger if game over
        console.log("Triggering third event (Markiplier beam)...");

        gameState.isThirdEventActive = true;
        
        // Play front view alien video
        gameVideo.pause();
        gameVideo.src = '4676ad14-ac3b-44dc-9f61-51be2a1a46c8.mp4';
        gameVideo.loop = false; // Don't loop this video
        gameVideo.load();
        gameVideo.play().catch(e => console.error("Third event video play failed:", e));
        
        // Apply horror flash effect
        gameVideo.classList.add('horror-flash-effect');
        
        // Spam the creepy signal sound multiple times
        playMultipleCreepySounds();
        
        // Show the Markiplier beam button
        markiplierBeamButton.classList.remove('hidden');
        
        // Hide stats during this event
        statsContainer.style.opacity = '0';
        statsContainer.style.pointerEvents = 'none';
        
        // Make sure we can't trigger look back during this event
        lookBackButton.style.pointerEvents = 'none';
        
        // Auto-resolve after 8 seconds with fade to white
        gameState.thirdEventAutoResolveTimeout = setTimeout(resolveThirdEventWithFade, 8000);
    }
    
    // Play multiple overlapping creepy sounds
    function playMultipleCreepySounds() {
        const maxSounds = 5;
        const soundInterval = 400; // ms between sound starts
        
        for (let i = 0; i < maxSounds; i++) {
            setTimeout(() => {
                // Create a new audio element each time for overlapping sounds
                const creepySound = new Audio(creepySignalSound.src);
                creepySound.volume = 0.7; // Slightly lower volume to prevent distortion
                creepySound.play().catch(e => console.error("Multiple creepy sound play failed:", e));
            }, i * soundInterval);
        }
    }
    
    // Resolve the third event with fade to white
    function resolveThirdEventWithFade() {
        console.log("Auto-resolving third event with white fade...");
        
        // Start the white fade
        whiteFadeOverlay.classList.remove('hidden');
        whiteFadeOverlay.classList.add('fade-active');
        
        // After the fade completes, reset everything
        setTimeout(() => {
            resetAfterThirdEvent();
        }, 1500); // Match the CSS transition duration
    }
    
    // Reset everything after the third event
    function resetAfterThirdEvent() {
        console.log("Resetting after third event...");
        gameState.isThirdEventActive = false;
        
        // Hide the Markiplier beam button
        markiplierBeamButton.classList.add('hidden');
        
        // Stop all sounds
        stopAllSounds();
        
        // After 3 seconds, show CLI interface
        setTimeout(() => {
            // Display CLI container
            cliContainer.classList.remove('hidden');
            setTimeout(() => {
                cliContainer.classList.add('visible');
                
                // Start typing animation
                typeCliText();
            }, 100);
        }, 3000);
    }
    
    // Function to stop all game sounds
    function stopAllSounds() {
        // Stop all audio elements
        startMusic.pause();
        startMusic.currentTime = 0;
        
        ambientSound.pause();
        ambientSound.currentTime = 0;
        
        engineStartSound.pause();
        engineStartSound.currentTime = 0;
        
        accelerationSound.pause();
        accelerationSound.currentTime = 0;
        
        honkSound.pause();
        honkSound.currentTime = 0;
        
        creepySignalSound.pause();
        creepySignalSound.currentTime = 0;
        
        // Also stop any dynamically created audio elements that might be playing
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        console.log("All sounds stopped");
    }

    // Function to animate typing in the CLI
    function typeCliText() {
        const commands = [
            { text: "> INITIALIZING SYSTEM...", delay: 50 },
            { text: "> CONNECTING TO AREA 53 NETWORK...", delay: 80 },
            { text: "> AUTHENTICATION SUCCESSFUL", delay: 70 },
            { text: "> ACCESSING SECURE FILES...", delay: 60 },
            { text: "> LOADING Area53.MINIGAME", delay: 80 },
        ];
        
        let commandIndex = 0;
        let charIndex = 0;
        let currentText = "";
        
        // Function to type a single character
        function typeNextChar() {
            if (commandIndex >= commands.length) {
                // All commands typed, show loading bar
                showLoadingBar();
                return;
            }
            
            const command = commands[commandIndex];
            
            if (charIndex < command.text.length) {
                // Add next character to current text
                currentText += command.text.charAt(charIndex);
                cliText.innerHTML = currentText;
                charIndex++;
                
                // Schedule next character
                setTimeout(typeNextChar, command.delay);
            } else {
                // Command finished, add line break
                currentText += "<br>";
                cliText.innerHTML = currentText;
                
                // Move to next command
                commandIndex++;
                charIndex = 0;
                
                // Pause before next command
                setTimeout(typeNextChar, 500);
            }
        }
        
        // Start typing
        typeNextChar();
    }
    
    // Function to show loading bar and complete the process
    function showLoadingBar() {
        // Create loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-animation';
        loadingMsg.textContent = '> LOADING COMPLETE IN:';
        cliText.appendChild(loadingMsg);
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        cliText.appendChild(progressBar);
        
        // After animation completes, redirect
        setTimeout(() => {
            // Show final message
            const finalMsg = document.createElement('div');
            finalMsg.className = 'loading-animation';
            finalMsg.innerHTML = '<br>> LAUNCHING Area53.MINIGAME...';
            cliText.appendChild(finalMsg);
            
            // Redirect after a short pause
            setTimeout(() => {
                console.log("Redirecting to Car\\Logos.html");
                window.location.href = "Car\\Logos.html";
            }, 1500);
        }, 3000); // Match animation duration
    }

    // Handle Markiplier beam button
    markiplierBeamButton.addEventListener('click', () => {
        if (!gameState.isThirdEventActive) return;
        
        console.log("Markiplier beam activated!");
        
        // Clear the auto-resolve timeout so it doesn't trigger later
        clearTimeout(gameState.thirdEventAutoResolveTimeout);
        
        // Immediately resolve with white fade
        resolveThirdEventWithFade();
    });

    console.log('Game script loaded. Waiting for start.');
}); 