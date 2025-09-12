// Flying Car Prototype Gallery
// Add or remove entries in the items array to update the gallery

document.addEventListener('DOMContentLoaded', function () {
    var items = [
        // Autoplaying loops (MP4/WebM with MOV fallback). Behaves like GIF but higher quality.
        { type: 'clip', base: 'img/LatestFlyingCar/IMG_0536' },
        { type: 'clip', base: 'img/LatestFlyingCar/IMG_0537' },
        { type: 'clip', base: 'img/LatestFlyingCar/IMG_2673' },
        { type: 'clip', base: 'img/LatestFlyingCar/RPReplay_Final1733776361' },

        
        // Local images
        { type: 'image', src: 'img/LatestFlyingCar/IMG_2669.PNG' },
        { type: 'image', src: 'img/LatestFlyingCar/IMG_2670.PNG' },
        { type: 'image', src: 'img/LatestFlyingCar/IMG_2671.PNG' },
        { type: 'image', src: 'img/LatestFlyingCar/IMG_2672.PNG' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.32.05.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.32.31.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.32.45.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.32.57.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.33.21.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.33.28.png' },
        { type: 'image', src: 'img/LatestFlyingCar/Screenshot%202025-07-24%20at%2017.33.34.png' },
        // YouTube examples

    ];

    var container = document.getElementById('flying-car-gallery');
    if (!container) return;

    items.forEach(function (item) {
        var col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';

        if (item.type === 'youtube') {
            var iframe = document.createElement('iframe');
            iframe.src = item.src;
            iframe.allowFullscreen = true;
            iframe.style.border = '0';
            col.appendChild(iframe);
        } else if (item.type === 'clip') {
            // Create an autoplaying, looping, muted video with multiple sources
            var video = document.createElement('video');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.className = 'clip-video';

            // Build sources: MP4 -> WebM -> MOV (original) -> GIF fallback
            var mp4 = document.createElement('source'); mp4.src = item.base + '.mp4'; mp4.type = 'video/mp4';
            var webm = document.createElement('source'); webm.src = item.base + '.webm'; webm.type = 'video/webm';
            var mov = document.createElement('source'); mov.src = item.base + '.MOV'; mov.type = 'video/quicktime';
            video.appendChild(mp4); video.appendChild(webm); video.appendChild(mov);

            // If all fail, swap to .gif image if present, otherwise hide the tile
            // Remove tile if nothing loads within a grace period
            let loaded = false;
            video.addEventListener('loadeddata', function(){ loaded = true; }, { once: true });
            setTimeout(function(){ if (!loaded) col.remove(); }, 4000);
            video.addEventListener('error', function () {
                var img = document.createElement('img');
                img.src = item.base + '.gif';
                img.alt = 'Flying car media';
                img.className = 'img-fluid';
                col.innerHTML = '';
                col.appendChild(img);
            }, { once: true });

            col.appendChild(video);
        } else if (item.type === 'image') {
            var img = document.createElement('img');
            img.src = item.src;
            img.alt = 'Flying car media';
            img.className = 'img-fluid';
            img.addEventListener('error', function(){ col.remove(); });
            col.appendChild(img);
        }

        container.appendChild(col);
    });
});
