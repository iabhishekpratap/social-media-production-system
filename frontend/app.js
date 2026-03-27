const USER_API = 'http://127.0.0.1:8001/api/users';
const VIDEO_API = 'http://127.0.0.1:8002/api/videos';
const ANALYTICS_API = 'http://127.0.0.1:8003/api/analytics';

// Check Auth State on Load
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = document.getElementById('auth-form') !== null;
    const token = localStorage.getItem('access_token');

    if (!token && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (token && isLoginPage) {
        window.location.href = 'index.html';
    }

    if (!isLoginPage) {
        loadFeed();
    }
});

let authMode = 'login';
function toggleAuth(mode) {
    authMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
    document.getElementById('auth-submit').innerText = mode === 'login' ? 'Login' : 'Register';
}

async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errText = document.getElementById('auth-error');
    errText.innerText = 'Communicating with User Service...';

    try {
        if (authMode === 'register') {
            const res = await fetch(`${USER_API}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error('Registration failed. Username may exist.');
            authMode = 'login'; // auto switch to login mode right after
        }
        
        // Login against User Service
        const loginRes = await fetch(`${USER_API}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!loginRes.ok) throw new Error('Invalid credentials');
        
        const data = await loginRes.json();
        localStorage.setItem('access_token', data.access);
        
        // Get user details
        const meRes = await fetch(`${USER_API}/me/`, {
            headers: { 'Authorization': `Bearer ${data.access}` }
        });
        if (meRes.ok) {
            const meData = await meRes.json();
            localStorage.setItem('user_id', meData.id);
            localStorage.setItem('username', meData.username);
        }

        window.location.href = 'index.html';
    } catch (error) {
        errText.innerText = error.message;
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('upload-error').innerText = '';
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('submit-upload').disabled = false;
}

async function uploadVideo() {
    const title = document.getElementById('upload-title').value;
    const desc = document.getElementById('upload-desc').value;
    const fileInput = document.getElementById('upload-file');
    const errText = document.getElementById('upload-error');
    const progressText = document.getElementById('upload-progress');
    const btn = document.getElementById('submit-upload');

    if (!fileInput.files.length) {
        errText.innerText = 'Please select a video file.';
        return;
    }

    errText.innerText = '';
    progressText.style.display = 'block';
    btn.disabled = true;

    // Send binary files using FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('video_file', fileInput.files[0]);
    formData.append('creator_id', localStorage.getItem('user_id') || 1);

    try {
        const res = await fetch(`${VIDEO_API}/`, {
            method: 'POST',
            body: formData
            // Browsers automatically set Content-Type to multipart/form-data with boundary
        });

        if (!res.ok) throw new Error('Failed to upload video to S3 via Video Service');
        
        closeUploadModal();
        loadFeed(); // Reload feed to show new video natively embedded from S3
    } catch (error) {
        errText.innerText = error.message;
        progressText.style.display = 'none';
        btn.disabled = false;
    }
}

async function loadFeed() {
    const feedContainer = document.getElementById('video-feed');
    try {
        const res = await fetch(`${VIDEO_API}/`);
        if (!res.ok) throw new Error('Failed to fetch videos from Video Service');
        
        const videos = await res.json();
        
        if (videos.length === 0) {
            feedContainer.innerHTML = `<div class="video-placeholder"><p>No videos yet! Click + Upload to start.</p></div>`;
            return;
        }

        feedContainer.innerHTML = ''; // clear loading state

        videos.forEach(video => {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';
            wrapper.dataset.videoId = video.id;

            wrapper.innerHTML = `
                <video src="${video.s3_video_url}" class="video-player" loop playsinline></video>
                <div class="video-info">
                    <h2 class="video-title">@user_${video.creator_id}</h2>
                    <p class="video-title" style="font-size:1.1rem">${video.title || 'Untitled'}</p>
                    <p class="video-desc">${video.description || ''}</p>
                </div>
            `;
            feedContainer.appendChild(wrapper);
            
            // Allow toggling play/pause or mute via clicks
            const vidObj = wrapper.querySelector('video');
            vidObj.addEventListener('click', () => {
                if (vidObj.paused) vidObj.play();
                else vidObj.pause();
            });
        });

        // Initialize our watch time tracking logic using IntersectionObserver
        setupAnalyticsObserver();
    } catch (error) {
        feedContainer.innerHTML = `<div class="video-placeholder"><p>Error connecting to Video Service.</p></div>`;
    }
}

// ----------------------------------------------------- //
// Watch Time Analytics Tracking via IntersectionObserver
// ----------------------------------------------------- //
let watchTimers = {};

function setupAnalyticsObserver() {
    const videos = document.querySelectorAll('.video-wrapper');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const videoId = entry.target.dataset.videoId;
            const videoEl = entry.target.querySelector('video');
            
            if (entry.isIntersecting) {
                // Video came into the viewport
                videoEl.play().catch(e => console.log('Autoplay prevented by browser', e));
                watchTimers[videoId] = Date.now();
            } else {
                // Video left the viewport
                videoEl.pause();
                
                if (watchTimers[videoId]) {
                    const durationSeconds = (Date.now() - watchTimers[videoId]) / 1000;
                    if (durationSeconds > 0.5) { // Track only if watched for more than 0.5s smoothly
                        reportWatchTime(videoId, durationSeconds);
                    }
                    delete watchTimers[videoId];
                }
            }
        });
    }, {
        threshold: 0.6 // Trigger only when 60% of the video block is fully visible
    });

    videos.forEach(v => observer.observe(v));
}

function reportWatchTime(videoId, durationSeconds) {
    const userId = localStorage.getItem('user_id') || 1;
    
    // Async Fire and forget (don't block the UI thread waiting for Analytics response) 
    fetch(`${ANALYTICS_API}/record/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            video_id: videoId,
            watch_duration_seconds: durationSeconds
        })
    }).then(res => console.log(`Watch time tracked in Analytics Service for video ${videoId}!`))
      .catch(err => console.log('Analytics ping failed', err));
}
