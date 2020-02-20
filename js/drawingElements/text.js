lexi.Text = function(library, settings) {

    // Call the parent class constructor.
    lexi.base(this, library, settings);
  
    /**
     * The string to be displayed.
     * @type {string}
     * @private
     */
    this.displayString_ = '';
    if (typeof settings['displayString'] !== undefined) {
      this.displayString_ = settings['displayString'] + '';
    }
  
    /**
     * The font face.
     * @type {string}
     * @private
     */
    this.fontFace_ = settings['fontFace'] || 'Roboto';
  
    /**
     * The font size
     * @type {number}
     * @private
     */
    this.fontSize_ = settings['fontSize'] || 40;
  
    /**
     * The fillStyle (i.e. color).
     * @type {string}
     * @private
     */
    this.fillStyle_ = settings['fillStyle'] || 'black';
  
    /**
     * The text alignment
     * @type {string}
     * @private
     */
    this.textAlign_ = settings['textAlign'] || LEFT;
  
    /**
     * Calculating width and height is expensive, so only do it when needed.
     * This is set to true by the size function, then cleared by draw.
     * @type {boolean}
     * @private
     */
    this.recalculateDimensions_ = false;
  
    /**
     * For the purposes of populating originalWidth, etc, track if we've ever
     * calculated the dimensions.
     * @type {boolean}
     * @private
     */
    this.haveEverCalculatedDimensions_ = false;
  
  };
  lexi.inherits(lexi.Text, lexi.DrawingElement);
  
  
  /**
   * A handy string to know what kind of object this is.
   * @type {string}
   */
  lexi.Text.prototype.typeName = 'text';
  
  /**
   * Changes the string displayed by a Text object.
   * @param {string} value The new string to display.
   * TODO (jeff): Support all the same params as creating new text obj.
   * @return {lexi.Text} The text object.
   */
  lexi.Text.prototype.change = function(value) {
    this.displayString_ = value;
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * Asks the text to draw itself onto the canvas. This should never be called
   * directly by the end user. Use the global text() method and it will take
   * care of the rest.
   */
  lexi.Text.prototype.draw = function() {
    if (this.isHidden_) {
      return;
    }
    this.library_.stateLog['lastText'] = this.displayString_;
  
    // Check for dimensions lazily. Only calculate if null or we've scaled.
    if (!this.width_ || !this.height_ || this.recalculateDimensions_) {
      this.calculateTextDimensions();
    }
  
    this.ctx_.save();
    this.ctx_.font = this.fontSize_ + 'px ' + this.fontFace_;
    this.ctx_.fillStyle = this.fillStyle_;
    this.ctx_.textAlign = this.textAlign_;
    this.ctx_.translate(this.x, this.y);
  
    // If the font we're using is a Google font, fontIsReady will return false
    // until it is loaded. If the font isn't ready, set the global alpha to 0
    // so that we don't draw the text until the font is all set to draw.
    // We're also accounting for the impact font here if it is unavailable
    // on a given device.
    if (this.library_.fontIsReady(this.fontFace_) === false ||
        (this.fontFace_.indexOf('Impact') > -1 &&
         !this.library_.impactHasLoaded_)) {
      this.ctx_.globalAlpha = 0;
    } else {
      this.ctx_.globalAlpha = 1;
      this.recalculateDimensions_ = true;
  
      // TODO(Zach): Does not appear to be having any effect. Trying to get
      // our text object to recalculate its dimensions once the google font
      // actually loads. Otherwise we end up with inaccurate dimensions until
      // we redraw. Seems that the behavior differs between localhost and PROD.
      // Try to tinker with this after launch of Antman.
      //setTimeout(function(){this.library_.requestRedraw()}.bind(this),0);
    }
  
    this.ctx_.rotate(this.library_.radians(this.rotation));
    this.ctx_.fillText('' + this.displayString_, 0, 0);
    this.ctx_.restore();
  
  };
  
  /**
   * Handler for the tick event.
   * Most of the functionality is in lexi.DrawingElement.onTick. This function
   * contains only the code that is specific to Text.
   * @param {Date} now What time it is by the browser's clock.
   */
  lexi.Text.prototype.onTick = function(now) {
  
    lexi.base(this, 'onTick', now);
  
    if (this.sizeAnimation_) {
      var elapsed = now - this.sizeAnimation_.startTime;
  
      var completion = elapsed / this.sizeAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      var dSize = this.sizeAnimation_.endSize - this.sizeAnimation_.startSize;
      dSize *= completion;
  
      this.fontSize_ = this.sizeAnimation_.startSize + dSize;
  
      if (completion === 1) {
        this.sizeAnimation_ = null;
      } else {
        this.recalculateDimensions_ = true;
        this.library_.requestRedraw();
      }
    }
  
  };
  
  
  /**
   * Changes the size of the text object.
   * @param {number} size The new pixel size.
   * @param {number} milliseconds How long to animate the change.
   * @return {lexi.Text} The text object.
   */
  lexi.Text.prototype.size = function(size, milliseconds) {
  
    if (milliseconds) {
      this.sizeAnimation_ = {};
      this.sizeAnimation_.endSize = size;
      this.sizeAnimation_.startSize = this.fontSize_;
      this.sizeAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.sizeAnimation_.length = milliseconds;
    } else if (size !== undefined) {
      this.fontSize_ = size;
      this.sizeAnimation_ = null;
    } else {
      // Nothing was passed, choose a random size between 20 and 300.
      var newSize = random(20, 300);
      this.fontSize_ = newSize;
      this.sizeAnimation_ = null;
    }
    // TODO (jeff): If the size hasn't changed since the last redraw, don't
    // bother to redraw again.
    this.recalculateDimensions_ = true;
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * Gets the fontSize of the Text object.
   */
  Object.defineProperty(lexi.Text.prototype, 'fontSize', {
    'get': function() {
      return this.fontSize_;
    }
  });
  
  /**
   * For use in the hits function for checking if the text hits a particular
   * set of coordinates.
   * @return {boolean} True if the point is inside the boundary rectangle.
   * @private
   */
  lexi.Text.prototype.getBoundingPoints_ = function() {
  
    // Left align is the default.
    var left = this.x;
    var centerX = this.x + this.getHitWidth() / 2;
    // In testing, this got the most accurate hit box.
    var centerY = this.y - this.getHitHeight() / 3;
  
    if (this.textAlign_ === 'right') {
      left = this.x - this.getHitWidth();
      centerX = this.x - this.getHitWidth() / 2;
    } else if (this.textAlign_ === 'center') {
      left = this.x - this.getHitWidth() / 2;
      centerX = this.x;
    }
  
    var boundingPoints = {
      'left': left,
      'top': this.y - this.getHitHeight(),
      'width': this.getHitWidth(),
      'height': this.getHitHeight(),
      'centerX': centerX,
      'centerY': centerY
    };
    return boundingPoints;
  };
  
  
  /**
   * Calculates the width and height of the text object.
   */
  lexi.Text.prototype.calculateTextDimensions = function() {
  
    this.ctx_.save();
    this.ctx_.font = this.fontSize_ + 'px ' + this.fontFace_;
  
    // Support for textBaseline may be spotty for some browsers, but where
    // it is supported, it improves accuracy. Where it is not supported, it
    // will default to alphabetical.
    this.ctx_.textBaseline = 'bottom';
  
    var width = this.ctx_.measureText(this.displayString_).width;
    this.width_ = this.hitWidth_ = Math.round(width);
  
    // After playing around with hidden divs and all manner of things, the
    // most reliable method seems to be to measure the width of a capital M.
    // For most fonts that will define the height of the em-box. Multiplying
    // this by 1.3 gives a decent approximation of the space taken up by
    // ascenders and descenders.
    // TODO (jeff): For console and courier fonts this approach does not include
    // the ascenders.
    var height = this.ctx_.measureText('M').width;
    this.height_ = this.hitHeight_ = Math.floor(height * 1.3);
  
    // Lazily set original values.
    if (!this.haveEverCalculatedDimensions_) {
      this.originalWidth_ = this.originalHitWidth_ = this.width_;
      this.originalHeight_ = this.originalHitHeight_ = this.height_;
      this.haveEverCalculatedDimensions_ = true;
    }
    this.ctx_.restore();
  
    this.recalculateDimensions_ = false;
    this.library_.requestRedraw();
  };
  