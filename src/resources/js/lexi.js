var lexi = lexi || {};

lexi.strings = lexi.strings || {};
lexi.MAX_LINE_WIDTH = 40;
lexi.MIN_LINE_WIDTH = 0;
lexi.INITIAL_LINE_WIDTH = 2;

var LEFT = 'left';
var DOWN = 'down';
var RIGHT = 'right';
var UP = 'up';
var NORTH = 'north';
var SOUTH = 'south';
var EAST = 'east';
var WEST = 'west';
var CENTER = 'center';
var NORTHEAST = 'northeast';
var SOUTHEAST = 'southeast';
var NORTHWEST = 'northwest';
var SOUTHWEST = 'southwest';

lexi.googleFonts = {};

var compassDirections = {'north': true, 'south': true, 'east': true,
                         'west': true, 'northeast': true, 'southeast': true,
                         'northwest': true, 'southwest': true, 'up': true,
                         'down': true};

lexi.bind = function(fn, selfObj, var_args) {
  var boundArgs = fn.boundArgs_;
  if (arguments.length > 2) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (boundArgs) { args.unshift.apply(args, boundArgs); }
    boundArgs = args;
  }
  selfObj = fn.boundSelf_ || selfObj;
  fn = fn.boundFn_ || fn;
  var newfn;
  var context = selfObj || goog.global;
  if (boundArgs) {
    newfn = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift.apply(args, boundArgs);
      return fn.apply(context, args);
    };
  } else {
    newfn = function() {
      return fn.apply(context, arguments);
    };
  }
  newfn.boundArgs_ = boundArgs;
  newfn.boundSelf_ = selfObj;
  newfn.boundFn_ = fn;
  return newfn;
};


lexi.inherits = function(childCtor, parentCtor) {
  /**
   * Temporary constructor for inherits.
   */
  function TempCtor() {
  }
  TempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new TempCtor();
  childCtor.prototype.constructor = childCtor;
};


lexi.base = function(a, b) {
  var c = arguments.callee.caller;
  if (c.superClass_) {
    return c.superClass_.constructor.apply(
      a, Array.prototype.slice.call(arguments, 1));
  }
  for (var d = Array.prototype.slice.call(arguments, 2), e = false,
      f = a.constructor;f;f = f.superClass_ && f.superClass_.constructor) {
    if (f.prototype[b] === c) {
      e = true;
    } else if (e) {
      return f.prototype[b].apply(a, d);
    }
  }
  if (a[b] === c) {
    return a.constructor.prototype[b].apply(a, d);
  }
  throw Error('lexi.base called from a method of one name ' +
              'to a method of a different name.');
};


lexi.assetsController = {};

lexi.assetsController.isFontAvailable = function(fontName) {
  var width;
  var body = document.body;

  var container = document.createElement('span');
  container.innerHTML = Array(100).join('wi');
  container.style.cssText = [
    'position:absolute',
    'width:auto',
    'font-size:128px',
    'left:-99999px'
  ].join(' !important;');

  var getWidth = function (fontFamily) {
    container.style.fontFamily = fontFamily;

    body.appendChild(container);
    width = container.clientWidth;
    body.removeChild(container);

    return width;
  };

  var monoWidth  = getWidth('monospace');
  var serifWidth = getWidth('serif');
  var sansWidth  = getWidth('sans-serif');
  
  return monoWidth !== getWidth(fontName + ',monospace') ||
    sansWidth !== getWidth(fontName + ',sans-serif') ||
    serifWidth !== getWidth(fontName + ',serif');
};



lexi.Library = function(optional_settings) {
  var settings = optional_settings || {};

  this.window_ = settings['window'] || window;
  this.document_ = settings['document'] || window.document;
  this.onError_ = settings['onError'] || null;
  this.onAssetLoadError_ = settings['onAssetLoadError'] || null;
  this.soundManager_ = settings['soundManager'] || this.window_.soundManager;
  this.url_ = settings['url'] || '' + this.window_.location;

  this.initialLineWidth_ = lexi.INITIAL_LINE_WIDTH;
  this.initialTextAlign_ = LEFT;
  this.lineWidth_ = this.initialLineWidth_;
  this.textAlign_ = this.initialTextAlign_;
  this.loadedSounds_ = {};
  this.initialStrokeStyle_ = '#000';
  this.initialFillStyle_ = '#000';
  this.initialFontFace_ = 'Roboto';
  this.initialFontSize_ = 40;
  this.canvasScale_ = settings['canvasScale'] || 1;


  this.canvas_ = settings['canvas'];
  if (!this.canvas_) {
    this.canvas_ = this.document_.createElement(
        this.window_.navigator.isCocoonJS ?
            'screencanvas' : 'canvas', { 'antialias': true });
    this.canvas_.width = 768;
    this.canvas_.height = 1024;
    this.canvas_.style.position = 'absolute';
    this.canvas_.style.top = '0px';
    this.canvas_.style.left = '0px';
    this.canvas_.style.zIndex = '-1';
    this.canvas_.style.width = this.canvas_.width * this.canvasScale_ + 'px';
    this.canvas_.style.height = this.canvas_.height * this.canvasScale_ + 'px';
    if (this.window_.navigator.isCocoonJS) {
      this.canvas_.style.cssText = 'idtkscale:ScaleAspectFit;';
    }
    this.document_.body.appendChild(this.canvas_);
  }

  this.ctx_ = this.canvas_.getContext('2d');
  this.width_ = this.canvas_.width;
  this.height_ = this.canvas_.height;
  this.largestZ_ = 0;
  this.stampsByName_ = {};
  this.picturesByName_ = {};
  this.needsRedraw_ = false;
  this.fillStyleOnReset_ = 'white';

  // Initialize our stamps.
  this.initializeStamps_();

  this.cursor_ = {};
  this.cursor_.x = this.width_ / 2;
  this.cursor_.y = this.height_ / 2;

  this.stateLog = {};

  this.resetLibrary();


  this.isIPad_ = navigator.userAgent.match(/iPad/i) !== null;

  // Attach our event listeners.
  var boundOnTouchStart = lexi.bind(this.onTouchStart_, this);
  var boundOnTouchMove = lexi.bind(this.onTouchMove_, this);
  var boundOnTouchEnd = lexi.bind(this.onTouchEnd_, this);
  this.canvas_.addEventListener('touchstart', boundOnTouchStart);
  this.canvas_.addEventListener('touchmove', boundOnTouchMove);
  this.canvas_.addEventListener('touchend', boundOnTouchEnd);

  var boundOnMouseDown = lexi.bind(this.onMouseDown_, this);
  var boundOnMouseUp = lexi.bind(this.onMouseUp_, this);
  var boundOnMouseMove = lexi.bind(this.onMouseMove_, this);
  this.canvas_.addEventListener('mousedown', boundOnMouseDown);
  this.canvas_.addEventListener('mousemove', boundOnMouseMove);
  this.canvas_.addEventListener('mouseup', boundOnMouseUp);

  this.loadStampImage_('nuke');
  this.loadStampImage_('pop');
  this.loadStampImage_('splash');
  this.loadStampImage_('fire');
  this.loadStampImage_('pow');
  this.preloadSounds_();


  this.collabPath_ = settings['collabPath'];
  this.collabId_ = ('' + Math.random()).replace('0.', '');
  this.setCollabPath(this.collabPath_);
  this.customAssetHash_ = settings['customAssetHash'] || undefined;


  var fontList = lexi.googleFontsNames || [];

  // if (lexi.isFeatureFlagOn('googleFonts')) {
    for (var i = 0; i < fontList.length; i++) {
      var fontName = fontList[i];
      var cleanName = this.getCleanName_(fontName);
      lexi.googleFonts[cleanName] = '"' + fontName + '"';
    }
  // }

  this.googleFontLoadStatus_ = {};

  this.numberOfStampLoadErrors = 0;
  this.googleFontLoadIntervalIds_ = {};

  var boundOnTick = lexi.bind(this.onTick_, this);
  this.frameRate_ = 20;
  this.frameLength_ = 1000 / this.frameRate_;
  this.window_.setInterval(boundOnTick, this.frameLength_);

  this.impactHasLoaded_ = false;
  this.loadingImpactFont_ = false;
};


lexi.Library.prototype.runcode =  function(code) {
  code = code.replace(/´/g, "'");
  var assetsArray = code.match(/(["'])(?:\\\1|.)*?\1/g) || [];

  this.resetLibrary();
  this.silence();

  // Execute the code.
  var runNow = lexi.bind(function() {
    try {
      var runcode = window.eval(code);
    } catch (e) {
      console.error("error on eval", e);
    }
  }, this);

 
  this.loadAssets_(assetsArray, runNow);
}


/**
 * Tells the library what datastore path should be used for exchanging set/get
 * calls between multiple users of the same app.
 * @param {string} path The datastore path.
 */
lexi.Library.prototype.setCollabPath = function(path) {
  
  // Attempt to get an already established firebase object, either from the
  // top frame or the window.
  var existingFirebaseObject = null;
  // if (lexi.canAccessTopFrame()) {
  //   existingFirebaseObject = top['firebase'];
  // } else {
  //   existingFirebaseObject = window['firebase'];
  // }
  
  // if (existingFirebaseObject && path) {

  //   if (this.collabRef_) {
  //     this.collabRef_.off('child_added', this.onCollab_);
  //     this.collabRef_.remove();
  //   }

  //   this.collabPath_ = path;
  //   this.collabRef_ = existingFirebaseObject.database().ref(this.collabPath_);
  //   this.onCollab_ = function(childSnapshot) {

  //     var command = childSnapshot.val();
  //     if (window && window.get) {
  //       if (command['collabId'] !== this.collabId_) {
  //         if (window.get && (typeof window.get === 'function')) {
  //           try {
  //             window.get(command['args'][0],
  //                        command['args'][1],
  //                        command['args'][2],
  //                        command['args'][3]);
  //           } catch (e) {
  //             if (this.onError_) {
  //               this.onError_(e);
  //             }
  //           }
  //         }
  //       }
  //     }

  //   }.bind(this);

  //   this.collabRef_.on('child_added', this.onCollab_);
  //   this.collabRef_.onDisconnect().remove();
  // }
};


/**
 * Sets the JS error handling routine.
 * @param {function} onError The function to call if there's a JS error.
 */
lexi.Library.prototype.setOnErrorHandler = function(onError) {
  this.onError_ = onError;
};


/**
 * Sets the JS "code ran successfully" handling routine.
 * @param {function} onSuccess The function to call if there is NOT a JS error.
 */
lexi.Library.prototype.setOnSuccessHandler = function(onSuccess) {
  this.onSuccess_ = onSuccess;
};


/**
 * Sets the error handler for assets that fail to load.
 * @param {function} onAssetLoadError The function to call if an asset
 *     doesn't load.
 */
lexi.Library.prototype.setOnAssetLoadErrorHandler = function(onAssetLoadError) {
  this.onAssetLoadError_ = onAssetLoadError;
};


/**
 * Handles the tick event.
 * @private
 */
lexi.Library.prototype.onTick_ = function() {
  if (window.loop && (typeof window.loop === 'function')) {
    try {
      window.loop();
    } catch (e) {
      if (this.onError_) {
        this.onError_(e);
      }
    }
  }
  if (this.mouseIsDown_ && window.touching &&
      (typeof touching === 'function')) {
    x = this.lastCx_;
    y = this.lastCy_;
    window.touching();
  }
  if (this.needsRedraw_) {
    this.renderCommands_();
  }
};


/**
 * Renders all of the drawing commands immediately.
 * @private
 */
lexi.Library.prototype.renderCommands_ = function() {
  var now = new Date();
  this.needsRedraw_ = false;
  this.resetDrawingState_();
  for (var i = 0; i < this.sceneStack_.length; i++) {
    this.sceneStack_[i].onTick(now);
    this.sceneStack_[i].draw();
  }
};


/**
 * Moves a command in the scene stack to the front. If the command cannot
 * be found, nothing happens.
 * @param {lexi.Command} command The command, such as a stamp, to reorder.
 * @return {boolean} Whether the reordering was successful.
 */
lexi.Library.prototype.bringToFront = function(command) {
  var index = this.sceneStack_.indexOf(command);
  if (index === -1) {
    return false;
  }
  this.sceneStack_.splice(index, 1);
  for (var i = index; i < this.sceneStack_.length; i++) {
    this.sceneStack_[i].z = i + 1;
  }
  this.sceneStack_.push(command);
  command.z = this.sceneStack_.length;
  this.requestRedraw();
  return true;
};


/**
 * Moves a command in the scene stack to the back. If the command cannot
 * be found, nothing happens.
 * @param {lexi.Command} command The command, such as a stamp, to reorder.
 * @return {boolean} Whether the reordering was successful.
 */
lexi.Library.prototype.sendToBack = function(command) {
  var index = this.sceneStack_.indexOf(command);
  if (index === -1) {
    return false;
  }

  // First remove the command from where ever it is.
  this.sceneStack_.splice(index, 1);

  // Then splice it in in position 1. Not position 0 because that is always
  // reserved for a reset command.
  this.sceneStack_.splice(1, 0, command);

  // Now fix all of the z positions.
  for (var i = 1; i < this.sceneStack_.length; i++) {
    this.sceneStack_[i].z = i + 1;
  }
  this.requestRedraw();
  return true;
};

/**
 * Initializes the bound, global functions that end users can easily call.
 * It looks for functions that are not private and makes them global.
 * @private
 */
lexi.Library.prototype.initializeGlobals_ = function() {
  for (var name in lexi.Library.prototype) {
    if (typeof this[name] === 'function' && name.slice(-1) !== '_' &&
        name !== 'eval') {
      this.window_[name] = lexi.bind(this[name], this);
    }
  }
};


/**
 * Loads up a fill image, and request a redraw when complete.
 * @param {string} name Name of the image to load.
 * @param {string} url Url of the image to load.
 * @export
 * @private
 * @return {Image} The loaded fill.
 */
lexi.Library.prototype.loadFillPicture_ = function(name, url) {
  var img = this.document_.createElement('img');
  img.crossOrigin = 'anonymous';
  img.onload = lexi.bind(function() {
    this.requestRedraw();
  }, this);
  img.src = url;
  this.picturesByName_[name] = img;
  return img;
};


/**
 * Loads up a Google font.
 * @param {string} cleanName Name of the font to load, stripped of whitespace
 *     and lowercased, like "emilyscandy" instead of "Emily's Candy". This is
 *     calculated by codepops.cleanAssetName.
 * @param {string} fontString The Google fonts font name, like "Emilys Candy".
 *     This can be found in the lexi.googleFonts collection.
 * @export
 * @private
 */
lexi.Library.prototype.loadGoogleFont_ = function(cleanName, fontString) {
  var href = '//fonts.googleapis.com/css?family=';
  href += fontString.replace(/"/gi, '').replace(/\s/gi, '+');

  if (this.googleFontLoadStatus_[cleanName] === 'LOADED') {
    return;
  }
  this.googleFontLoadStatus_[cleanName] = 'LOADING';

  var fontLink = this.document_.createElement('link');
  fontLink.href = href;
  fontLink.rel = 'stylesheet';
  fontLink.type = 'text/css';

  if (!this.googleFontLoadIntervalIds_[cleanName]) {
    this.googleFontLoadIntervalIds_[cleanName] = this.window_.setInterval(
      function(cleanName) {
        if (this.googleFontLoadStatus_[cleanName] === 'LOADED' ||
            this.googleFontLoadStatus_[cleanName] === 'ERROR') {
          this.window_.clearInterval(
            this.googleFontLoadIntervalIds_[cleanName]);
          this.requestRedraw();
          this.window_.setTimeout(this.requestRedraw.bind(this), 500);
        }
      }.bind(this), 100, cleanName);
  }

  fontLink.onload = function() {
    this.googleFontLoadStatus_[cleanName] = 'LOADED';
    this.requestRedraw();

  }.bind(this);
  fontLink.onerror = function() {
    this.googleFontLoadStatus_[cleanName] = 'ERROR';
    this.requestRedraw();
  }.bind(this);
  this.document_.head.appendChild(fontLink);
};


/**
 * Loads the impact font so the user can use it within their apps. Most, if not
 * all desktop browswers come with impact installed, but the opposite is true
 * for mobile browsers. This fixes those cases.
 * @private
 */
lexi.Library.prototype.loadImpactFont_ = function() {
  this.loadingImpactFont_ = true;

  // FontFace and document.fonts do not work in Edge or IE, but impact is
  // a distributed microsoft font, so we're safe to use them here.
  var impactFont = new FontFace('impact','url(../css/impact/86bc8dce-e98d-41ba-9796-a466ad6d7590.woff)');
    
  impactFont.load().then(function(loadedFace) {
    this.document_.fonts.add(loadedFace);
    this.impactHasLoaded_ = true;
    this.requestRedraw();
  }.bind(this));
};


/**
 * Returns whether a given font is loaded and ready. If the font you send is not
 * a google font, this always returns true, as we want to fall back to system
 * fonts.
 * @param {string} fontString The string the user types into their text command
 *     for the font they'd like.
 * @return {boolean} Returns true if the font is ready to draw.
 */
lexi.Library.prototype.fontIsReady = function(fontString) {
  var cleanName = cleanAssetName(fontString);

  // If it's not a Google font, return true, so the system will attempt to
  // draw with a system font. Also return true if it's one of the three
  // default fonts we always load.
  if (!lexi.googleFonts[cleanName] || cleanName === 'roboto' ||
      cleanName === 'robotoslab' || cleanName === 'sourcecodepro') {
    return true;
  }

  // Otherwise, look in the googleFontLoadStatus_ hash to find out what's up.
  // If it's loaded or errored out, then it's as ready as it'll ever be.
  return this.googleFontLoadStatus_[cleanName] === 'LOADED' ||
         this.googleFontLoadStatus_[cleanName] === 'ERROR';
};


/**
 * Initializes the bound, global functions that end users can easily call.
 * It looks for functions that are not private and makes them global.
 * @private
 */
lexi.Library.prototype.initializeStamps_ = function() {
  // Only run the following code if we're running inside a page with a path
  // that does not contain '/tests/'. Use case is that we want to load the
  // test images for unit tests, but nowhere else.
  // Unless we have the parameter useoldstamps in the URL. This is so that
  // the pixel tests will use the same images as the test harness.
  var topHref = ('' + location.href).toLowerCase();
  if (topHref.indexOf('/tests/') === -1 &&
      topHref.indexOf('useoldstamps') === -1) {
    return;
  }
  var stampNames = [
      'apple', 'pencil', 'rainbow', ['cherry', 'cherries'], ['b'],
      'cloud', ['hamburger', 'burger'], 'girl', 'boy', 'girl2',
      'popsicle', ['phone', 'cellphone'], ['icecream', 'icecreamcone'],
      ['cola', 'soda'], ['notebook', 'diary'],
      'cookie', ['watermelon', 'melon'], ['drink', 'glass'], 'tree', 'flower',
      ['bow', 'bowtie', 'tie'], ['bandaid', 'bandage'], ['heart', 'love'],
      ['ball', 'soccer'], 'strawberry',
      'dogbowl', ['mug', 'cup', 'coffee'], ['paintbrush', 'brush'], 'carrot',
      ['note', 'musicalnote'],
      ['brush2', 'paintbrush2'], ['hat', 'partyhat'], ['disk', 'floppy'],
      'star', 'bone', 'lime', 'pen', ['letter', 'envelope'],
      ['shirt', 't-shirt'], ['tv', 'television'],
      'bowl', 'book', 'shoe', 'cupcake', 'can',
      ['usbdrive', 'jumpdrive', 'drive'], 'pear', 'beachball', 'popsicle2',
      'orange', ['moon2', 'asteroid'], ['nova', 'explosion'], ['email', 'share']
    ];
  this.stampsByName_ = {};
  var iconsImg = document.getElementById('icons-cute-large');

  var ICON_SHEET_COLUMNS = 5;
  var W = 120;

  col = 0;
  row = 0;
  for (var i = 0; i < stampNames.length; i++) {
    var stampRecord = stampNames[i];
    var stampName = stampRecord;
    if (typeof stampRecord === 'object') {
      stampName = stampRecord[0];
    }
    var stampCanvas = this.document_.createElement('canvas');
    stampCanvas.width = W;
    stampCanvas.height = W;
    stampCanvas.id = 'stamp-' + stampName;
    stampCanvas.style.display = 'none';
    var ctx = stampCanvas.getContext('2d');
    ctx.drawImage(iconsImg, col * W, row * W, W, W, 0, 0, W, W);

    // Since these test-only images are 120x120, we need to override
    // the width and height of the "real" stamps in stampList so that
    // our hits() logic works correctly.
    lexi.stampList[stampName].width = W;
    lexi.stampList[stampName].height = W;

    this.stampsByName_[stampName] = stampCanvas;
    if (typeof stampRecord === 'object') {
      for (var j = 0; j < stampRecord.length; j++) {
        this.stampsByName_[stampRecord[j]] = stampCanvas;
      }
    }
    col += 1;
    if (col === ICON_SHEET_COLUMNS) {
      col = 0;
      row += 1;
    }
  }

};


/**
 * Handler for the onClick event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onClick_ = function(e) {
  // Do nothing for now.
};


/**
 * Calculates the offsetX relative to the canvas' top left.
 * @param {event} e The mouse event or the touch record.
 * @return {number} x The offsetX.
 * @private
 */
lexi.Library.prototype.getOffsetX_ = function(e) {
  var x = e.offsetX === undefined ? e.layerX : e.offsetX;

  // In the case of touch events, there will be a client position
  // but it is relative to the page's top left. This corrects for that.
  if (isNaN(x) && e.clientX !== undefined) {
    var rect = this.canvas_.getBoundingClientRect();
    x = e.clientX - rect.left;
  }
  return x;
};


/**
 * Calculates the offsetY relative to the canvas' top left.
 * @param {event} e The mouse event or the touch record.
 * @return {number} y The offsetY.
 * @private
 */
lexi.Library.prototype.getOffsetY_ = function(e) {
  var y = e.offsetY === undefined ? e.layerY : e.offsetY;

  // In the case of touch events, there will be a client position
  // but it is relative to the page's top left. This corrects for that.
  if (isNaN(y) && e.clientY !== undefined) {
    var rect = this.canvas_.getBoundingClientRect();
    y = e.clientY - rect.top;
  }
  return y;
};


/**
 * Handler for the onMouseDown event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onMouseDown_ = function(e) {
  this.mouseIsDown_ = true;
  var cx = this.getOffsetX_(e) / this.canvasScale_;
  var cy = this.getOffsetY_(e) / this.canvasScale_;
  this.lastMouseDownTime_ = new Date();
  this.mouseDownX_ = cx;
  this.mouseDownY_ = cy;
  this.lastCx_ = cx;
  this.lastCy_ = cy;

  for (var i = this.sceneStack_.length - 1; i >= 0; i--) {
    var st = this.sceneStack_[i];
    if (st['touch'] && st.hits(cx, cy)) {
      x = cx;
      y = cy;
      st['touch'](st);
      return;
    }
  }
  if (window.touch && (typeof touch === 'function')) {
    x = cx;
    y = cy;
    window.touch();
  }
};


/**
 * Handler for the onMouseUp event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onMouseUp_ = function(e) {
  this.mouseIsDown_ = false;
  this.isDragging_ = false;
  var cx = this.getOffsetX_(e) / this.canvasScale_;
  var cy = this.getOffsetY_(e) / this.canvasScale_;
  var clickTime = new Date() - (this.lastMouseDownTime_ || 0);

  if (window.untouch && (typeof untouch === 'function')) {
    x = cx;
    y = cy;
    window.untouch();
  }

  if (clickTime > 400) {
    return;
  }
  // TODO (jeff): There's an infrequent bug where if we call stamp.tap
  // after calling reset, we get:
  // "Uncaught TypeError: Cannot read property 'tap' of undefined".
  // There's likely an underlying bug having to do with sceneStack management,
  // (we access an index of sceneStack that doesn't exist). Find and fix that.
  for (var i = this.sceneStack_.length - 1; i >= 0; i--) {
    var st = this.sceneStack_[i];
    if (st && st['tap'] && st.hits(cx, cy)) {
      st.hits(cx, cy);
      x = cx;
      y = cy;
      try {
        lexi.bind(st['tap'], st)(st);
      } catch (e) {
        if (this.onError_) {
          this.onError_(e);
        }
      }
      continue;
    }
  }
  if (tap && (typeof tap === 'function')) {
    x = cx;
    y = cy;
    try {
      tap();
    } catch (e) {
      if (this.onError_) {
        this.onError_(e);
      }
    }
  }
};


/**
 * Handler for the onMouseMove event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onMouseMove_ = function(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  var cx = this.getOffsetX_(e) / this.canvasScale_;
  var cy = this.getOffsetY_(e) / this.canvasScale_;
  this.lastCx_ = cx;
  this.lastCy_ = cy;

  if (this.mouseIsDown_ &&
      (cx !== this.mouseDownX_ || cy !== this.mouseDownY_)) {
    this.isDragging_ = true;
  }
  if (this.isDragging_) {
    this.onDrag_(e);
  }
};


/**
 * Handler for the virtual onDrag event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onDrag_ = function(e) {
  var cx = this.getOffsetX_(e) / this.canvasScale_;
  var cy = this.getOffsetY_(e) / this.canvasScale_;

  // Calculate the angle of the drag.
  var dragAngle = 0;
  var dx = 0;
  var dy = 0;
  if (this.lastOffsetX) {
    dx = this.getOffsetX_(e) - this.lastOffsetX;
    dy = this.getOffsetY_(e) - this.lastOffsetY;
    dragAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  }

  this.lastOffsetX = this.getOffsetX_(e);
  this.lastOffsetY = this.getOffsetY_(e);
  if (drag && (typeof drag === 'function')) {
    x = cx;
    y = cy;
    try {
      drag({'angle': dragAngle});
    } catch (e) {
      if (this.onError_) {
        this.onError_(e);
      }
    }
  }
};


/**
 * Handler for the onTouchStart event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onTouchStart_ = function(e) {
  e.preventDefault();

  for (var i = e.targetTouches.length - 1; i >= 0; i--) {
    var event = {};
    event.offsetX = this.getOffsetX_(e.targetTouches[i]);
    event.offsetY = this.getOffsetY_(e.targetTouches[i]);
    this.lastOffsetX = event.offsetX;
    this.lastOffsetY = event.offsetY;
    this.onMouseDown_(event);
  }
};


/**
 * Handler for the onTouchEnd event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onTouchEnd_ = function(e) {
  e.preventDefault();
  var event = {};
  event.offsetX = this.lastOffsetX;
  event.offsetY = this.lastOffsetY;
  if (e.targetTouches.length === 0) {
    this.onMouseUp_(event);
  }
};


/**
 * Handler for the onTouchMove event.
 * @param {event} e The event.
 * @private
 */
lexi.Library.prototype.onTouchMove_ = function(e) {
  e.preventDefault();
  var event = {};
  event.offsetX = this.getOffsetX_(e.targetTouches[0]);
  event.offsetY = this.getOffsetY_(e.targetTouches[0]);
  this.onMouseMove_(event);
};


/**
 * Cleans up an asset name by removing spaces and making it lowercase.
 * @param {string} asset A potential asset name.
 * @return {string} A guaranteed clean asset name.
 * @private
 */
lexi.Library.prototype.getCleanName_ = function(asset) {
  return (asset || '').replace(/\s/gi, '').toLowerCase();
};


/**
 * Parses a string to see if it expresses a valid color. If so, returns a
 * string that is a valid param for ctx.lineStyle or ctx.fillStyle. For
 * example, parseColor('White') returns '#ffffff'.
 * @param {string} color The potential color name string.
 * @return {string|boolean} A color definition string, or false if not found.
 * @private
 */
lexi.Library.prototype.parseColor_ = function(color) {
  var colorName = this.getCleanName_(color);
  if (lexi.colors && lexi.colors[colorName]) {
    return lexi.colors[colorName];
  }

  // Look to see if we have any language-localized colors of this name.
  if (lexi.strings.colors && lexi.strings.colors[colorName]) {
    return lexi.strings.colors[colorName];
  }
  return false;
};


/**
 * Parses a string to see if it expresses a valid image. If so, returns an
 * Image object.
 * @param {string} image The potential image name string.
 * @return {string} A URL to load the image from, or false if not found.
 * @private
 */
lexi.Library.prototype.parsePicture_ = function(image) {
  var imageName = this.getCleanName_(image);

  // Look to see if we have any language-localized fills of this name.
  if (lexi.strings.fills && lexi.strings.fills[imageName]) {
    imageName = lexi.strings.fills[imageName];
  }

  if (this.picturesByName_[imageName]) {
    return this.picturesByName_[imageName];
  }

  var url;
  if (lexi.pictures && lexi.pictures[imageName]) {
    url = lexi.pictures[imageName];
    return this.loadFillPicture_(imageName, url);
  } else if (this.stampsByName_[imageName]) {
    return this.stampsByName_[imageName];
  }

  return this.loadFillPicture_(imageName,'resources/img/fillnotfound.png');
};


/**
 * Parses a string to see if it contains a common "direction", such
 * as up, down, etc.
 * @param {string} direction The potential direction string.
 * @return {string|boolean} The lowercased direction if one is found, or
 *     false if none matches.
 * @private
 */
lexi.Library.prototype.parseDirection_ = function(direction) {
  var lowercaseDirection = direction.toLowerCase().replace(/\s/gi, '');
  if (lowercaseDirection === 'up' || lowercaseDirection === 'down' ||
      lowercaseDirection === 'left' || lowercaseDirection === 'right' ||
      lowercaseDirection === 'north' || lowercaseDirection === 'south' ||
      lowercaseDirection === 'east' || lowercaseDirection === 'west' ||
      lowercaseDirection === 'northeast' ||
      lowercaseDirection === 'southeast' ||
      lowercaseDirection === 'southwest' ||
      lowercaseDirection === 'northwest' ||
      lowercaseDirection === 'center') {
    return lowercaseDirection;
  }
  return false;
};


/**
 * Parses a string to see if it contains a supported font.
 * @param {string} font The array of arguments.
 * @return {string|boolean} The full font definition if found, or
 *     false if none matches.
 * @private
 */
lexi.Library.prototype.parseFont_ = function(font) {
  var fontName = this.getCleanName_(font);
  return lexi.fontList[fontName] || lexi.googleFonts[fontName] || false;
};


/**
 * Parses a javascript arguments list into a nice structure like so:
 * {
 *   "numbers": [0, 0, 100, 100],
 *   "colors": ['red'],
 *   "strings": ['Cat1', 'wood'],
 *   "functions": [foo],
 *   "objects": [bar, bam, [whatever]]
 * }
 * @param {Array} args The array of arguments.
 * @param {number=} opt_skip Optional number of parameters to skip. Useful
 *     for functions like text() where the first param is of particular
 *     value.
 * @return {Object} A nice hash of arrays, by argument type.
 * @private
 */
lexi.Library.prototype.parseArguments_ = function(args, opt_skip) {
  var vals = {'numbers': [],
              'colors': [],
              'strings': [],
              'functions': [],
              'objects': [],
              'booleans': [],
              'pictures': []};
  var first = opt_skip || 0;
  for (var i = first; i < args.length; i++) {
    var arg = args[i];
    var type = typeof arg;
    if (Array.isArray(arg)) {
      vals['arrays'] = vals['arrays'] || [];
      vals['arrays'].push(arg);
    } else if (type === 'number') {
      vals['numbers'].push(arg);
    } else if (type === 'string') {

      vals['strings'].push(arg);
      if (this.parseDirection_(arg)) {
        vals['directions'] = vals['directions'] || [];
        vals['directions'].push(this.parseDirection_(arg));
      }

      if (this.parseFont_(arg)) {
        vals['fonts'] = vals['fonts'] || [];
        vals['fonts'].push(this.parseFont_(arg));
      }

      if (this.parsePicture_(arg)) {
        vals['pictures'] = vals['pictures'] || [];
        vals['pictures'].push(this.parsePicture_(arg));
      }

      var color = this.parseColor_(arg);
      if (color) {
        vals['colors'].push(color);
      }

    } else {
      vals[type + 's'] = vals[type + 's'] || [];
      vals[type + 's'].push(arg);
    }
  }
  return vals;
};


/**
 * Sets the line width to draw with.
 * @param {number} lineWidth The width in pixels.
 * @return {number} The applied width.
 * @private
 */
lexi.Library.prototype.setLineWidth_ = function(lineWidth) {
  var width = Math.min(lineWidth, lexi.MAX_LINE_WIDTH);
  width = Math.max(width, lexi.MIN_LINE_WIDTH);
  this.lineWidth_ = width;
  this.ctx_.lineWidth = width;
  return width;
};


/**
 * Sets the line color to draw with.
 * @param {string} color The color string.
 * @return {string} The applied color.
 * @private
 */
lexi.Library.prototype.setLineColor_ = function(color) {
  this.ctx_.strokeStyle = color;
  return color;
};


/**
 * Sets the fill style to draw with.
 * @param {string} color The color string.
 * @return {string} The applied color.
 * @private
 */
lexi.Library.prototype.setFillStyle_ = function(color) {
  this.ctx_.fillStyle = color;
  this.lastFillStyle_ = color;
  return color;
};


/**
 * Constructs and returns a Command object that records a given function call.
 * @param {string} functionName The name of the called function.
 * @param {Object} args The arguments for the Command constructor.
 * @return {lexi.Command} The Command object.
 * @private
 */
lexi.Library.prototype.addCommandToStack_ = function(functionName, args) {
  if (this.isRedrawingACommand_) {
    return;
  }

  this.largestZ_++;
  var newCommand = new lexi.Command(this, functionName, args, this.largestZ_);
  this.sceneStack_.push(newCommand);
  return newCommand;
};


/**
 * Resets the drawing state at the beginning of the draw stack.
 * @private
 */
lexi.Library.prototype.resetDrawingState_ = function() {
  this.cursor_.x = this.width_ / 2;
  this.cursor_.y = this.height_ / 2;
  this.setLineWidth_(this.initialLineWidth_);
  this.ctx_.strokeStyle = this.initialStrokeStyle_;
  this.ctx_.font = this.initialFontSize_ + 'px ' + this.initialFontFace_;
  this.setFillStyle_(this.initialFillStyle_);
  this.ctx_.textAlign = this.initialTextAlign_;
};


/**
 * Returns the likely time that the last frame ended. Used internally for
 * calculating when an animation should begin. (We start animations on
 * previous frames so you always see *some* change this frame. Makes game
 * logic a little easier, and provides some nice tweening.)
 * @return {Date} A date object representing 1/20th of a second ago.
 * @private
 */
lexi.Library.prototype.getLastFrameEndTime_ = function() {
  return new Date(new Date().getTime() - (1000 / this.frameRate_));
};


/*******************************************************************************
 * Begin definitions for the public methods.
 */



/**
 * Sets the scale of the canvas so mouse events can be corrected for.
 * @param {number} scale The number from 0.0 to 1.0 and beyond.
 */
lexi.Library.prototype.setCanvasScale = function(scale) {
  this.canvasScale_ = scale;
};


/**
 * Resets everything to the initial values.
 */
lexi.Library.prototype.resetLibrary = function() {
  // Re-initialize globals hooks. This will fix any references that users
  // accidentally overrode while coding.

  this.initializeGlobals_();

  // Let's store a little log of various states, keyed by magic word like
  // 'lastFill' and 'lastText'. This is particularly useful when writing
  // interactive tutorials or unit tests.
  this.stateLog = {};

  this.sceneStack_ = [];
  window.tap = null;
  window.drag = null;
  window.loop = null;
  window.touch = null;
  window.lift = null;
  window.dragging = null;
  window.touching = null;
  window.always = null;
  window.longpress = null;
  window.untouch = null;
  window.doubletap = null;
  window.key = null;
  this.resetDrawingState_();
  this.reset('white');

  // Chrome 50 introduced a bug whereby the canvas is not refreshing
  // unless you change the zIndex. No idea why. This workaround seems
  // to fix the trouble.
  this.canvas_.style.zIndex += 1;
  this.canvas_.style.zIndex -= 1;
};


/**
 * Sets the document's title.
 * @param {string} newTitle The new title.
 */
lexi.Library.prototype.title = function(newTitle) {
  this.document_.title = newTitle;
};

/**
 * Resets (aka clears) the canvas.
 * @param {string} style Anything special about the reset.
 * @return {lexi.Command} The newly created Fill object.
 */
lexi.Library.prototype.reset = function(style) {
  // Clear our stamps and reset our zIndex value, but not if we're
  // just rerunning a reset for animation's sake.
  if (!this.isRedrawingACommand_) {
    this.largestZ_ = 0;
    this.sceneStack_ = [];
  }
  var ctx = this.ctx_;
  ctx.clearRect(0, 0, this.width_, this.height_);

  var args = this.parseArguments_(arguments);

  if (args['numbers'].length === 3) {
    var rgb = 'rgb(' + Math.round(args['numbers'][0]) + ',' +
              Math.round(args['numbers'][1]) + ',' +
              Math.round(args['numbers'][2]) + ')';
    ctx.fillStyle = rgb;
    ctx.fillRect(0, 0, this.width_, this.height_);
  } else if (args['colors'].length > 0) {
    ctx.fillStyle = args['colors'][0];
    ctx.fillRect(0, 0, this.width_, this.height_);

  } else if (args['pictures'].length > 0) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.width_, this.height_);
    if (args['pictures'][0].complete || args['pictures'][0].naturalWidth) {
      ctx.drawImage(args['pictures'][0], 0, 0);
    } else {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, this.width_, this.height_);
    }

    if (args['pictures'][0].src &&
        args['pictures'][0].src.indexOf('fillnotfound.png') > -1) {
      // If we get here, we haven't found a fill. Record this fact.
      if (this.onAssetLoadError_) {
        this.onAssetLoadError_(
          codepops.cleanAssetName(args['strings'][0]), 'fill');
      }
    }
  } else {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.width_, this.height_);
  }

  ctx.fillStyle = this.lastFillStyle_;

  return this.addCommandToStack_('reset', arguments);
};








/**
 * Gets the canvas associated with this Library.
 * @return {Canvas} The canvas.
 */
lexi.Library.prototype.getCanvas = function() {
  return this.canvas_;
};


/**
 * Gets the canvas 2D drawing context associated with this Library.
 * @return {Object} The context object.
 */
lexi.Library.prototype.getContext = function() {
  return this.ctx_;
};


/**
 * Gets the soundManager instance associated with this Library.
 * @return {SoundManager} The soundManager instance.
 */
lexi.Library.prototype.getSoundManager = function() {
  return this.soundManager_;
};


/**
 * Sends some arbitrary data to the rest of the participants
 */
lexi.Library.prototype.send = function() {
  if (this.collabRef_) {
    var args = arguments;
    var command = {};
    command.args = args;
    command.collabId = this.collabId_;
    this.collabRef_.push(command);
  }
};






/**
 * Returns a string data URL representing the canvas at its native resolution.
 * @param {string} type Optional DOMString indicating the image format. The
 *     default type is 'image/png'.
 * @param {number} encoderOptions A Number between 0 and 1 indicating image
 *     quality if the requested type is image/jpeg or image/webp.
 * @return {string} The URL.
 */
lexi.Library.prototype.toDataURL = function(type, encoderOptions) {
  return this.canvas_.toDataURL(type, encoderOptions);
};





/**
 * Loads up a sound file.
 * @param {string} soundName A friendy name, like 'sword'.
 * @param {string} src The path to the sound file.
 * @param {number} opt_volume Optional parameter to set volume.
 * @param {number} opt_loops Optional parameter to set number of loops.
 * @private
 */
lexi.Library.prototype.loadSound_ = function(
    soundName, src, opt_volume, opt_loops) {

  if (!this.soundManager_) {
    return;
  }

  var volumeSetting = opt_volume || 0;
  var loopsSetting = opt_loops || 1;

  this.loadedSounds_[soundName] = this.soundManager_.createSound({
    'id': soundName,
    'url': src,
    'autoPlay': false,
    'stream': true,
    'volume': volumeSetting,
    'loops': loopsSetting
  });
};


/**
 * Loads up any set of assets based on a string name.
 * @param {Array.<string>} assets An array of strings that may be texture,
 *     sound, or stamp names.
 * @param {function} onComplete Callback for when they all load.
 * @private
 */
lexi.Library.prototype.loadAssets_ = function(assets, onComplete) {

  // Look for assets we know about.
  for (var i = 0; i < assets.length; i++) {
    var name = cleanAssetName(assets[i]);
    if (lexi.sounds[name] || lexi.songs[name]) {
      if (!this.loadedSounds_[name]) {
        // var path = "resources/data/songs/assets/" +  name + '.mp3';
        if (lexi.songs[name] && lexi.songs[name] !== true) {
          
        } else if (lexi.sounds[name] && lexi.sounds[name] !== true) {
          path = lexi.sounds[name];
          path = "resources/data/sounds/assets/" + lexi.sounds[name];
        }
        this.loadSound_(name, path);
      }
    }
    if (lexi.stampList && lexi.stampList[name]) {
      if (!this.stampsByName_[name]) {
        this.loadStampImage_(name, function() {}, function() {});
      }
    }
    if (lexi.pictures[name]) {
      if (!this.picturesByName_[name]) {
        
        this.loadFillPicture_(name, lexi.pictures[name]);
      }
    }
    if (name === 'impact') {
      if (lexi.assetsController.isFontAvailable('Impact')) {
        this.impactHasLoaded_ = true;
      } else if (!this.loadingImpactFont_) {
        this.loadImpactFont_();
      }
    }
    if (lexi.googleFonts[name]) {
      this.loadGoogleFont_(name, lexi.googleFonts[name]);
    }
  }

  if (onComplete) {
    onComplete();
  }
};


/**
 * Loads up a stamp image, and calls onComplete once it does. If it's already
 * been loaded, the callback will be immediately called.
 * @param {string} name The name of the stamp image to be loaded.
 * @param {function} onComplete Callback for when it loads.
 * @param {function} onError Callback for when there's an error.
 * @return {Image} The new image.
 * @export
 * @private
 */
lexi.Library.prototype.loadStampImage_ = function(name, onComplete, onError) {
  var existingStamp = this.stampsByName_[name];
  if (existingStamp) {
    onComplete(existingStamp);
    this.requestRedraw();
    return;
  }

  // Otherwise it's something novel. Attempt to load it.
  // TODO(scott): We need a master list of stamps.
  var img = this.document_.createElement('img');
  img.crossOrigin = 'anonymous';
  img.onerror = lexi.bind(function() {

    // Track that we had a stamp load error.
    this.numberOfStampLoadErrors++;

    this.stampsByName_[name] = document.getElementById('stamp-not-found');
    if (this.onAssetLoadError_) {
      this.onAssetLoadError_(name, 'stamp');
    }
    if (onError) {
      onError(img);
    }
  }, this);
  img.onload = lexi.bind(function() {
    this.stampsByName_[name] = img;
    if (onComplete) {
      onComplete(img);
    }
    this.requestRedraw();
  }, this);

  // If there's a picture we know about, use that, but only if we haven't yet
  // found a stamp image.
  if (!lexi.stampList[name] && lexi.pictures[name]) {
    img.src = lexi.pictures[name];
  } else {
    img.src = 'resources/data/stamps/assets/' + name + '.png';
  }
  return img;
};


/**
 * Stops all sounds being played.
 */
lexi.Library.prototype.silence = function() {
  if (!this.soundManager_) {
    return;
  }
  this.soundManager_.stopAll();
};



/**
 * Pauses execution for a number of seconds.
 * @param {number} seconds The seconds to pause, like 1 or .5.
 */
lexi.Library.prototype.pause = function(seconds) {
  var startTime = new Date();
  var elapsed = 0;
  var milliseconds = 1000 * (seconds || 0);
  while (elapsed < milliseconds) {
    elapsed = new Date() - startTime;
  }
};


/**
 * Raises a tap event, as if the user had done so. Useful for unit testing.
 * @param {number} x The x location to tap.
 * @param {number} y The y location to tap.
 */
lexi.Library.prototype.fakeTap = function(x, y) {
  var event = {};
  event['offsetX'] = x;
  event['offsetY'] = y;
  event['preventDefault'] = function() {};
  this.onMouseDown_(event);
  this.onMouseUp_(event);
};


/**
 * Raises a "long tap" series of events, as if the user had done so.
 * Useful for unit testing.
 * @param {number} x The x location to tap.
 * @param {number} y The y location to tap.
 */
lexi.Library.prototype.fakeLongTap = function(x, y) {
  // First the mouse down occurs.
  var event = {};
  event['offsetX'] = x;
  event['offsetY'] = y;
  event['preventDefault'] = function() {};
  this.onMouseDown_(event);

  // Then the mouseUp occurs, but not before we mess with the internal
  // clock to make the system thing the mouse down occured a second ago.
  var now = new Date();
  var oneSecondAgo = new Date();
  oneSecondAgo.setSeconds(now.getSeconds() - 1);
  this.lastMouseDownTime_ = oneSecondAgo;

  var event2 = {};
  event2['offsetX'] = x;
  event2['offsetY'] = y;
  event2['preventDefault'] = function() {};
  this.onMouseUp_(event2);
};


/**
 * Raises a touch event, as if the user had done so. Useful for unit testing.
 * @param {number} x The x location to touch.
 * @param {number} y The y location to touch.
 */
lexi.Library.prototype.fakeTouch = function(x, y) {
  var event = {};
  event['offsetX'] = x;
  event['offsetY'] = y;
  event['preventDefault'] = function() {};
  this.onMouseDown_(event);
};


/**
 * Raises a drag start event, as if the user had done so. Useful for
 * unit testing.
 * @param {number} x The x location to drag to.
 * @param {number} y The y location to drag to.
 */
lexi.Library.prototype.fakeDragStart = function(x, y) {
  var event = {};
  event['targetTouches'] = [];
  event['targetTouches'].push({'clientX': x, 'clientY': y});
  event['preventDefault'] = function() {};
  this.onTouchStart_(event);
};


/**
 * Raises a drag event, as if the user had done so. Useful for unit testing.
 * @param {number} x The x location to drag to.
 * @param {number} y The y location to drag to.
 */
lexi.Library.prototype.fakeDrag = function(x, y) {
  var event = {};
  event['targetTouches'] = [];
  event['targetTouches'].push({'clientX': x, 'clientY': y});
  event['preventDefault'] = function() {};
  this.onTouchMove_(event);
};


/**
 * Raises a drag end event, as if the user had done so. Useful for unit testing.
 * @param {number} x The x location to drag to.
 * @param {number} y The y location to drag to.
 */
lexi.Library.prototype.fakeDragEnd = function(x, y) {
  var event = {};
  event['targetTouches'] = [];
  event['targetTouches'].push({'clientX': x, 'clientY': y});
  event['preventDefault'] = function() {};
  this.onTouchEnd_(event);
};




/**
 * Returns the largest z-index we've currently drawn. This is an internal
 * function without much value for end users.
 * @return {number} The largest Z we've yet drawn.
 */
lexi.Library.prototype.getLargestZ = function() {
  return this.largestZ_;
};


/**
 * Returns the width of the canvas in pixels.
 * @return {number} The width.
 */
lexi.Library.prototype.width = function() {
  return this.width_;
};


/**
 * Returns the height of the canvas in pixels.
 * @return {number} The width.
 */
lexi.Library.prototype.height = function() {
  return this.height_;
};


/**
 * Asks the library to redraw the canvas scene from scratch. This will happen in
 * a delayed fashion on the next loop. This method is an internal one that is
 * probably not terribly helpful for end users.
 */
lexi.Library.prototype.requestRedraw = function() {
  this.needsRedraw_ = true;
};


/**
 * Returns the number of radians in a given number of degrees.
 * @param {number} degrees The number of degrees.
 * @return {number} The number of radians.
 */
lexi.Library.prototype.radians = function(degrees) {
  return degrees * Math.PI / 180;
};



/**
 * For a given direction ('up', 'left', 'north', etc.), what is the multiplier
 * in the x and y direction that would move an object the given distance.
 * For example: if you move 'up' by 10, it would return a dx of 0 and a dy
 * of -10.
 * @param {string} direction The worded direction to take.
 * @param {string} distance The distance that the object would move.
 * @param {number} opt_degrees The angle to offset from the named direction.
 * @return {Object} A hash containing values for dx and dy.
 */
lexi.Library.prototype.deltaByDirection = function(direction, distance,
    opt_degrees) {
  var radians = this.radians(opt_degrees || 0);

  // If a compass direction is passed, then rotation of the stamp is ignored.
  if (direction.indexOf('north') > -1 || direction.indexOf('south') > -1) {
    radians = 0;
  }
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  var cos45 = Math.cos(this.radians(45));

  var fx = {
    'up': sin, 'down': -sin, 'left': -cos, 'right': cos,
    'north': 0, 'south': 0, 'west': -1, 'east': 1,
    'northeast': cos45,
    'southeast': cos45,
    'northwest': -cos45,
    'southwest': -cos45
  };

  var fy = {
    'up': -cos, 'down': cos, 'left': -sin, 'right': sin,
    'north': -1, 'south': 1, 'west': 0, 'east': 0,
    'northeast': -cos45,
    'southeast': cos45,
    'northwest': -cos45,
    'southwest': cos45
  };
  var dx = fx[direction] * distance;
  var dy = fy[direction] * distance;

  return {'dx': dx, 'dy': dy};
};


/**
 * For a given direction ('up', 'left', 'north', etc.), what is the angle
 * that corresponds.
 * @param {string} direction The worded direction to take.
 * @return {number} The angle.
 */
lexi.Library.prototype.angleByDirection = function(direction) {
  var angles = {
    'up': 0,
    'down': 180,
    'left': 270,
    'right': 90,
    'north': 0,
    'south': 180,
    'west': 270,
    'east': 90,
    'northeast': 45,
    'southeast': 135,
    'northwest': 315,
    'southwest': 225
  };

  return angles[direction];
};

/**
 * Given the start and end points of a line, calculate the angle from the
 * y axis of that line.
 * @param {number} x The x coordinate of the start point.
 * @param {number} y The y coordinate of the start point.
 * @param {number} x2 The x coordinate of the end point.
 * @param {number} y2 The y coordinate of the end point.
 * @return {number} The angle.
 */
lexi.Library.prototype.getLineAngle = function(x, y, x2, y2) {

  // Atan2 returns radians counterclockwise from the x axis.
  var radians = Math.atan2((y2 - y), (x2 - x));
  var degreesFromY = radians * (180 / Math.PI) + 90;
  return degreesFromY;
};


/**
 * A handy wrapper for explode.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.explode = function(target) {
  if (target.explode) {
    target.explode();
  }
};


/**
 * A handy wrapper for sing.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.sing = function(target) {
  if (target.sing) {
    target.sing();
  }
};


/**
 * A handy wrapper for pop.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.pop = function(target) {
  if (target.pop) {
    target.pop();
  }
};


/**
 * A handy wrapper for pow.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.pow = function(target) {
  if (target.pow) {
    target.pow();
  }
};


/**
 * A handy wrapper for swim.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.swim = function(target) {
  if (target.swim) {
    target.swim();
  }
};


/**
 * A handy wrapper for splash.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.splash = function(target) {
  if (target.splash) {
    target.splash();
  }
};


/**
 * A handy wrapper for burn.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.burn = function(target) {
  if (target.burn) {
    target.burn();
  }
};


/**
 * A handy wrapper for dance.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.dance = function(target) {
  if (target.dance) {
    target.dance();
  }
};


/**
 * A handy wrapper for erase.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.erase = function(target) {
  if (target.erase) {
    target.erase();
  }
};


/**
 * A handy wrapper for hide.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.hide = function(target) {
  if (target.hide) {
    target.hide();
  }
};


/**
 * A handy wrapper for show.
 * TODO(scott): all of these global wrappers could be more defensive
 *     if we checked typeof target.show == 'function'.
 * @param {lexi.Command} target The Command object.
 */
lexi.Library.prototype.show = function(target) {
  if (target.show) {
    target.show();
  }
};


/**
 * Tells the soundManager to preload a set of sounds.
 * @private
 */
lexi.Library.prototype.preloadSounds_ = function() {
  // If soundManager is ready, load some assets.
  if (this.soundManager_.ok()) {
    this.loadAssets_(['c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4']);
  } else {
    // If it's not ready, set a timeout to try again.
    this.window_.setTimeout(lexi.bind(this.preloadSounds_, this), 200);
  }
};

