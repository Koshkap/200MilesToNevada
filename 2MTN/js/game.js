document.addEventListener('DOMContentLoaded', () => {
    let readyForDialog = [];
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
    const tireScreechSound = document.getElementById('tire-screech-sound'); // Added for brake check
    const markiplierScreechSound = document.getElementById('markiplier-screech-sound'); // Added for third event button
    // const idleSound = document.getElementById('idle-sound'); // Removed
    const degaussOverlay = document.getElementById('degauss-overlay');
    
    // Game screen elements
    const gameVideo = document.getElementById('game-video');
    // Set the main front view video to the new file
    if (gameVideo.src.includes('Generated File April 29, 2025 - 3_20PM.mp4') || gameVideo.getAttribute('src')?.includes('Generated File April 29, 2025 - 3_20PM.mp4')) {
        gameVideo.src = 'MainVid.mp4';
    } else if (!gameVideo.getAttribute('src')) {
        // If no src is set, set it explicitly
        gameVideo.src = 'MainVid.mp4';
    }
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
        milesLeft: 200,
        energy: 100, // Start and stay at 100
        boredom: 0,  // Start at 0 and increase
        brakeCheckActive: false,
        alienCar: false,
        carChecked: false,
        gameStartTime: null,
        lastMilesUpdateTime: null, // Timer for miles update
        lastBoredomUpdateTime: null, // Timer for boredom update - RESTORED
        lastMileMarker: 200,
        alienCarTimeout: null,
        isBrightFlashEventActive: false,
        isAlienInMirror: false,
        mirrorEventTimeout: null,
        isSecondEventActive: false,
        isSecondEventAlienSeen: false,
        secondEventTimeout: null,
        isRedFlashActive: false,
        isThirdEventActive: false,
        thirdEventTimeout: null,
        thirdEventAutoResolveTimeout: null,
        thirdEventMarkiplierClicked: false,
        isPhoneActive: false,
        lastPhoneBoredomUpdateTime: null
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
        readyForDialog = [false];
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
        
        // Create all the boxes
        fixedBox = createFixedBox();
        fixedBox2 = createSecondFixedBox(); 
        fixedBox3 = createThirdFixedBox(); // Create the third fixed box
        draggableBox = createDraggableBox();
        
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
            ambientSound.volume = 0;
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

        readyForDialog[0] = true;
        createDialog("200 miles to nevada left . . .    Outrun the Alien Apocalypse to Area-51 Play games on your phone to stay sane. Brake-Check crazy driversㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ  Check your mirrors, and survive . . .");

        

        const accelerationDuration = 5000; // Match the duration used in accelerateVideo
        gameState.mirrorEventTimeout = setTimeout(triggerBrightFlashEvent, accelerationDuration + 10000);
    }

    // Define radio station songs and current index outside the function
    // so the state persists between plays.
    const radioStation1Songs = [
        // Add the path to your first song here if it's different from the others
        "Radio/Orion.mp3", // Assuming this is the first song
        "Radio/Podcastshort - 4_30_25, 9.53 AM.mp3",
        "Radio/Rosetta Stoned.mp3"
        // Add more song paths here
    ];
    let currentRadioSongIndex = 0;
    let radioSound = null; // Initialize radioSound variable

    function playRadio() {
        radioSound = document.getElementById("radio-station-1");
        radioSound.play();
        currentRadioSongIndex = 0;
        radioSound.addEventListener("ended", () => {
            console.log("Song ended, playing next.");
            currentRadioSongIndex++;
            // Loop back to the beginning if we've gone past the last song
            if (currentRadioSongIndex >= radioStation1Songs.length) {
                currentRadioSongIndex = 0;
            }
            radioSound.src = radioStation1Songs[currentRadioSongIndex];
            radioSound.load(); // Load the new source
            radioSound.play().catch(e => console.error("Radio play failed:", e));
        });
    }

    // Function to stop the radio if needed
    function stopRadio() {
        if (radioSound && !radioSound.paused) {
            radioSound.pause();
            radioSound.currentTime = 0; // Optional: Reset to beginning
            console.log("Radio stopped.");
        }
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
            
            // Ensure all buttons are visible again
            brakeCheckButton.classList.remove('hidden');
            lookBackButton.classList.remove('hidden');
            
            // Ensure stats are visible
            statsContainer.style.opacity = '1';
            statsContainer.style.pointerEvents = 'auto';
            
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
        
        // Hide brake check button when looking back
        brakeCheckButton.classList.add('hidden');
        
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
            
            // MODIFICATION: Disable manual lookBackEnd by removing event listener
            lookBackButton.removeEventListener('mouseleave', handleLookBackEnd);
            
            // Hide all game buttons during forced look back period
            brakeCheckButton.classList.add('hidden');
            lookBackButton.classList.add('hidden');
            blastButton.classList.add('hidden');
            
            // Force return to normal view after 6 seconds
            setTimeout(() => {
                console.log("Forced return to normal view after 6 seconds");
                // Re-add the event listener for future look backs
                lookBackButton.addEventListener('mouseleave', handleLookBackEnd);
                
                // Show buttons again (except blast which should stay hidden unless needed)
                lookBackButton.classList.remove('hidden');
                brakeCheckButton.classList.remove('hidden');
                
                // Manually trigger the look back end function
                handleLookBackEnd();
            }, 6000);
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
        
        // Show brake check button again (unless third event is active)
        if (!gameState.isThirdEventActive) {
            brakeCheckButton.classList.remove('hidden');
        }
        
        if (gameState.isSecondEventAlienSeen) {
            // During second event after seeing the alien, maintain red flash
            // MODIFICATION: Show stats but keep red flash and creepy sound
            statsContainer.style.opacity = '1';
            statsContainer.style.pointerEvents = 'auto';
            
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
        if (!gameState.gameStartTime) {
            gameState.gameStartTime = timestamp;
            gameState.lastMilesUpdateTime = timestamp;
            gameState.lastBoredomUpdateTime = timestamp;
            gameState.lastPhoneBoredomUpdateTime = timestamp;
        }

        if (gameState.milesLeft <= 0 && !gameState.isThirdEventActive) {
             console.log("Reached 0 miles.");
             endGame(true);
             return;
        }

        if (gameState.boredom >= 100) {
            endGame("WasBored");
        }

        if (!gameState.isThirdEventActive && !gameState.isSecondEventActive) { 
            // triggers first event
        }

        // --- Stat Updates based on Time ---
        const MILES_INTERVAL = 5000; // 5 seconds in milliseconds
        const BOREDOM_INCREASE_INTERVAL = 3000; // 3 seconds in milliseconds - RESTORED
        const PHONE_BOREDOM_DECREASE_INTERVAL = 4000; // <<<< CHANGED: 4 seconds
        // Update Miles
        const timeSinceLastMileUpdate = timestamp - gameState.lastMilesUpdateTime;
        if (timeSinceLastMileUpdate >= MILES_INTERVAL && gameState.milesLeft > 0) {
            const milesToDecrease = Math.floor(timeSinceLastMileUpdate / MILES_INTERVAL);
            gameState.milesLeft = Math.max(0, gameState.milesLeft - milesToDecrease);
            gameState.lastMilesUpdateTime += milesToDecrease * MILES_INTERVAL;
            console.log(`Miles Left: ${gameState.milesLeft}`);
        }

        // Update Boredom based on phone interaction
        if (gameState.isPhoneActive) {
            // Phone is active - DECREASE boredom
            const timeSinceLastPhoneBoredomUpdate = timestamp - gameState.lastPhoneBoredomUpdateTime;
            if (timeSinceLastPhoneBoredomUpdate >= PHONE_BOREDOM_DECREASE_INTERVAL && gameState.boredom > 0) {
                const updatesToApply = Math.floor(timeSinceLastPhoneBoredomUpdate / PHONE_BOREDOM_DECREASE_INTERVAL);
                // VVVV CHANGED: Decrease by 1 per interval
                gameState.boredom = Math.max(0, gameState.boredom - updatesToApply);
                gameState.lastPhoneBoredomUpdateTime += updatesToApply * PHONE_BOREDOM_DECREASE_INTERVAL;
                // console.log(`Phone Active - Boredom Decreased: ${gameState.boredom}`);
            }
        } else {
            // Phone is NOT active - INCREASE boredom
            const timeSinceLastBoredomUpdate = timestamp - gameState.lastBoredomUpdateTime;
            if (timeSinceLastBoredomUpdate >= BOREDOM_INCREASE_INTERVAL && gameState.boredom < 100) {
                const boredomToIncrease = Math.floor(timeSinceLastBoredomUpdate / BOREDOM_INCREASE_INTERVAL);
                gameState.boredom = Math.min(100, gameState.boredom + boredomToIncrease);
                gameState.lastBoredomUpdateTime += boredomToIncrease * BOREDOM_INCREASE_INTERVAL;
                // console.log(`Phone Inactive - Boredom Increased: ${gameState.boredom}`);
            }
        }

        // Energy update logic remains removed, as energy should stay at 100.

        // --- Markiplier Beam Button Visibility ---
        if (gameState.milesLeft === 150 || gameState.milesLeft === 100 || gameState.milesLeft === 50 || gameState.milesLeft === 0) {
             if(markiplierBeamButton.classList.contains('hidden')) {
                 console.log(`Showing Markiplier Beam button at ${gameState.milesLeft} miles.`);
                 markiplierBeamButton.classList.remove('hidden');
             }
        } else {
            if (!markiplierBeamButton.classList.contains('hidden')) {
                markiplierBeamButton.classList.add('hidden');
            }
        }

        // Update UI
        updateUI();

        // Continue game loop
        if (gameState.milesLeft > 0 || gameState.isThirdEventActive) {
             requestAnimationFrame(gameLoop);
        }
    }

    // Update game UI based on current state
    function updateUI() {
        // Update values
        energyValue.textContent = gameState.energy; // Always 100
        boredomValue.textContent = Math.floor(gameState.boredom); // Update boredom display
        milesValue.textContent = gameState.milesLeft;

        // Ensure button visibility reflects state
        const shouldShowBeam = gameState.milesLeft === 150 || gameState.milesLeft === 100 || gameState.milesLeft === 50 || gameState.milesLeft === 0;
        if (shouldShowBeam) {
            markiplierBeamButton.classList.remove('hidden');
        } else {
            markiplierBeamButton.classList.add('hidden');
        }
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
                // gameState.energy = Math.max(0, gameState.energy - 15); // REMOVED ENERGY DECREASE
                gameState.alienCar = false;
                gameVideo.style.filter = "none";
                scheduleAlienCar(); // Schedule next encounter
            }
        }, 5000);
    }
    
    // Handle brake check button
    brakeCheckButton.addEventListener('click', () => {
        // Always return if cooldown is active
        if (brakeCheckButton.classList.contains('cooldown')) return;

        // Play tire screech sound always
        tireScreechSound.currentTime = 0;
        tireScreechSound.play().catch(e => console.error("Tire screech sound play failed:", e));

        // Start the cooldown always
        startBrakeCheckCooldown();

        // Now decide what the brake check does based on state
        if (gameState.isAlienInMirror || gameState.isSecondEventAlienSeen) {
            // Player has seen the alien in the mirror - resolve the event
            console.log("Brake check resolving mirror event (alien seen).");
            resolveMirrorAlienEvent();
            // gameState.energy = Math.min(100, gameState.energy + 5); // REMOVED ENERGY INCREASE (Reward)
        } else if (gameState.isBrightFlashEventActive || gameState.isSecondEventActive) {
            // Mirror event is active, but player hasn't looked back yet
            console.log("Brake check ineffective - need to look back first.");
            // Just sound + cooldown was applied
        } else {
            // No mirror events active - perform normal road car check
            console.log("Performing normal road car brake check.");
            if (gameState.brakeCheckActive) return; // Avoid race conditions with startBrakeCheck's own logic
            startBrakeCheck(); // Handles pausing video, etc.
            if (!gameState.alienCar) {
                // Penalty for checking a non-alien car
                // gameState.energy = Math.max(0, gameState.energy - 5); // REMOVED ENERGY DECREASE
                gameState.boredom = Math.min(100, gameState.boredom + 5); // Keep boredom penalty for now? Or remove?
            } else {
                // Correctly checked an alien car
                gameState.carChecked = true;
            }
        }
    });
    
    // Function to start the brake check cooldown
    function startBrakeCheckCooldown() {
        // Apply cooldown class to button
        brakeCheckButton.classList.add('cooldown');
        
        // Create cooldown timer container
        const cooldownContainer = document.createElement('div');
        cooldownContainer.className = 'brake-cooldown-container';
        
        // Create cooldown timer elements
        const cooldownTimer = document.createElement('div');
        cooldownTimer.className = 'brake-cooldown-timer';
        
        const cooldownSpinner = document.createElement('div');
        cooldownSpinner.className = 'brake-cooldown-spinner';
        
        const cooldownMask = document.createElement('div');
        cooldownMask.className = 'brake-cooldown-mask';
        
        // Assemble the timer
        cooldownTimer.appendChild(cooldownSpinner);
        cooldownTimer.appendChild(cooldownMask);
        cooldownContainer.appendChild(cooldownTimer);
        
        // Add to the brake check button parent
        brakeCheckButton.parentNode.appendChild(cooldownContainer);
        
        // Set up variables for the animation
        const cooldownDuration = 3000; // 3 seconds
        const startTime = Date.now();
        const updateInterval = 50; // Update every 50ms for smooth animation
        
        // Function to update the cooldown pie timer
        function updateCooldown() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / cooldownDuration, 1);
            
            // Update the pie chart
            const angle = progress * 360;
            cooldownSpinner.style.background = `conic-gradient(#0f0 ${angle}deg, transparent ${angle}deg)`;
            
            if (progress < 1) {
                // Continue updating
                setTimeout(updateCooldown, updateInterval);
            } else {
                // End cooldown
                brakeCheckButton.classList.remove('cooldown');
                cooldownContainer.remove();
            }
        }
        
        // Start the update loop
        updateCooldown();
    }
    
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
        // Only reward if checking an actual alien car
        if (gameState.alienCar && gameState.carChecked) {
            // Correct check
            // gameState.energy = Math.min(100, gameState.energy + 10); // REMOVED ENERGY INCREASE (Energy boost)
            // Reduce boredom slightly for successful action
            gameState.boredom = Math.max(0, gameState.boredom - 10);
        }
        
        // Reset encounter state AFTER checking reward/penalty
        resetCarEncounter();

        // Restart game video
        gameVideo.play().catch(e => console.error("Game video play failed after brake check:", e));
        gameState.brakeCheckActive = false;
    }
    
    // Handle blast button - This event listener remains but blast button is never shown now
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
        // gameState.energy = Math.min(100, gameState.energy + 10); // REMOVED ENERGY INCREASE (Energy boost) - Seems redundant here anyway
        scheduleAlienCar(); // Schedule the next one
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
        if (isWin === "WasBored") {
            alert("You swerved into oncoming traffic out of boredom. Game Over.");
        } else if (isWin) {
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
        
        // Hide ALL buttons initially
        brakeCheckButton.classList.add('hidden');
        lookBackButton.classList.add('hidden');
        markiplierBeamButton.classList.add('hidden'); // Hide this too initially
        
        // Hide stats during this event
        statsContainer.style.opacity = '0';
        statsContainer.style.pointerEvents = 'none';
        
        // Make sure we can't trigger look back during this event
        lookBackButton.style.pointerEvents = 'none';
        
        // After 3 seconds, show ONLY the Markiplier beam button
        setTimeout(() => {
            console.log("Showing Markiplier beam button after 3-second delay");
            markiplierBeamButton.classList.remove('hidden');
        }, 3000);
        
        // Auto-resolve after 8 seconds with fade to white (unchanged timing)
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
        
        tireScreechSound.pause();
        tireScreechSound.currentTime = 0;
        
        markiplierScreechSound.pause();
        markiplierScreechSound.currentTime = 0;
        
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
        
        // Play the screech sound
        markiplierScreechSound.currentTime = 0;
        markiplierScreechSound.play().catch(e => console.error("Markiplier screech sound play failed:", e));
        
        // Clear the auto-resolve timeout so it doesn't trigger later
        clearTimeout(gameState.thirdEventAutoResolveTimeout);
        
        // Immediately resolve with white fade
        resolveThirdEventWithFade();
    });

    function createDialog(message) {
        if (!readyForDialog[0]) return;
    
        const dialog = document.getElementById('dialog');
        // const videoPlayerScreen = document.getElementById('video-player');
        const gameScreen = document.getElementById('game-screen');
    
        // videoPlayerScreen.style.display = 'none';
        dialog.style.display = 'inline-block';
    
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
                        playRadio();
                        readyForDialog[0] = false;
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

    console.log('Game script loaded. Waiting for start.');

    // Create a fixed transparent box for the front view
    function createFixedBox() {
        // Create image element that will be toggled
        const toggleImage = document.createElement('img');
        toggleImage.id = 'toggle-image';
        toggleImage.src = 'image-removebg-preview.png';
        toggleImage.style.position = 'absolute';
        toggleImage.style.left = '50%';
        toggleImage.style.top = '50%';
        toggleImage.style.transform = 'translate(-50%, -50%)';
        toggleImage.style.maxWidth = '80%';
        toggleImage.style.maxHeight = '80%';
        toggleImage.style.zIndex = '999';
        toggleImage.style.display = 'none'; // Initially hidden
        toggleImage.style.pointerEvents = 'none'; // Don't block clicks
        
        // Add image to game screen
        gameScreen.appendChild(toggleImage);
        
        // Create the box element
        const box = document.createElement('div');
        box.id = 'fixed-box';
        box.style.position = 'absolute';
        box.style.width = '310px';
        box.style.height = '110px';
        box.style.left = '1140px';
        box.style.top = '443px';
        box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Very slight background for visibility
        box.style.border = '2px solid #00ff00';
        box.style.zIndex = '1000';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.color = '#00ff00';
        box.style.fontFamily = 'monospace';
        box.style.fontSize = '12px';
        box.style.userSelect = 'none';
        box.style.pointerEvents = 'auto'; // Make it clickable
        box.style.cursor = 'pointer'; // Show pointer cursor on hover
        gameState.isPhoneActive = false;
        // Create the info display
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'box-info';
        infoDisplay.innerHTML = `
            Size: 310x110<br>
            Pos: 1140,443
        `;
        box.appendChild(infoDisplay);
        
        // Track toggle state
        let imageVisible = false;
        // Track original and alternate sizes
        const originalSize = { width: '310px', height: '110px', left: '1140px', top: '443px' };
        const alternateSize = { width: '383px', height: '23px', left: '55px', top: '712px' };
        let isAlternateSize = false;
        
        // Add click event
        box.addEventListener('click', () => {
            
            console.log('Box clicked!');
            
            if (gameState.isPhoneActive) {
                gameState.isPhoneActive = false;
            } else {
                gameState.isPhoneActive = true;
            }
            // Toggle image visibility
            imageVisible = !imageVisible;
            toggleImage.style.display = imageVisible ? 'block' : 'none';
            
            // Toggle box size and position
            isAlternateSize = !isAlternateSize;
            if (isAlternateSize) {
                box.style.width = alternateSize.width;
                box.style.height = alternateSize.height;
                box.style.left = alternateSize.left;
                box.style.top = alternateSize.top;
            } else {
                box.style.width = originalSize.width;
                box.style.height = originalSize.height;
                box.style.left = originalSize.left;
                box.style.top = originalSize.top;
            }
            
            // Update the info display
            infoDisplay.innerHTML = isAlternateSize ? 
                `Size: 383x23<br>Pos: 55,712` : 
                `Size: 310x110<br>Pos: 1140,443`;
            
            // Flash the box as visual feedback
            box.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            setTimeout(() => {
                box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }, 200);
        });
        
        // Add the box to the game screen
        gameScreen.appendChild(box);
        
        // Function to show/hide box based on conditions
        function updateBoxVisibility() {
            // Only show when in front view (not looking back or during special events)
            if (isLookingBack || gameState.isThirdEventActive) {
                box.style.display = 'none';
                // Also hide the image when not in front view
                toggleImage.style.display = 'none';
            } else {
                box.style.display = 'flex';
                // Only show the image if it was previously visible and we're returning to front view
                if (imageVisible) {
                    toggleImage.style.display = 'block';
                }
            }
        }
        
        // Set up visibility checks
        setInterval(updateBoxVisibility, 100);
        
        // Return the box reference
        return box;
    }
    
    // Variable to store box reference
    let fixedBox;
    
    // Create a draggable and resizable box
    function createDraggableBox() {
        // Create the box element
        const box = document.createElement('div');
        box.id = 'draggable-box';
        box.style.position = 'absolute';
        box.style.width = '150px';
        box.style.height = '150px';
        box.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        box.style.border = '2px solid #00ff00';
        box.style.zIndex = '1000';
        box.style.cursor = 'move';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.color = '#00ff00';
        box.style.fontFamily = 'monospace';
        box.style.fontSize = '12px';
        box.style.userSelect = 'none';
        
        // Create the info display
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'box-info';
        box.appendChild(infoDisplay);
        
        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '10px';
        resizeHandle.style.height = '10px';
        resizeHandle.style.right = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.backgroundColor = '#00ff00';
        resizeHandle.style.cursor = 'nwse-resize';
        box.appendChild(resizeHandle);
        
        // Center the box in the game screen
        const centerBox = () => {
            const gameScreenRect = gameScreen.getBoundingClientRect();
            box.style.left = (gameScreenRect.width / 2 - 75) + 'px';
            box.style.top = (gameScreenRect.height / 2 - 75) + 'px';
            updateInfoDisplay();
        };
        
        // Add the box to the game screen
        gameScreen.appendChild(box);
        centerBox();
        
        // Variables for dragging
        let isDragging = false;
        let isResizing = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let boxStartX = 0;
        let boxStartY = 0;
        let boxStartWidth = 150;
        let boxStartHeight = 150;
        
        // Update info display
        function updateInfoDisplay() {
            const boxRect = box.getBoundingClientRect();
            const gameScreenRect = gameScreen.getBoundingClientRect();
            const relX = boxRect.left - gameScreenRect.left;
            const relY = boxRect.top - gameScreenRect.top;
            
            infoDisplay.innerHTML = `
                Size: ${Math.round(boxRect.width)}x${Math.round(boxRect.height)}<br>
                Pos: ${Math.round(relX)},${Math.round(relY)}
            `;
        }
        
        // Event listeners for dragging
        box.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) {
                // Resize logic
                isResizing = true;
                boxStartWidth = box.offsetWidth;
                boxStartHeight = box.offsetHeight;
            } else {
                // Drag logic
                isDragging = true;
                box.style.cursor = 'grabbing';
            }
            
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            boxStartX = box.offsetLeft;
            boxStartY = box.offsetTop;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                
                box.style.left = (boxStartX + dx) + 'px';
                box.style.top = (boxStartY + dy) + 'px';
                
                updateInfoDisplay();
            } else if (isResizing) {
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                
                const newWidth = Math.max(50, boxStartWidth + dx);
                const newHeight = Math.max(50, boxStartHeight + dy);
                
                box.style.width = newWidth + 'px';
                box.style.height = newHeight + 'px';
                
                updateInfoDisplay();
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
            box.style.cursor = 'move';
        });
        
        // Update on window resize
        window.addEventListener('resize', updateInfoDisplay);
        
        // Function to show/hide the box based on conditions
        function updateBoxVisibility() {
            // Only show when in front view (not looking back or during special events)
            if (isLookingBack || gameState.isThirdEventActive) {
                box.style.display = 'none';
            } else {
                box.style.display = 'flex';
            }
        }
        
        // Set up visibility checks
        setInterval(updateBoxVisibility, 100);
        
        // Return the box for reference
        return box;
    }
    
    // Variable to store box reference
    let draggableBox;

    // Create a second fixed transparent box for the front view
    function createSecondFixedBox() {
        // Create the box element
        const box = document.createElement('div');
        box.id = 'fixed-box-2';
        box.style.position = 'absolute';
        box.style.width = '142px';
        box.style.height = '89px';
        box.style.left = '1181px';
        box.style.top = '991px';
        box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Very slight background for visibility
        box.style.border = '2px solid #00ff00';
        box.style.zIndex = '1000';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.color = '#00ff00';
        box.style.fontFamily = 'monospace';
        box.style.fontSize = '12px';
        box.style.userSelect = 'none';
        box.style.pointerEvents = 'auto'; // Make it clickable
        box.style.cursor = 'pointer'; // Show pointer cursor on hover
        
        // Create the info display
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'box-info-2';
        infoDisplay.innerHTML = `
            Size: 142x89<br>
            Pos: 1181,991
        `;
        box.appendChild(infoDisplay);
        
        // Add click event
        box.addEventListener('click', () => {
            console.log('Box 2 clicked!');
            // Flash the box as visual feedback
            box.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            setTimeout(() => {
                box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }, 200);
        });
        
        // Add the box to the game screen
        gameScreen.appendChild(box);
        
        // Function to show/hide box based on conditions
        function updateBoxVisibility() {
            // Only show when in front view (not looking back or during special events)
            if (isLookingBack || gameState.isThirdEventActive) {
                box.style.display = 'none';
            } else {
                box.style.display = 'flex';
            }
        }
        
        // Set up visibility checks
        setInterval(updateBoxVisibility, 100);
        
        // Return the box reference
        return box;
    }

    // Variable to store the second box reference
    let fixedBox2;

    // Create a third fixed transparent box for the front view
    function createThirdFixedBox() {
        // Create the box element
        const box = document.createElement('div');
        box.id = 'fixed-box-3';
        box.style.position = 'absolute';
        box.style.width = '425px';
        box.style.height = '75px';
        box.style.left = '1090px';
        box.style.top = '877px';
        box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Very slight background for visibility
        box.style.border = '2px solid #00ff00';
        box.style.zIndex = '1000';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.color = '#00ff00';
        box.style.fontFamily = 'monospace';
        box.style.fontSize = '12px';
        box.style.userSelect = 'none';
        box.style.pointerEvents = 'auto'; // Make it clickable
        box.style.cursor = 'pointer'; // Show pointer cursor on hover
        
        // Create the info display
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'box-info-3';
        infoDisplay.innerHTML = `
            Size: 425x75<br>
            Pos: 1090,877
        `;
        box.appendChild(infoDisplay);
        
        // Add click event
        box.addEventListener('click', () => {
            console.log('Box 3 clicked!');
            // Flash the box as visual feedback
            box.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            setTimeout(() => {
                box.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }, 200);
        });
        
        // Add the box to the game screen
        gameScreen.appendChild(box);
        
        // Function to show/hide box based on conditions
        function updateBoxVisibility() {
            // Only show when in front view (not looking back or during special events)
            if (isLookingBack || gameState.isThirdEventActive) {
                box.style.display = 'none';
            } else {
                box.style.display = 'flex';
            }
        }
        
        // Set up visibility checks
        setInterval(updateBoxVisibility, 100);
        
        // Return the box reference
        return box;
    }
    
    // Variable to store the third box reference
    let fixedBox3;
}); 
