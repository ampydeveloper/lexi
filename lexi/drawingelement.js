lexi.DrawingElement = function(library, settings) {

    /**
     * A reference to the main Library we're running under.
     * @type {lexi.Library}
     * @private
     */
    this.library_ = library;
  
    /**
     * Our current z position, which is like the zIndex in HTML. The higher the
     * number, the "closer" it is to the viewer.
     * @type {number}
     */
    this.z = settings['z'];
    if (settings['z'] === undefined) {
      this.z = 0;
    }
  
    /**
     * The canvas we're drawing into.
     * @type {Canvas}
     * @private
     */
    this.canvas_ = this.library_.getCanvas();
  
    /**
     * The canvas 2d context we're drawing into.
     * @type {Canvas}
     * @private
     */
    this.ctx_ = this.library_.getContext();
  
    /**
     * Our current x position.
     * @type {number}
     */
    this.x = settings['x'];
    if (settings['x'] === undefined) {
      this.x = Math.floor(this.canvas_.width / 2);
    }
  
    /**
     * Our current y position.
     * @type {number}
     */
    this.y = settings['y'];
    if (settings['y'] === undefined) {
      this.y = Math.floor(this.canvas_.height / 2);
    }
  
    /**
     * The width of the DrawingElement.
     * For stamps, this will be overridden when the image
     * loads, unless something was explicitly passed in.
     * For text objects, it always starts as null, and is calculated lazily.
     * @private
     */
    this.width_ = null;
    if (settings['width'] !== null && settings['width'] !== undefined) {
      this.width_ = settings['width'];
    }
  
    /**
     * The height of the DrawingElement.
     * For stamps, this will be overridden when the image
     * loads, unless something was explicitly passed in.
     * For text objects, it always starts as null, and is calculated lazily.
     * @private
     */
    this.height_ = null;
    if (settings['height'] !== null && settings['height'] !== undefined) {
      this.height_ = settings['height'];
    }
  
    /**
     * Stores the original height of the DrawingElement. Used to modify hitHeight_
     * when the DrawingElement is resized.
     * @private
     */
    this.originalHeight_ = this.height_;
  
    /**
     * Stores the original width of the DrawingElement. Used to modify hitWidth_
     * when the DrawingElement is resized.
     * @private
     */
    this.originalWidth_ = this.width_;
  
    /**
     * The width of the DrawingElement, from a "can I touch it?" perspective.
     * @private
     */
    this.hitWidth_ = settings['hitWidth'] || 0;
  
    /**
     * The height of the DrawingElement, from a "can I touch it?" perspective.
     * @private
     */
    this.hitHeight_ = settings['hitHeight'] || 0;
  
    /**
     * Stores the original hitHeight_ of the DrawingElement, since hitHeight_
     * changes when the DrawingElement is resized.
     * @private
     */
    this.originalHitHeight_ = this.hitHeight_;
  
    /**
     * Stores the original hitWidth_ of the DrawingElement, since hitWidth_
     * changes when the DrawingElement is resized.
     * @private
     */
    this.originalHitWidth_ = this.hitWidth_;
  
    /**
     * If we get erased, this will be set to true.
     * @type {boolean}
     * @private
     */
    this.isHidden_ = false;
  
    /**
     * An object that can contain animation parameters. See onTick() for details.
     * @type {Object=}
     * @private
     */
    this.moveAnimation_ = null;
  
    /**
     * The current rotation, in degrees. As rotation increases, the object
     * turns clockwise.
     * @type {number}
     */
    this.rotation = settings['rotation'] || 0;
  
    /**
     * An internal handler that is called when an animation is complete.
     * @type {function=}
     * @private
     */
    this.onAnimationComplete_ = null;
  };
  
  /**
   * Returns the original Height from when the DrawingElement was first created.
   * @return {number} The original height for the DrawingElement.
   * @private
   */
  lexi.DrawingElement.prototype.getOriginalHeight_ = function() {
    return this.originalHeight_;
  };
  
  /**
   * Returns the original Width from when the DrawingElement was first created.
   * @return {number} The original width for the DrawingElement.
   * @private
   */
  lexi.DrawingElement.prototype.getOriginalWidth_ = function() {
    return this.originalWidth_;
  };
  
  
  /**
   * Returns the hitHeight for this DrawingElement. Used by collision
   * detection code.
   * @return {number} The hitHeight for the DrawingElement.
   */
  lexi.DrawingElement.prototype.getHitHeight = function() {
    return this.hitHeight_;
  };
  
  
  /**
   * Returns the hitWidth for this DrawingElement object. Used by collision
   * detection code.
   * @return {number} The hitWidth for the DrawingElement.
   */
  lexi.DrawingElement.prototype.getHitWidth = function() {
    return this.hitWidth_;
  };
  
  
  /**
   * Returns the originalHitHeight_ for this DrawingElement object.
   * @return {number} The originalHitHeight_ for the DrawingElement.
   * @private
   */
  lexi.DrawingElement.prototype.getOriginalHitHeight_ = function() {
    return this.originalHitHeight_;
  };
  
  
  /**
   * Returns the originalHitWidth_ for this DrawingElement object.
   * @return {number} The originalHitWidth_ for the DrawingElement.
   * @private
   */
  lexi.DrawingElement.prototype.getOriginalHitWidth_ = function() {
    return this.originalHitWidth_;
  };
  
  /**
   * Swims the DrawingElement object upward in a meandering way.
   */
  lexi.DrawingElement.prototype.swim = function() {
    this.move(UP, 35, 350);
    if (random(5) === 1) {
      var angle = random(-10, 10);
      this.rotate(LEFT, angle, 350);
    }
    if (offscreen(this)) {
      this.rotate(LEFT, 10);
    }
  };
  
  /**
   * "Wraps" the DrawingElement object around if it moves off the screen.
   */
  lexi.DrawingElement.prototype.wrap = function() {
    var x = this.x;
    var y = this.y;
  
    // In a Box, x,y is the top left, but movement is calculated from the
    // center point. Adjust for that here.
    if (this.typeName === 'box') {
      x = this.x + (this.width_ / 2);
      y = this.y + (this.height_ / 2);
    }
  
    var w = this.library_.width();
    var h = this.library_.height();
    while (x > w) {
     x -= w;
    }
    while (x < 0) {
     x += w;
    }
    while (y > h) {
     y -= h;
    }
    while (y < 0) {
     y += h;
    }
    this.move(x, y);
    // TODO(scott): What about animated wraps?
  };
  
  /**
   * Hides the current DrawingElement object. Poof!
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.hide = function() {
    this.isHidden_ = true;
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * Hides the current DrawingElement object. Poof!
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.erase = function() {
    return this.hide();
  };
  
  
  /**
   * Unhides the current DrawingElement object. Poof!
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.unhide = function() {
    this.isHidden_ = false;
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * Unhides the current DrawingElement object. Poof!
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.show = lexi.DrawingElement.prototype.unhide;
  
  /**
   * Moves the DrawingElement object to a new spot.
   * @param {number} x The new x position.
   * @param {number} y The new y position.
   * @param {number} milliseconds How many milliseconds to take.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.move = function(x, y, milliseconds) {
    var args = this.library_.parseArguments_(arguments);
    x = args['numbers'][0];
    y = args['numbers'][1];
    milliseconds = args['numbers'][2];
  
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
    }
  
    if (milliseconds) {
      this.moveAnimation_ = {};
      this.moveAnimation_.endX = x;
      this.moveAnimation_.endY = y;
      this.moveAnimation_.startX = this.x;
      this.moveAnimation_.startY = this.y;
      this.moveAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.moveAnimation_.length = milliseconds;
    } else {
      this.x = x;
      this.y = y;
      this.moveAnimation_ = null;
    }
  
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * Rotates the DrawingElement object.
   * @param {number} angle The new rotation angle.
   * @param {number} milliseconds How many milliseconds to take.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.rotate = function(angle, milliseconds) {
    var args = this.library_.parseArguments_(arguments);
    var r = args['numbers'][0];
    milliseconds = args['numbers'][1];
  
    // If nothing is passed, move randomly.
    if (args['numbers'].length === 0) {
      r = this.library_.random(360);
    }
  
    // If a direction is passed, move that way, relative to where we are.
    if (args['directions']) {
  
      if (args['numbers'].length === 0) {
        // If we get a command like rotate(NORTH) with no numbers, (for any
        // compass direction or UP or DOWN), just point in that direction.
        if (args['directions'][0] in compassDirections) {
          r = this.library_.angleByDirection(args['directions'][0]);
        } else if (args['directions'][0] === 'left') {
            r = this.rotation - 90;
        } else {
          // If it's not compass or left, it must be right.
          r = this.rotation + 90;
        }
      } else if (args['directions'][0] === 'left') {
        // We got a number of degrees by which to rotate.
        r = this.rotation - r;
      } else if (args['directions'][0] === 'right') {
        r = this.rotation + r;
      }
    }
  
    if (milliseconds) {
      this.rotationAnimation_ = {};
      this.rotationAnimation_.endR = r;
      this.rotationAnimation_.startR = this.rotation;
      this.rotationAnimation_.startTime = this.library_.getLastFrameEndTime_();
      this.rotationAnimation_.length = milliseconds;
    } else {
      this.rotation = r;
      this.rotationAnimation_ = null;
    }
    this.library_.requestRedraw();
    return this;
  };
  
  /**
   * Aims the DrawingElement object at a given x, y or at another
   * DrawingElement object.
   * @param {number} x The x coordinate of the place to aim the DrawingElement
   *     object at.
   * @param {number} y The y coordinate of the place to aim the DrawingElement
   *     object at.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.aim = function(x, y) {
    // Inspect the arguments to determine if we're looking at a single stamp,
    // DrawingElement object, or a list of stamps with the given name.
    var args = this.library_.parseArguments_(arguments);
  
    // If the first argument is an object that contains x and y
    // members, use those. Useful for testing DrawingElement objects
    // for offscreen-ness.
    if (args['objects'].length === 1 &&
        args['objects'][0].x !== undefined &&
        args['objects'][0].y !== undefined) {
      x = args['objects'][0].x;
      y = args['objects'][0].y;
    }
  
    var dx = x - this.x;
    var dy = y - this.y;
  
    // If asked to aim to our own center, do nothing.
    if (dx === 0 && dy === 0) {
      return;
    }
    this.rotate(Math.atan2(dy, dx) * 180 / Math.PI + 90);
    return this;
  };
  
  /**
   * Gets the width of the DrawingElement object.
   */
  Object.defineProperty(lexi.DrawingElement.prototype, 'width', {
    'get': function() {
      return this.width_;
    }
  });
  
  
  /**
   * Gets the height of the DrawingElement object.
   */
  Object.defineProperty(lexi.DrawingElement.prototype, 'height', {
    'get': function() {
      return this.height_;
    }
  });
  
  
  /**
   * Gets the hidden-ness of the DrawingElement object.
   */
  Object.defineProperty(lexi.DrawingElement.prototype, 'hidden', {
    'get': function() {
      return this.isHidden_;
    }
  });
  
  /**
   * Makes the DrawingElement object dance.
   * @param {number=} opt_milliseconds How long to animate the dance.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.dance = function(opt_milliseconds) {
    var milliseconds = opt_milliseconds || 1000;
  
    this.danceAnimation_ = {};
    this.danceAnimation_.startTime = this.library_.getLastFrameEndTime_();
    this.danceAnimation_.startR = this.rotation;
    this.danceAnimation_.startX = this.x;
    this.danceAnimation_.startY = this.y;
    this.danceAnimation_.length = milliseconds;
    this.library_.requestRedraw();
    return this;
  };
  
  
  /**
   * Moves the DrawingElement object to the very front of the draw stack.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.front = function() {
    this.library_.bringToFront(this);
    return this;
  };
  
  
  /**
   * Moves the DrawingElement object to the very back of the draw stack.
   * @return {lexi.DrawingElement} The DrawingElement object.
   */
  lexi.DrawingElement.prototype.back = function() {
    this.library_.sendToBack(this);
    return this;
  };
  
  /**
   * Handler for the tick event.
   * @param {Date} now What time it is by the browser's clock.
   */
  lexi.DrawingElement.prototype.onTick = function(now) {
  
    var elapsed;
    var completion;
    var dX;
    var dY;
    var dR;
  
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
  
      this.x = this.moveAnimation_.startX + dX;
      this.y = this.moveAnimation_.startY + dY;
  
      if (completion === 1) {
        this.moveAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
    if (this.rotationAnimation_) {
      elapsed = now - this.rotationAnimation_.startTime;
  
      completion = elapsed / this.rotationAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      dR = this.rotationAnimation_.endR - this.rotationAnimation_.startR;
      dR *= completion;
  
      this.rotation = this.rotationAnimation_.startR + dR;
      if (completion === 1) {
        this.rotationAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
    if (this.danceAnimation_) {
      elapsed = now - this.danceAnimation_.startTime;
      completion = elapsed / this.danceAnimation_.length;
  
      if (completion > 1) {
        completion = 1;
      }
  
      // Tween between 8 keyframes.
      var steps = 8;
      var amount = 10; // The maximum angle of danciness, in degrees.
      var targets = [
          0,
          amount,
          0,
          -amount,
          0,
          amount,
          0,
          -amount,
          0,
          0
        ];
  
      var startId = Math.floor(completion * steps);
      var start = targets[startId];
      var end = targets[startId + 1];
      var innerCompletion = (completion % (1 / steps)) * steps;
      var change = end - start;
      dR = start + change * innerCompletion;
      dX = dR * this.width_ / 160;
      this.rotation = this.danceAnimation_.startR + dR;
      this.x = this.danceAnimation_.startX + dX;
      this.y = this.danceAnimation_.startY + Math.abs(dX);
      if (completion === 1) {
        this.danceAnimation_ = null;
      } else {
        this.library_.requestRedraw();
      }
    }
  
  };
  
  /**
   * Detect if this DrawingElement intersects with another DrawingElement.
   * This is a very naive bounding-box comparison, and at times will return
   * a "hit" when the graphical parts of stamps are not yet touching.
   * If this becomes a problem, there are ways to refine this function.
   * @return {Array<DrawingElement>|boolean} Either an array of objects that
   *     intersect with the current DrawingElement, or a boolean for whether
   *     the given DrawingElement intersects with the current DrawingElement.
   */
  lexi.DrawingElement.prototype.hits = function() {
  
    // Inspect the arguments to determine if we're looking at a single
    // DrawingElement, or a list of stamps with the given name.
    var args = this.library_.parseArguments_(arguments);
  
    var boundingPoints = this.getBoundingPoints_();
  
    if (args['objects'].length === 1) {
      // We're just looking at one other DrawingElement.
      if (!args['objects'][0]['typeName'] ||
          (args['objects'][0].typeName !== 'stamp' &&
           args['objects'][0].typeName !== 'text' &&
           args['objects'][0].typeName !== 'circle' &&
           args['objects'][0].typeName !== 'box' &&
           args['objects'][0].typeName !== 'line')) {
        return false;
      }
      return this.checkCollision_(args['objects'][0], boundingPoints);
  
    } else if (args['strings'].length > 0) {
      // We're looking at a list of stamps.
      var returnArray = [];
      var sceneStackLength = this.library_.sceneStack_.length;
      for (var i = 0; i < sceneStackLength; i++) {
        var currentObject = this.library_.sceneStack_[i];
  
        // We only check collisions with other stamps, and not with ourself.
        if (currentObject.typeName !== 'stamp' ||
            currentObject === this) {
          continue;
        }
        var cleanSeekName = codepops.cleanAssetName(args['strings'][0]);
        if (currentObject.cleanName_ === cleanSeekName) {
          if (this.checkCollision_(currentObject, boundingPoints)) {
            returnArray.push(currentObject);
          }
        }
      }
      if (returnArray.length > 0) {
        return returnArray;
      }
    } else if (args['numbers'].length === 2) {
      // We're checking specific coordinates.
      if (this.hidden) {
        return false;
      }
  
      // For a circle just see if the point is within the radius.
      if (this.typeName === 'circle') {
        var diffX = Math.abs(this.x - args['numbers'][0]);
        var diffY = Math.abs(this.y - args['numbers'][1]);
        if (diffX <= this.radius && diffY <= this.radius) {
          return true;
        }
        return false;
      }
  
      if (this.typeName === 'line') {
        return this.isPointInLineStroke(args['numbers'][0], args['numbers'][1]);
      }
  
      // Comparison for rectangular bounding box.
      this.ctx_.beginPath();
      this.ctx_.rect(boundingPoints['left'], boundingPoints['top'],
          boundingPoints['width'], boundingPoints['height']);
      var collision =
          this.ctx_.isPointInPath(args['numbers'][0], args['numbers'][1]);
      return collision;
    }
  
    return false;
  };
  
  /**
   * Detect if this DrawingElement intersects with another DrawingElement.
   * This private function handles the actual intersect logic, and is called
   * by hits.
   * This is a very naive bounding-box comparison, and at times will return
   * a "hit" when the graphical parts of the stamps are not yet touching.
   * @param {lexi.DrawingElement} other The other DrawingElement.
   * @param {Object} boundingPoints Position and size data about other that are
   *     needed to check for intersection.
   * @return {boolean} Whether or not the two DrawingElements intersect.
   * @private
   */
  lexi.DrawingElement.prototype.checkCollision_ =
        function(other, boundingPoints) {
  
    if (other === undefined) {
      return false;
    }
  
    if (this.hidden || other.hidden) {
      return false;
    }
  
    var otherBoundingPoints = other.getBoundingPoints_();
  
    var diffX, diffY;
  
    if (this.typeName === 'circle' && other.typeName === 'circle') {
  
      // Comparing circle to circle.
      diffX = Math.abs(boundingPoints['x'] - otherBoundingPoints['x']);
      diffY = Math.abs(boundingPoints['y'] - otherBoundingPoints['y']);
      var totalDiff = Math.sqrt(diffX * diffX + diffY * diffY);
      if (totalDiff <= boundingPoints['radius'] +
        otherBoundingPoints['radius']) {
        return true;
      }
      return false;
    } else if (this.typeName === 'circle' || other.typeName === 'circle') {
  
      // Comparing one circle and one non-circle
      if (this.typeName === 'circle') {
        if (other.typeName === 'line') {
          return this.checkCircleHitsLine_(boundingPoints, otherBoundingPoints);
        }
        return this.checkCircleHitsRectangle_(
          boundingPoints, otherBoundingPoints);
      }
      if (this.typeName === 'line') {
        return this.checkCircleHitsLine_(otherBoundingPoints, boundingPoints);
      }
      return this.checkCircleHitsRectangle_(otherBoundingPoints, boundingPoints);
  
    } else if (this.typeName === 'line' && other.typeName === 'line') {
  
      var pt1 = {'x': boundingPoints.x, 'y': boundingPoints.y};
      var pt2 = {'x': boundingPoints.x2, 'y': boundingPoints.y2};
      var pt3 = {'x': otherBoundingPoints.x, 'y': otherBoundingPoints.y};
      var pt4 = {'x': otherBoundingPoints.x2, 'y': otherBoundingPoints.y2};
      return this.checkLinesHit_(pt1, pt2, pt3, pt4);
  
    } else if (this.typeName === 'line' || other.typeName === 'line') {
  
      // We don't need to check for circles, as that's already dealt with above.
      // Everything we have left should be rectangular.
      if (this.typeName === 'line') {
        return this.checkLineHitsRectangle_(boundingPoints, otherBoundingPoints);
      }
      return this.checkLineHitsRectangle_(otherBoundingPoints, boundingPoints);
    }
  
    // Comparing two rectangular DrawingElements.
    if (isNaN(boundingPoints['width']) ||
        boundingPoints['width'] <= 0 ||
        isNaN(boundingPoints['height']) ||
        boundingPoints['height'] <= 0 ||
        isNaN(otherBoundingPoints['width']) ||
        otherBoundingPoints['width'] <= 0 ||
        isNaN(otherBoundingPoints['height']) ||
        otherBoundingPoints['height'] <= 0) {
      return false;
    }
  
    diffX = Math.abs(boundingPoints['centerX'] - otherBoundingPoints['centerX']);
    var maxDiffX = boundingPoints['width'] / 2 + otherBoundingPoints['width'] / 2;
    if (diffX > maxDiffX) {
      return false;
    }
  
    diffY = Math.abs(boundingPoints['centerY'] - otherBoundingPoints['centerY']);
    var maxDiffY = boundingPoints['height'] / 2 +
      otherBoundingPoints['height'] / 2;
    if (diffY > maxDiffY) {
      return false;
    }
    return true;
  };
  
  
  /**
   * Check to see if the given circle and rectangle hit. Expects bounding points
   * objects as parameters.
   * @param {Object} circle The bounding points (x, y, and radius) of the circle.
   * @param {Object} rectangle The bounding points (left, top, width, and height)
   *     of the rectangle.
   * @return {boolean} True if the two objects hit.
   * @private
   */
  lexi.DrawingElement.prototype.checkCircleHitsRectangle_ =
    function(circle, rectangle) {
  
    var distX =
        Math.abs(circle['x'] - rectangle['left'] - rectangle['width'] / 2);
    var distY =
        Math.abs(circle['y'] - rectangle['top'] - rectangle['height'] / 2);
  
    if (distX > (rectangle['width'] / 2 + circle['radius'])) {
      return false;
    }
    if (distY > (rectangle['height'] / 2 + circle['radius'])) {
      return false;
    }
  
    if (distX <= (rectangle['width'] / 2)) {
      return true;
    }
    if (distY <= (rectangle['height'] / 2)) {
      return true;
    }
  
    var dx = distX - rectangle['width'] / 2;
    var dy = distY - rectangle['height'] / 2;
    return (dx * dx + dy * dy <= (circle['radius'] * circle['radius']));
  };
  
  
  /**
   * Check to see if the given circle and line hit. Expects bounding points
   * objects as parameters.
   * @param {Object} circle The bounding points (x, y, and radius) of the circle.
   * @param {Object} line The bounding points (x, y, x2, y2, width, and height)
   *     of the line.
   * @return {boolean} True if the two objects hit.
   * @private
   */
  lexi.DrawingElement.prototype.checkCircleHitsLine_ = function(circle, line) {
  
    // https://riptutorial.com/html5-canvas/example/17709/
    // are-a-line-segment-and-circle-colliding-
  
    // Calculate distance: circle center to line start.
    var dx = circle.x - line.x;
    var dy = circle.y - line.y;
  
    // Calculate position on line normalized between 0.00 & 1.00
    var position = (dx * line.width + dy * line.height) /
                   (line.width * line.width + line.height * line.height);
  
    // Calculate nearest point on line.
    var positionX = line.x + line.width * position;
    var positionY = line.y + line.height * position;
  
    // Clamp results to being on the segment.
    if (position < 0) {
      positionX = line.x;
      positionY = line.y;
    }
    if (position > 1) {
      positionX = line.x2;
      positionY = line.y2;
    }
  
    var diffX = (circle.x - positionX) * (circle.x - positionX);
    var diffY = (circle.y - positionY) * (circle.y - positionY);
  
    return (diffX + diffY < circle.radius * circle.radius);
  };
  
  /**
   * Check to see if the given line and rectangle hit. Expects bounding points
   * objects as parameters.
   * @param {Object} line The bounding points (x, y, x2, y2, width, and height)
   *     of the line.
   * @param {Object} rectangle The bounding points (x, y, width, height) of the
   *     rectangle.
   * @return {boolean} True if the two objects hit.
   * @private
   */
  lexi.DrawingElement.prototype.checkLineHitsRectangle_ =
    function(line, rectangle) {
  
    // https://riptutorial.com/html5-canvas/example/17710/
    // are-line-segment-and-rectangle-colliding-
  
    var startPoint = {'x': line.x, 'y': line.y};
    var endPoint = {'x': line.x2, 'y': line.y2};
  
    var topLeft = {'x': rectangle['left'],
                   'y': rectangle['top']};
    var topRight = {'x': rectangle['left'] + rectangle['width'],
                    'y': rectangle['top']};
    var bottomRight={'x': rectangle['left'] + rectangle['width'],
                     'y': rectangle['top'] + rectangle['height']};
    var bottomLeft = {'x': rectangle['left'],
                      'y': rectangle['top'] + rectangle['height']};
  
    // Check for collision with the top rectangle line.
    if (this.checkLinesHit_(startPoint, endPoint, topLeft, topRight)) {
      return true;
    }
  
    // Check for collision with the right rectangle line.
    if (this.checkLinesHit_(startPoint, endPoint, topRight, bottomRight)) {
      return true;
     }
  
    // Check for collision with the bottom rectangle line.
    if (this.checkLinesHit_(startPoint, endPoint, bottomRight, bottomLeft)) {
      return true;
    }
  
    // Check for collision with the left rectangle line.
    if (this.checkLinesHit_(startPoint, endPoint, bottomLeft, topLeft)) {
      return true;
    }
  
    // Not intersecting with any of the 4 rectangle sides
    return false;
  };
  
  /**
   * Check if two line segments intersect. The first line goes from pt1 to pt2,
   * the second from pt3 to pt4. Each point object contains an x and y coordinate.
   * @param {Object} pt1 A point object containing x and y for first point.
   * @param {Object} pt2 A point object containing x and y for second point.
   * @param {Object} pt3 A point object containing x and y for third point.
   * @param {Object} pt4 A point object containing x and y for fourth point.
   * @return {boolean} True if the lines intersect.
   * @private
   */
  lexi.DrawingElement.prototype.checkLinesHit_ = function(pt1, pt2, pt3, pt4) {
  
    // Attribution: http://paulbourke.net/geometry/pointlineplane/
  
    var unknownA = (pt4.x - pt3.x) * (pt1.y - pt3.y) -
                   (pt4.y - pt3.y) * (pt1.x - pt3.x);
  
    var unknownB = (pt2.x - pt1.x) * (pt1.y - pt3.y) -
                   (pt2.y - pt1.y) * (pt1.x - pt3.x);
  
    var denominator = (pt4.y - pt3.y) * (pt2.x - pt1.x) -
                      (pt4.x - pt3.x) * (pt2.y - pt1.y);
  
    // Test if Coincident.
    // If the denominator and numerator for the unknownA and unknownB are 0
    // then the two lines are coincident. For our purposes, this is an
    // intersection (ie hit).
    if (unknownA === 0 && unknownB === 0 && denominator === 0) {
      return true;
    }
  
    // Test if Parallel.
    // If the denominator for the equations for unknownA and unknownB is 0
    // then the two lines are parallel.
    if (denominator === 0) {
      return false;
    }
  
    // Test if the line segments are colliding.
    unknownA /= denominator;
    unknownB /= denominator;
    var isIntersecting = (unknownA >= 0 && unknownA <= 1 &&
                          unknownB >= 0 && unknownB <= 1);
  
    return isIntersecting;
  };
  
  
  /**
   * Determines if the point x, y is within the stroke of the current line
   * segment. It draws a rectangle around the line that represents the boundaries
   * of the line width. Without this, you have to be exactly on the right pixel.
   * We could use context.isPointInStroke except that doesn't work on IE and
   * Edge.
   * @param {number} x The x coordinate of the point we're checking.
   * @param {number} y The y coordinate of the point we're checking.
   * @return {boolean} True if the point is in the line stroke.
   */
  lexi.DrawingElement.prototype.isPointInLineStroke = function(x, y) {
  
    var cosRotation = Math.cos(this.library_.radians(this.rotation));
    var sinRotation = Math.sin(this.library_.radians(this.rotation));
  
    var pt1x = this.x + cosRotation * this.lineWidth_ / 2;
    var pt1y = this.y + sinRotation * this.lineWidth_ / 2;
    var pt2x = this.x - cosRotation * this.lineWidth_ / 2;
    var pt2y = this.y - sinRotation * this.lineWidth_ / 2;
    var pt3x = this.x2 - cosRotation * this.lineWidth_ / 2;
    var pt3y = this.y2 - sinRotation * this.lineWidth_ / 2;
    var pt4x = this.x2 + cosRotation * this.lineWidth_ / 2;
    var pt4y = this.y2 + sinRotation * this.lineWidth_ / 2;
  
    this.ctx_.beginPath();
    this.ctx_.lineWidth = this.lineWidth_;
    this.ctx_.moveTo(pt1x, pt1y);
    this.ctx_.lineTo(pt2x, pt2y);
    this.ctx_.lineTo(pt3x, pt3y);
    this.ctx_.lineTo(pt4x, pt4y);
    this.ctx_.lineTo(pt1x, pt1y);
    this.ctx_.closePath();
    var collision = this.ctx_.isPointInPath(x, y);
    return collision;
  };
  
  /**
   * Sets the line color to draw with.
   * @param {string} color The color string.
   * @return {string} The applied color.
   * @private
   */
  lexi.DrawingElement.prototype.setLineColor_ = function(color) {
    this.ctx_.strokeStyle = color;
    return color;
  };
  
  
  /**
   * Sets the fill style to draw with.
   * @param {string} color The color string.
   * @return {string} The applied color.
   * @private
   */
  lexi.DrawingElement.prototype.setFillStyle_ = function(color) {
    this.ctx_.fillStyle = color;
    return color;
  };
  