# Lexi

Lexi is a Javascript chess library that is used for creating fun 2D games, by using easy commands, and resources in library.


### A typical top-level directory layout

    .
    ├── src                     
    |    ├── resources                    # All Js, CSS and assets
    |    |    |── css
    |    |    |    |── codemirror-custom.css   # Customize code syntax color
    |    |    |    |── style.css               # styling of tablet and other stuff
    |    |    |  
    |    |    |── data
    |    |    |      |── fills\assets                 # images use by fill command
    |    |    |      |── songs\assets                 # mp3 file use by song command
    |    |    |      |── sounds\assets                # mp3 file use by sound command
    |    |    |      |── stamps\assets                # images use by stamp command
    |    |    | 
    |    |    |── img                     # images use in example like tablet and play button
    |    |    | 
    |    |    |── js
    |    |    |    |── commands           # define commands run by libraray 
    |    |    |    |── data               # list of all resources like images, fills, colors name, sounds and songs
    |    |    |    |── drawing-elements   # class of all drawing elements - box, circle, line, stamp, text and drawingelement parent class
    |    |    |    |── common.js          # common function like parsing string, manuplating arrays
    |    |    |    |── lexi.js            # main library file defining all contants and construct function
    |    |    |── views                   # containing all commands list and other example views
    |    ├── vendors                      # Third parties library usel
    |    |      |── codemirror-5.43.0     # Use for creating code edtior
    |    |      |── soundmanger2          # Use for play and manging sound files 
    |    ├── index.html                   # Example
    ├── LICENSE
    └── README.md


## Installation

```html
<script src='resources/js/lexi.js'></script>
<script src='resources/js/library.js'></script>

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
<script src='resources/js/commands/interactions.js'></script>
<script src='resources/js/commands/audio.js'></script>

<script src='resources/js/drawing-elements/drawingelement.js'></script>
<script src='resources/js/drawing-elements/stamp.js'></script>
<script src='resources/js/drawing-elements/text.js'></script>
<script src='resources/js/drawing-elements/box.js'></script>
<script src='resources/js/drawing-elements/circle.js'></script>
<script src='resources/js/drawing-elements/line.js'></script>
```

## Usage

>Intialize library
```js
    var library = {};
    var lexi = lexi || {};

    window.onload = function() {

      var tabletColorCanvas = document.getElementById('tablet-color');
      var tabletColorCtx = tabletColorCanvas.getContext('2d');
      tabletColorCtx.drawImage(document.getElementById('tablet-i-color'), 0, 0);

      var settings = {};
      settings.canvas = document.getElementById('tablet-canvas');
      settings.canvasScale = 0.5;

      library = new lexi.Library(settings);

    };
```

>Run code
```js
    library.runcode(code);
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

TODO: Write credits

## License

TODO: Write license