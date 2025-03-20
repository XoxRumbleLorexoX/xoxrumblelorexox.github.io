const canvas = document.querySelector(".canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");
const frameCount = 260;

const currentFrame = (index) => `./img/Rendered/${(index+1).toString()}.jpg`;
const images = [];
let ball = {frame: 0};

for(let i = 0; i < frameCount; i++){
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

gsap.to(ball, {
    frame: frameCount -1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        scrub : true,
        pin: "canvas",
        end: "1000%",
    },
    onUpdate: render,
})
images[0].onload = render;

function render(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(images[ball.frame],0,0, canvas.width,canvas.height);

}

