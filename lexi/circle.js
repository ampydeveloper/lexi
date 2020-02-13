lexi.Circle = function(library, x, y, opt_settings) {
    var settings = opt_settings || {};
  
    // Call the parent class constructor.
    lexi.base(this, library, settings);
  
    /**
     * The x coordinate of the center of the circle.
     * @type {number}
     */
    this.x = x;
  
    /**
     * The y coordinate of the center of the circle.
     * @type {number}
     */
    this.y = y;
  
    /**
     * The radius of the circle.
     * @type {number}
     */
    this.radius = settings['radius'] || 100;
  
    /**
     * The width of the circle, which is just the diameter.
     * @private
     */
    this.width_ = this.radius * 2;
  
    /**
     * The height of the circle, which is just the diameter.
     * @private
     */
    this.height_ = this.radius * 2;
  
    /**
     * Whether or not the circle should be filled with fillColor.
     * @type {boolean}
     */
    this.solidFill = true;
    if (settings['solidFill'] !== undefined && settings['solidFill'] === false) {
      this.solidFill = false;
    }
  
    /**
     * The fill color.
     * @type {string}
     */
    this.fillColor = settings['fillColor'];
  
    /**
     * The line color.
     * @type {string}
     */
    this.lineColor = settings['lineColor'];
  
  };
  lexi.inherits(lexi.Circle, lexi.DrawingElement);
  
  /**
   * A handy string to know what kind of object this is.
   * @type {string}
   */
  lexi.Circle.prototype.typeName = 'circle';
  
  /**
   * Handler for the tick event.
   * Most of the functionality is in lexi.DrawingElement.onTick. This function
   * contains only the code that is specific to Circle.
   * @param {Date} now What time it is by the browser's clock.
   */
  lexi.Circle.prototype.onTick = function(now) {
  
    lexi.base(this, 'onTick', now);
  
    if (this.sizeAnimation_) {
      var elapsed = now - this.sizeAnimation_.startTime;
  
      var completion = elapsed / this.sizeAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      var dRadius = this.sizeAnimation_.endRadius -
        this.sizeAnimation_.startRadius;
      dRadius *= completion;
  
      this.radius = this.sizeAnimation_.startRadius + dRadius;
      this.width_ = this.radius * 2;
      this.height_ = this.radius * 2;
  
      if (completion === 1) {
        this.sizeAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
  };
  
  
  /**
   * Changes the size of the circle.
   * @param {number} size The new radius.
   * @param {number} milliseconds How long to animate the change.
   * @return {lexi.Circle} The Circle object.
   */
  lexi.Circle.prototype.size = function(size, milliseconds) {
  
    if (milliseconds) {
      this.sizeAnimation_ = {};
      this.sizeAnimation_.endRadius = size;
      this.sizeAnimation_.startRadius = this.radius;
      this.sizeAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.sizeAnimation_.length = milliseconds;
    } else if (size !== undefined) {
      this.radius = size;
      this.width_ = this.radius * 2;
      this.height_ = this.radius * 2;
      this.sizeAnimation_ = null;
    } else {
      // Nothing was passed, choose a random size between 20 and 500.
      var newSize = random(20, 500);
      this.radius = newSize;
      this.width_ = this.radius * 2;
      this.height_ = this.radius * 2;
      this.sizeAnimation_ = null;
    }
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * Asks the circle to draw itself onto the canvas. This should never be called
   * directly by the end user. Use the global circle() method and it will take
   * care of the rest.
   */
  lexi.Circle.prototype.draw = function() {
  
    if (this.isHidden_) {
      return;
    }
  
    if (this.fillColor !== undefined) {
      this.setFillStyle_(this.fillColor);
    }
  
    if (this.lineColor !== undefined) {
      this.setLineColor_(this.lineColor);
    }
  
    this.ctx_.beginPath();
    this.ctx_.arc(this.x, this.y, Math.abs(this.radius), 0, Math.PI * 2, true);
    this.ctx_.closePath();
    if (this.solidFill !== false) {
      this.ctx_.fill();
    }
    this.ctx_.stroke();
  };
  
  
  /**
   * For use in the hits function for checking if the circle hits another
   * DrawingElement or a particular set of coordinates.
   * @return {Object} A hash containing the center of the circle and its radius.
   * @private
   */
  lexi.Circle.prototype.getBoundingPoints_ = function() {
  
    var boundingPoints = {
      'x': this.x,
      'y': this.y,
      'radius': this.radius
    };
    return boundingPoints;
  };
  
  
  /**
   * Changes the fill color and line color of an existing Circle.
   * @param {String} fillColor The color of the new fill.
   * @param {String=} opt_lineColor The color of the line.
   * @param {boolean=} opt_solidFill Whether or not to fill in the circle.
   * @return {lexi.Circle} The circle object.
   */
  lexi.Circle.prototype.change = function(fillColor, opt_lineColor,
    opt_solidFill) {
  
    var args = this.library_.parseArguments_(arguments);
    if (args['strings'].length === 1) {
      this.fillColor = args['strings'][0];
      this.lineColor = args['strings'][0];
    } else if (args['strings'].length === 2) {
      this.fillColor = args['strings'][0];
      this.lineColor = args['strings'][1];
    }
  
    if (args['booleans'].length === 1) {
      this.solidFill = args['booleans'][0];
    }
  
    this.library_.requestRedraw();
    return this;
  };
  