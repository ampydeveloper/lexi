lexi.Stamp = function(library, name, opt_settings) {
    var settings = opt_settings || {};
  
    // Call the parent class constructor.
    lexi.base(this, library, settings);
  
    /**
     * The name of our stamp, like 'Apple'.
     * @type {string}
     */
    this.name = name;
  
    /**
     * The "clean" name of our stamp, like 'apple'. These are all lowercase,
     * with spaces and weird characters removed. Idea is that if kids
     * almost type it right, we "know what they mean."
     * @type {string}
     * @private
     */
    this.cleanName_ = cleanAssetName(name);
  
    /**
     * The image object that we load our image into.
     * @type {HTMLImageElement}
     * @private
     */
    this.img_;
  
    // Look to see if we have any language-localized stamps of this name.
    // TODO(scott): There is some chance this could cause weirdness if
    // you are running an app writting in language A under a page that is
    // set to language B. We may need to tie apps to their original language.
    if (lexi.strings.stamps && lexi.strings.stamps[this.cleanName_]) {
      this.cleanName_ = lexi.strings.stamps[this.cleanName_];
    }
  
    // Check for optional settings in the lexi.stamps object. In case
    // of conflicts, opt_settings takes precedence.
    if (lexi.stamps && lexi.stamps[this.cleanName_]) {
      var configSettings = lexi.stamps[this.cleanName_];
      for (var stampKey in configSettings) {
        if (!(stampKey in settings)) {
          settings[stampKey] = configSettings[stampKey];
        }
      }
    }
  
    // As a fix for weird behavior when resizing an image that hasn't yet
    // been loaded, we now have the width and height of each stamp in the
    // lexi.stampList hash. Put values for width and height into the settings
    // object. If they've already been set from the lexi.stamps hash, do not
    // overwrite those here.
    if (lexi.stampList && lexi.stampList[this.cleanName_]) {
      var stampListSettings = lexi.stampList[this.cleanName_];
      for (var stampListKey in stampListSettings) {
        if (!(stampListKey in settings)) {
          settings[stampListKey] = stampListSettings[stampListKey];
        }
      }
    }
  
    // All the width, hitWidth_, originalWidth_ etc variables can't be pushed
    // up into the DrawingElement parent class because we rely on the
    // stampList and stamps collections for settings. Setting all of these
    // in the parent constructor means the dimensions are often wrong.
  
    /**
     * The width of the stamp. (Note that this will be overridden when the image
     * loads, unless something was explicitly passed in.)
     * @private
     */
    this.width_ = null;
    if (settings['width'] !== null && settings['width'] !== undefined) {
      this.width_ = settings['width'];
    }
  
    /**
     * The height of the stamp. (Note that this will be overridden when the image
     * loads, unless something was explicitly passed in.)
     * @private
     */
    this.height_ = null;
    if (settings['height'] !== null && settings['height'] !== undefined) {
      this.height_ = settings['height'];
    }
  
    /**
     * Stores the original height of the stamp. Used to modify hitHeight_
     * when the stamp is resized.
     * @private
     */
    this.originalHeight_ = this.height_;
  
    /**
     * Stores the original width of the stamp. Used to modify hitWidth_
     * when the stamp is resized.
     * @private
     */
    this.originalWidth_ = this.width_;
  
    /**
     * The pixel width of the stamp's image, divided by the number of frames.
     * Until the image is loaded, we'll assume it's 0 pixels.
     * @private
     */
    this.nativeFrameWidth_ = 0;
  
    /**
     * The pixel height of the stamp's image.
     * Until the image is loaded, we'll assume it's 0 pixels.
     * @private
     */
    this.nativeHeight_ = 0;
  
    /**
     * The width of the stamp, from a "can I touch it?" perspective. This can
     * make for better user experience for a stamp that's, say, mostly empty
     * space around a central mass.
     * @private
     */
    this.hitWidth_ = settings['hitWidth'] || 0;
  
    /**
     * The height of the stamp, from a "can I touch it?" perspective. This can
     * make for better user experience for a stamp that's, say, mostly empty
     * space around a central mass.
     * @private
     */
    this.hitHeight_ = settings['hitHeight'] || 0;
  
    /**
     * The pixel width of the stamp's image, divided by the number of frames.
     * Until the image is loaded, we'll assume it's 0 pixels.
     * @private
     */
    this.nativeFrameWidth_ = 0;
  
    /**
     * The pixel height of the stamp's image.
     * Until the image is loaded, we'll assume it's 0 pixels.
     * @private
     */
    this.nativeHeight_ = 0;
  
    // If we still have no hitWidth or hitHeight, default to the width
    // and height stored in the stampList. This fixes a bug where .hits()
    // always returns false until the image loads.
    if (lexi.stampList && lexi.stampList[this.cleanName_]) {
      this.nativeFrameWidth_ = lexi.stampList[this.cleanName_].width;
      this.nativeHeight_ = lexi.stampList[this.cleanName_].height;
      if (!this.hitWidth_) {
        this.hitWidth_ = lexi.stampList[this.cleanName_].width;
      }
      if (!this.hitHeight_) {
        this.hitHeight_ = lexi.stampList[this.cleanName_].height;
      }
    }
  
    /**
     * Stores the original hitHeight_ of the stamp, since hitHeight_ changes
     * when the stamp is resized.
     * @private
     */
    this.originalHitHeight_ = this.hitHeight_;
  
    /**
     * Stores the original hitWidth_ of the stamp, since hitWidth_ changes
     * when the stamp is resized.
     * @private
     */
    this.originalHitWidth_ = this.hitWidth_;
  
    /**
     * The background color or texture.
     * @type {string}
     * @private
     */
    this.background_ = settings['background'];
  
    /**
     * The foreground color or texture.
     * @type {string}
     * @private
     */
    this.foreground_ = settings['foreground'];
  
    /**
     * The flipped condition of the stamp.
     * @type {boolean}
     * @private
     */
    this.flipped_ = false;
  
    /**
     * How many frames we have. Things that can't be frame animated have 1.
     * @type {number}
     * @private
     */
    this.frameCount_ = 1;
  
    /**
     * The frame number we need to draw next.
     * @type {number}
     * @private
     */
    this.currentFrameNumber_ = 0;
  
    /**
     * How many loops we have yet to play. We assume we'll play any animation
     * just once, but larger amounts can be passed in.
     * @type {number}
     * @private
     */
    this.loopsRemaining_ = settings['loops'] || 1;
  
    // Load up the image.
    var boundOnComplete = lexi.bind(this.onImageComplete_, this);
    var boundOnError = lexi.bind(this.onImageError_, this);
    this.library_.loadStampImage_(this.cleanName_, boundOnComplete, boundOnError);
  };
  lexi.inherits(lexi.Stamp, lexi.DrawingElement);
  
  
  /**
   * A handy string to know what kind of object this is.
   * @type {string}
   */
  lexi.Stamp.prototype.typeName = 'stamp';
  
  
  /**
   * Returns the hitHeight for this stamp, corrected for the current scale.
   * Used by collision detection code.
   * @return {number} The hitHeight for the Stamp.
   */
  lexi.Stamp.prototype.getHitHeight = function() {
  
    if (this.nativeFrameWidth_ <= 0) {
      return 0;
    }
  
    var rescaleFactor = this.height_ / this.nativeHeight_;
    this.hitHeight_ = this.originalHitHeight_ * rescaleFactor;
    return this.hitHeight_;
  };
  
  
  /**
   * Returns the hitWidth for this stamp, corrected for the current scale.
   * Used by collision detection code.
   * @return {number} The hitWidth for the Stamp.
   */
  lexi.Stamp.prototype.getHitWidth = function() {
  
    if (this.nativeFrameWidth_ <= 0) {
      return 0;
    }
  
    var rescaleFactor = this.width_ / this.nativeFrameWidth_;
    this.hitWidth_ = this.originalHitWidth_ * rescaleFactor;
    return this.hitWidth_;
  };
  
  /**
   * Handles the load of an image we want to stamp with.
   * @param {Image} img The image we loaded up.
   * @private
   */
  lexi.Stamp.prototype.onImageComplete_ = function(img) {
    this.img_ = img;
  
    this.nativeFrameWidth_ = img.width;
    this.nativeHeight_ = img.height;
  
    // Reset the frame animation stuff.
    this.frameCount_ = 1;
    this.currentFrameNumber_ = 0;
    if (!this.loopsRemaining_) {
      this.loopsRemaining_ = 1;
    }
  
    // If the thing had multiple, side-by-side frames, assume it's an animation.
    if (img.width > img.height && (img.width % img.height === 0)) {
      this.width_ = this.width_ || img.height;
      this.height_ = this.height_ || img.height;
      this.hitWidth_ = this.hitWidth_ || this.width_;
      this.hitHeight_ = this.hitHeight_ || this.height_;
      this.frameCount_ = img.width / img.height;
      this.currentFrameNumber_ = -1;
      this.nativeFrameWidth_ = img.height;
    }
  
    // If we have no explicity set width, assume the one of the loaded image.
    // TODO(scott): Is this the best behavior? Maybe it should default to a
    // reasonable size with the correct aspect ratio, in case we're loading
    // a photo from the user that is much too large or something.
    if (this.width_ === null || this.width_ === undefined) {
      this.width_ = img.width;
    }
    if (this.height_ === null || this.height_ === undefined) {
      this.height_ = img.height;
    }
    this.hitWidth_ = this.hitWidth_ || this.width_;
    this.hitHeight_ = this.hitHeight_ || this.height_;
    this.originalHeight_ = this.height_;
    this.originalWidth_ = this.width_;
    this.originalHitWidth_ = this.originalHitWidth_ || this.nativeFrameWidth_;
    this.originalHitHeight_ = this.originalHitHeight_ || this.nativeHeight_;
  
    // If we're still the top of the pile, just draw. If not,
    // then we need to ask the library to redraw from z=0 and up.
    if (this.z === this.library_.getLargestZ()) {
      this.draw();
    } else {
      this.library_.requestRedraw();
    }
  };
  
  
  /**
   * Handles the error loading an image we want to stamp with.
   * @param {Error} e The error.
   * @private
   */
  lexi.Stamp.prototype.onImageError_ = function(e) {
    // TODO(scott): Preload this image instead of relying it to be in the DOM.
    this.onImageComplete_(document.getElementById('stamp-not-found'));
  };
  
  /**
   * Asks the stamp to draw itself onto the canvas. This should never be called
   * directly by the end user. Use the global stamp() method and it will take
   * care of the rest.
   */
  lexi.Stamp.prototype.draw = function() {
    if (this.isHidden_ || !this.img_) {
      return;
    }
  
    var offsetX = -this.width_ / 2;
    var offsetY = -this.height_ / 2;
  
    var scaleX = 1;
    if (this.flipped_) {
      scaleX = -1;
    }
  
    if (this.frameCount_ > 1 && this.loopsRemaining_ > 0) {
      this.currentFrameNumber_++;
      this.currentFrameNumber_ = this.currentFrameNumber_ % this.frameCount_;
    }
    var frameInnerX = this.currentFrameNumber_ * this.nativeFrameWidth_;
  
    this.ctx_.save();
    this.ctx_.translate(this.x, this.y);
    this.ctx_.scale(scaleX, 1);
    this.ctx_.rotate(this.library_.radians(this.rotation*scaleX));
    this.ctx_.drawImage(this.img_, frameInnerX, 0, this.nativeFrameWidth_,
        this.nativeHeight_, offsetX, offsetY, this.width_, this.height_);
    this.ctx_.restore();
  
    if (this.frameCount_ > 1 && this.loopsRemaining_ > 0) {
      if (this.currentFrameNumber_ === this.frameCount_ - 1) {
        this.loopsRemaining_--;
      }
      this.library_.requestRedraw();
    } else if (this.onAnimationComplete_) {
      this.onAnimationComplete_();
      this.onAnimationComplete_ = null;
    }
  };
  
  
  /**
   * Flips the stamp horizontally.
   * @return {lexi.Stamp} The stamp object.
   */
  lexi.Stamp.prototype.flip = function() {
  
    // If a stamp has been flipped from it's original state, flipped_ should be
    // set to true, otherwise it should be set to false.
    this.flipped_ = !this.flipped_;
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * Changes to a different stamp.
   * @param {string} name The name of the stamp to try.
   * @return {lexi.Stamp} The stamp object.
   */
  lexi.Stamp.prototype.change = function(name) {
    this.name = name;
    this.cleanName_ = cleanAssetName(name);
    var boundOnComplete = lexi.bind(this.onImageComplete_, this);
    var boundOnError = lexi.bind(this.onImageError_, this);
    this.library_.loadStampImage_(this.cleanName_, boundOnComplete, boundOnError);
    return this;
  };
  
  
  /**
   * Explodes the stamp.
   * @param {string} opt_name Optional name of the type of explosion to use.
   * @param {Function} opt_callback Optional callback function to be called
   *     when the animation is complete.
   * @param {number} opt_scale Optional scale by which to multiply the size
   *     of the stamp before animating. Defaults to 2.5.
   */
  lexi.Stamp.prototype.explode = function(opt_name, opt_callback, opt_scale) {
    if (this.isExploding_) {
      return;
    }
  
    var scale = opt_scale || 2.5;
    this.rotate(0);
    var args = parseArguments(arguments);
    this.onExplodeComplete_ = args['functions'][0];
    this.isExploding_ = true;
    this.onAnimationComplete_ = lexi.bind(function() {
      this.hide();
      this.width_ /= scale;
      this.height_ /= scale;
      this.onAnimationComplete_ = null;
      this.change(this.preExplosionName_);
      this.loopsRemaining_ = this.preExplosionLoopsRemaining_;
      this.isExploding_ = false;
      if (this.onExplodeComplete_) {
        this.onExplodeComplete_();
      }
      this.onExplodeComplete_ = null;
    }, this);
    this.preExplosionName_ = this.cleanName_;
    this.preExplosionLoopsRemaining_ = this.loopsRemaining_;
    this.width_ *= scale;
    this.height_ *= scale;
    this.change(args['strings'][0] || 'nuke');
    this.loopsRemaining_ = 1;
  
  };
  
  
  /**
   * Pops the stamp.
   * @param {Function} opt_callback The function to call when the explode
   *     operation is done.
   */
  lexi.Stamp.prototype.pop = function(opt_callback) {
    this.explode('pop', opt_callback);
  };
  
  
  /**
   * Pows the stamp.
   * @param {Function} opt_callback The function to call when the explode
   *     operation is done.
   */
  lexi.Stamp.prototype.pow = function(opt_callback) {
    this.explode('pow', opt_callback);
  };
  
  
  /**
   * Turns the stamp into a splash of water.
   * @param {Function} opt_callback The function to call when the explode
   *     operation is done.
   */
  lexi.Stamp.prototype.splash = function(opt_callback) {
    this.explode('splash', opt_callback);
  };
  
  
  /**
   * Turns the stamp into a fire. Burn, baby, burn.
   * This function does not increase the size of the stamp while animating.
   * @param {Function} opt_callback The function to call when the explode
   *     operation is done.
   */
  lexi.Stamp.prototype.burn = function(opt_callback) {
    this.explode('fire', opt_callback, 1);
  };
  
  
  /**
   * Plays a sound that corresponds to this stamp. If one isn't found,
   * it plays a random sound.
   * @param {number} volume Optional number between 0 and 100.
   * @param {number} loops Optional number of additional loops to play.
   */
  lexi.Stamp.prototype.sing = function(volume, loops) {
    if (lexi.sounds[this.cleanName_]) {
      sound(this.cleanName_, volume, loops);
    } else {
      var sounds = ['c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4'];
      var choice = sounds[this.library_.random(0, 7)];
      sound(choice, volume, loops);
    }
  };
  
  /**
   * Handler for the tick event.
   * Most of the functionality is in lexi.DrawingElement.onTick. This function
   * contains only the code that is specific to Stamp.
   * @param {Date} now What time it is by the browser's clock.
   */
  lexi.Stamp.prototype.onTick = function(now) {
  
    lexi.base(this, 'onTick', now);
  
    if (this.sizeAnimation_) {
      var elapsed = now - this.sizeAnimation_.startTime;
  
      var completion = elapsed / this.sizeAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      var dW = this.sizeAnimation_.endW - this.sizeAnimation_.startW;
      var dH = this.sizeAnimation_.endH - this.sizeAnimation_.startH;
      dW *= completion;
      dH *= completion;
  
      this.width_ = this.sizeAnimation_.startW + dW;
      this.height_ = this.sizeAnimation_.startH + dH;
  
      if (completion === 1) {
        this.sizeAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
  };
  
  
  /**
   * Changes the size of the stamp.
   * @param {number} size The new pixel size.
   * @param {number} milliseconds How long to animate the change.
   * @return {lexi.Stamp} The stamp object.
   */
  lexi.Stamp.prototype.size = function(size, milliseconds) {
  
    if (milliseconds) {
      this.sizeAnimation_ = {};
      this.sizeAnimation_.endW = size;
      this.sizeAnimation_.endH = size;
      this.sizeAnimation_.startW = this.width_;
      this.sizeAnimation_.startH = this.height_;
      this.sizeAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.sizeAnimation_.length = milliseconds;
    } else if (size !== undefined) {
      this.width_ = size;
      this.height_ = size;
      this.sizeAnimation_ = null;
    } else {
      // Nothing was passed, choose a random size between 20 and 300.
      var newSize = random(20, 300);
      rescaleFactor = newSize / this.width_;
      this.width_ = newSize;
      this.height_ = newSize;
      this.sizeAnimation_ = null;
    }
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * For use in the hits function for checking if the stamp hits a particular
   * set of coordinates.
   * @return {Object} A hash of bounding points.
   * @private
   */
  lexi.Stamp.prototype.getBoundingPoints_ = function() {
  
    var boundingPoints = {
      'left': this.x - this.getHitWidth() / 2,
      'top': this.y - this.getHitHeight() / 2,
      'width': this.getHitWidth(),
      'height': this.getHitHeight(),
      'centerX': this.x,
      'centerY': this.y
    };
    return boundingPoints;
  };
  
  /**
   * Get the flipped property of the Stamp object.
   */
  Object.defineProperty(lexi.Stamp.prototype, 'flipped', {
    'get': function() {
      return this.flipped_;
    }
  });
  
  