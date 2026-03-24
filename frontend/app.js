const USER_API = "http://localhost:8001/api/users";
const VIDEO_API = "http://localhost:8002/api/videos";

let token = localStorage.getItem("token") || null;
let userId = localStorage.getItem("user_id") || null;

if (token) {
    showFeed();
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
        const res = await fetch(`${USER_API}/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            token = data.token;
            userId = data.user_id;
            localStorage.setItem("token", token);
            localStorage.setItem("user_id", userId);
            showFeed();
        } else {
            alert("Login failed. Check credentials.");
        }
    } catch (err) {
        alert("Error connecting to server");
    }
}

async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
        const res = await fetch(`${USER_API}/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            alert("Registered successfully! Now please log in.");
        } else {
            alert("Registration failed");
        }
    } catch (err) {
        alert("Error connecting to server");
    }
}

function showFeed() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("video-feed-container").style.display = "flex";
    loadVideos();
}

async function loadVideos() {
    try {
        const res = await fetch(`${VIDEO_API}/`);
        const videos = await res.json();
        const feed = document.getElementById("video-feed");
        feed.innerHTML = "";
        
        videos.forEach(vid => {
            const vidContainer = document.createElement("div");
            vidContainer.className = "video-container";
            const mediaUrl = vid.video_file.startsWith('http') ? vid.video_file : `http://localhost:8002${vid.video_file}`;
            vidContainer.innerHTML = `
                <video src="${mediaUrl}" loop onclick="this.paused ? this.play() : this.pause()"></video>
                <div class="video-info">
                    <h3>${vid.title}</h3>
                </div>
            `;
            feed.appendChild(vidContainer);
        });
    } catch (err) {
        console.error("Error loading videos", err);
    }
}

async function uploadVideo() {
    const file = document.getElementById("video-upload").files[0];
    if (!file) return;

    if (!token) return alert("Must be logged in to upload");

    const title = prompt("Enter a video title:");
    if (!title) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video_file", file);
    formData.append("author_id", userId);

    try {
        const res = await fetch(`${VIDEO_API}/`, {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            alert("Video uploaded successfully!");
            document.getElementById("video-upload").value = ''; // Reset input
            loadVideos();
        } else {
            alert("Upload failed");
        }
    } catch (err) {
        alert("Upload failed. Error connecting to server.");
    }
}
