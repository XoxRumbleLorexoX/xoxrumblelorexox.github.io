// Flying Car Prototype Video Gallery
// Add or remove entries in the videos array to update the gallery

document.addEventListener('DOMContentLoaded', function () {
    var videos = [
        { type: 'youtube', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'youtube', src: 'https://www.youtube.com/embed/oHg5SJYRHA0' },
        { type: 'youtube', src: 'https://www.youtube.com/embed/tVj0ZTS4WF4' }
    ];

    var container = document.getElementById('flying-car-gallery');
    if (!container) return;

    videos.forEach(function (vid) {
        var col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';

        if (vid.type === 'youtube') {
            var iframe = document.createElement('iframe');
            iframe.src = vid.src;
            iframe.allowFullscreen = true;
            iframe.style.border = '0';
            col.appendChild(iframe);
        } else {
            var video = document.createElement('video');
            video.src = vid.src;
            video.controls = true;
            col.appendChild(video);
        }

        container.appendChild(col);
    });
});
