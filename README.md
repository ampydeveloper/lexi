# Lexi

Lexi is a javascript library that is used for creating fun 2D games, by using easy commands and resources in library.


## Files Included

>Source structure:

    .
    ├── src                     
    |    ├── resources                    # All written Javascript, CSS, images and HTML are included here
    |    |    |── css
    |    |    |    |── codemirror-custom.css  # Custom codemirror styles
    |    |    |    |── style.css              # Styling of document file index.html 
    |    |    |  
    |    |    |── data
    |    |    |    |── fills/assets           # Fill command images
    |    |    |    |── songs/assets           # Song command mp3 files
    |    |    |    |── sounds/assets          # Sound command mp3 files
    |    |    |    |── stamps/assets          # Stamp command images
    |    |    | 
    |    |    |── img                       # Images use in document file like tablet and play button
    |    |    | 
    |    |    |── js
    |    |    |    |── commands               # All Drawing, General, Interactions, Audio and Dot commands are writen here
    |    |    |    |── data                   # List of all resources like images, fills, colors names, sounds and songs used by commands
    |    |    |    |── drawing-elements       # Class of all drawing elements - box, circle, line, stamp, text and drawingelement parent class
    |    |    |    |── common.js              # Common functions like parsing string, manipulating arrays used in library
    |    |    |    |── lexi.js                # Main library file defining all constants and construct functions
    |    |    |── views                     # Containing all commands views and sample views
    |    ├── vendors                      # Third parties libraries
    |    |    |── codemirror-5.43.0         # Use for creating code editor
    |    |    |── soundmanger2              # Use for play and manging sound files
    |    ├── index.html                   # Document file presenting all commands and its examples
    ├── LICENSE
    └── README.md


## Installation

```html
<script src='resources/js/lexi.js'></script>

<link rel="stylesheet" href="vendors/codemirror-5.43.0/codemirror.css" />
<script src='vendors/codemirror-5.43.0/codemirror-5.43.0-compiled.js'></script>
<script src='vendors/soundmanager2/soundmanager2.js'></script>
<script src='vendors/soundmanager2/soundmanager2_settings.js'></script>

<script src='resources/js/data/googlefonts.js'></script>
<script src='resources/js/data/fonts.js'></script>
<script src='resources/js/data/sounds.js'></script>
<script src='resources/js/data/songs.js'></script>
<script src='resources/js/data/stamps.js'></script>
<script src='resources/js/data/stampList.js'></script>
<script src='resources/js/data/colors.js'></script>
<script src='resources/js/data/pictures.js'></script> 

<script src='resources/js/common.js'></script>
<script src='resources/js/commands/command.js'></script>
<script src='resources/js/commands/drawingcommands.js'></script>
<script src='resources/js/commands/generalcommands.js'></script>
<script src='resources/js/commands/audio.js'></script>

<script src='resources/js/drawing-elements/drawingelement.js'></script>
<script src='resources/js/drawing-elements/stamp.js'></script>
<script src='resources/js/drawing-elements/text.js'></script>
<script src='resources/js/drawing-elements/box.js'></script>
<script src='resources/js/drawing-elements/circle.js'></script>
<script src='resources/js/drawing-elements/line.js'></script>
```

## Usage

>Initialize library
```js
    var LexiLibrary = {};
    var lexi = lexi || {};

    window.onload = function() {

      var tabletColorCanvas = document.getElementById('tablet-color');
      var tabletColorCtx = tabletColorCanvas.getContext('2d');
      tabletColorCtx.drawImage(document.getElementById('tablet-i-color'), 0, 0);

      var settings = {};
      settings.canvas = document.getElementById('tablet-canvas');
      settings.canvasScale = 0.5;

      LexiLibrary = new lexi.Library(settings);

    };
```

>Run code
```js
    LexiLibrary.runcode(code);
```
## Built With

* [CodeMirror](https://codemirror.net) - codemirror-5.43.0
* [SoundManager2](http://www.schillmania.com/projects/soundmanager2) - soundmanager2

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
