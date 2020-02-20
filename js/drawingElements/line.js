lexi.Line = function(library, x, y, x2, y2, opt_settings) {
    var settings = opt_settings || {};
  
    // Call the parent class constructor.
    lexi.base(this, library, settings);
  
    /**
     * The x coordinate of the origin point of the line.
     * @type {number}
     */
    this.x = x;
  
    /**
     * The y coordinate of the origin point of the line.
     * @type {number}
     */
    this.y = y;
  
    /**
     * The x coordinate of the end point of the line.
     * @type {number}
     */
    this.x2 = x2;
  
    /**
     * The y coordinate of the end point of the line.
     * @type {number}
     */
    this.y2 = y2;
  
    /**
     * The line width for this line.
     * @type {number}
     * @private
     */
    this.lineWidth_ = settings['lineWidth'] || 10;
    if (this.library_.lineWidth_ !== this.library_.initialLineWidth_) {
      this.lineWidth_ = this.library_.lineWidth_;
    }
  
    /**
     * The width of the line, which is not neccessarily the length of the
     * line, but the width of an imaginary hit box defined by the line's two
     * points.
     * @type {number}
     * @private
     */
    this.width_ = Math.abs(this.x - this.x2);
  
    /**
     * The height of the line, which is not neccessarily the length of the
     * line, but the height of an imaginary hit box defined by the line's two
     * points.
     * @type {number}
     * @private
     */
    this.height_ = Math.abs(this.y - this.y2);
  
    /**
     * The length of the line.
     * @type {number}
     * @private
     */
    this.length_ = Math.sqrt(this.width_ * this.width_ +
                             this.height_ * this.height_);
  
    /**
     * The rotation of the line. This should be parallel with the line, pointing
     * from the START point to the END point.
     * @type {number}
     */
    this.rotation = this.library_.getLineAngle(this.x, this.y, this.x2, this.y2);
  
    /**
     * The line color.
     * @type {string}
     */
    this.lineColor = settings['lineColor'];
  };
  lexi.inherits(lexi.Line, lexi.DrawingElement);
  
  
  /**
   * A handy string to know what kind of object this is.
   * @type {string}
   */
  lexi.Line.prototype.typeName = 'line';
  
  
  /**
   * Handler for the tick event.
   * Most of the functionality is in lexi.DrawingElement.onTick. This function
   * contains only the code that is specific to Line.
   * @param {Date} now What time it is by the browser's clock.
   */
  lexi.Line.prototype.onTick = function(now) {
  
    lexi.base(this, 'onTick', now);
  
    var elapsed;
    var completion;
    var dX, dY, dX2, dY2;
  
    if (this.moveAnimation_) {
      elapsed = now - this.moveAnimation_.startTime;
  
      completion = elapsed / this.moveAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      dX = this.moveAnimation_.endX - this.moveAnimation_.startX;
      dY = this.moveAnimation_.endY - this.moveAnimation_.startY;
      dX *= completion;
      dY *= completion;
  
      dX2 = this.moveAnimation_.endX2 - this.moveAnimation_.startX2;
      dY2 = this.moveAnimation_.endY2 - this.moveAnimation_.startY2;
      dX2 *= completion;
      dY2 *= completion;
  
      this.x = this.moveAnimation_.startX + dX;
      this.y = this.moveAnimation_.startY + dY;
      this.x2 = this.moveAnimation_.startX2 + dX2;
      this.y2 = this.moveAnimation_.startY2 + dY2;
  
      if (completion === 1) {
        this.moveAnimation_ = null;
        this.width_ = Math.abs(this.x - this.x2);
        this.height_ = Math.abs(this.y - this.y2);
      } else {
        this.library_.requestRedraw();
      }
    }
  
    // Do these before sizeAnimation handling.
    this.width_ = Math.abs(this.x - this.x2);
    this.height_ = Math.abs(this.y - this.y2);
  
    this.length_ = Math.sqrt(this.width_ * this.width_ +
                             this.height_ * this.height_);
  
    if (this.sizeAnimation_) {
      elapsed = now - this.sizeAnimation_.startTime;
      completion = elapsed / this.sizeAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      var dL = this.sizeAnimation_.endLength - this.sizeAnimation_.startLength;
      dL *= completion;
      this.length_ = this.sizeAnimation_.startLength + dL;
  
      if (completion === 1) {
        this.sizeAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
    // These calculations must come after sizeAnimation, since the length
    // may change there.
    var cosRotation = Math.cos(this.library_.radians(this.rotation - 90));
    var sinRotation = Math.sin(this.library_.radians(this.rotation - 90));
    this.x2 = this.x + cosRotation * this.length_;
    this.y2 = this.y + sinRotation * this.length_;
  
  
  };
  
  
  /**
   * Asks the line to draw itself onto the canvas. This should never be called
   * directly by the end user. User the global line() method and it will take
   * care of the rest.
   * @returns {lexi.Line} The current line object.
   */
  lexi.Line.prototype.draw = function() {
  
    if (this.isHidden_) {
      return;
    }
  
    if (this.lineColor !== undefined) {
      this.setLineColor_(this.lineColor);
    }
  
    // Save off the existing context lineWidth, so that our line width doesn't
    // carry over to other drawing objects.
    var oldContextLineWidth = this.ctx_.lineWidth;
  
    this.ctx_.beginPath();
    this.ctx_.lineWidth = this.lineWidth_;
    this.ctx_.moveTo(this.x, this.y);
    if (this.library_.lineWidth_ > 0) {
      this.ctx_.lineTo(this.x2, this.y2);
    } else {
      this.ctx_.moveTo(this.x2, this.y2);
    }
    this.ctx_.closePath();
    this.ctx_.stroke();
  
    // Now set the context back to the old line width.
    this.ctx_.lineWidth = oldContextLineWidth;
  
    return this;
  };
  
  
  /**
   * Moves the Line object to a new spot.
   * @param {number} x The new x position for the START point.
   * @param {number} y The new y position for the START point.
   * @param {number} x2 The new x position for the END point.
   * @param {number} y2 The new y position for the END point.
   * @param {number} milliseconds How many milliseconds to take.
   * @return {lexi.Line} The Line object.
   */
  lexi.Line.prototype.move = function(x, y, x2, y2, milliseconds) {
  
    var args = parseArguments(arguments);
    x = args['numbers'][0];
    y = args['numbers'][1];
  
    if (args['numbers'].length >= 4) {
      x2 = args['numbers'][2];
      y2 = args['numbers'][3];
  
      // The relationship between the two points may have changed. Recalculate
      // width, height, and length.
      this.width_ = Math.abs(x - x2);
      this.height_ = Math.abs(y - y2);
      this.length_ = Math.sqrt(this.width_ * this.width_ +
                              this.height_ * this.height_);
    }
  
    // If nothing is passed, move randomly.
    if (arguments.length === 0) {
      x = this.library_.random(this.library_.width());
      y = this.library_.random(this.library_.height());
    }
  
    // If a direction is passed, move that way, relative to where we are.
    if (args['directions']) {
      var distance = args['numbers'][0] || 0;
      var d = args['directions'][0];
  
      // If ONLY a direction was passed, skip in the given direction.
      if (arguments.length === 1) {
        distance = Math.max(this.width_, this.height_);
      }
  
      var delta = this.library_.deltaByDirection(d, distance, this.rotation);
      x = this.x + delta['dx'];
      y = this.y + delta['dy'];
  
      // For relative directions, the milliseconds are the
      // second number.
      milliseconds = args['numbers'][1];
    } else if (args['numbers'].length % 2) {
      // If there is no direction, then an odd number of number args means the
      // last one is milliseconds.
      milliseconds = args['numbers'].pop();
    }
  
    var cosRotation = Math.cos(this.library_.radians(this.rotation - 90));
    var sinRotation = Math.sin(this.library_.radians(this.rotation - 90));
    x2 = x + cosRotation * this.length_;
    y2 = y + sinRotation * this.length_;
  
    if (milliseconds) {
      this.moveAnimation_ = {};
      this.moveAnimation_.endX = x;
      this.moveAnimation_.endY = y;
      this.moveAnimation_.startX = this.x;
      this.moveAnimation_.startY = this.y;
      this.moveAnimation_.endX2 = x2;
      this.moveAnimation_.endY2 = y2;
      this.moveAnimation_.startX2 = this.x2;
      this.moveAnimation_.startY2 = this.y2;
      this.moveAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.moveAnimation_.length = milliseconds;
    } else {
      this.x = x;
      this.y = y;
      this.x2 = x2;
      this.y2 = y2;
      this.moveAnimation_ = null;
    }
  
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * For use in the hits function for checking if the line hits a particular
   * set of coordinates.
   * @return {Object} A hash of bounding points.
   * @private
   */
  lexi.Line.prototype.getBoundingPoints_ = function() {
  
    var boundingPoints = {
      'x': this.x,
      'y': this.y,
      'x2': this.x2,
      'y2': this.y2,
      'width': this.width_,
      'height': this.height_
    };
    return boundingPoints;
  };
  
  
  /**
   * Changes the size of the line.
   * @param {number} length The new length.
   * @param {number} milliseconds How long to animate the change.
   * @return {lexi.Line} The Line object.
   */
  lexi.Line.prototype.size = function(length, milliseconds) {
  
    if (milliseconds) {
      this.sizeAnimation_ = {};
      this.sizeAnimation_.endLength = length;
      this.sizeAnimation_.startLength = this.length_;
      this.sizeAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.sizeAnimation_.length = milliseconds;
    } else {
      if (length !== undefined) {
        this.length_ = length;
        this.sizeAnimation_ = null;
      } else {
        // Nothing was passed, choose a random size between 20 and 500.
        var newLength = random(20, 500);
        this.length_ = newLength;
        this.sizeAnimation_ = null;
      }
      // In either non-animated case, we need to recalculate x2, and y2.
      var cosRotation = Math.cos(this.library_.radians(this.rotation - 90));
      var sinRotation = Math.sin(this.library_.radians(this.rotation - 90));
      this.x2 = this.x + cosRotation * this.length_;
      this.y2 = this.y + sinRotation * this.length_;
    }
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * Changes the line color of an existing Line.
   * @param {String} lineColor The color of the Line.
   * @return {lexi.Line} The line object.
   */
  lexi.Line.prototype.change = function(lineColor) {
    this.lineColor = lineColor;
    this.library_.requestRedraw();
    return this;
  };
  