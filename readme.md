## Project Description



Made Using -
* [live example](https://learning-zone.github.io/website-templates/startbootstrap-stylish-portfolio-1.0.2)

![alt text](https://github.com/learning-zone/website-templates/blob/master/assets/startbootstrap-stylish-portfolio-1.0.2.png "startbootstrap-stylish-portfolio-1.0.2")

### Convert videos to rapid-play GIFs

To create lightweight, eye‑friendly GIFs from your local videos (e.g., in `img/LatestFlyingCar/`), use the helper script:

```
chmod +x tools/convert-to-gif.sh
tools/convert-to-gif.sh img/LatestFlyingCar/*.MOV img/LatestFlyingCar/*.mov
```

Defaults: `FPS=10`, width `SCALE=720px`, infinite loop. You can override, e.g.:

```
FPS=8 SCALE=600 tools/convert-to-gif.sh img/LatestFlyingCar/IMG_0536.MOV
```

The gallery is configured to use these GIF filenames:

- `IMG_0536.gif`
- `IMG_0537.gif`
- `IMG_2673.gif`
- `RPReplay_Final1733776361.gif`

Place them in `img/LatestFlyingCar/` and the site will display them automatically.
