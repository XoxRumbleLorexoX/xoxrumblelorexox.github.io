// Flying Car Prototype Gallery
// Add or remove entries in the items array to update the gallery

document.addEventListener('DOMContentLoaded', function () {
    var items = [
        // Local video clips converted to lightweight GIFs (see tools/convert-to-gif.sh)
        { type: 'image', src: 'img/LatestFlyingCar/IMG_0536.gif' },
        { type: 'image', src: 'img/LatestFlyingCar/IMG_0537.gif' },
        { type: 'image', src: 'img/LatestFlyingCar/IMG_2673.gif' },
        { type: 'image', src: 'img/LatestFlyingCar/RPReplay_Final1733776361.gif' },

        
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
        } else if (item.type === 'video') {
            var video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            col.appendChild(video);
        } else if (item.type === 'image') {
            var img = document.createElement('img');
            img.src = item.src;
            img.alt = 'Flying car media';
            img.className = 'img-fluid';
            col.appendChild(img);
        }

        container.appendChild(col);
    });
});
