lexi.Box = function (library, x, y, w, h, opt_settings) {
  var settings = opt_settings || {};

  // Call the parent class constructor.
  lexi.base(this, library, settings);
  this.x = x;
  this.y = y;
  this.width_ = w;
  this.height_ = h;
  this.solidFill = true;
  if (settings['solidFill'] !== undefined && settings['solidFill'] === false) {
    this.solidFill = false;
  }

  this.fillColor = settings['fillColor'];
  this.lineColor = settings['lineColor'];

};
lexi.inherits(lexi.Box, lexi.DrawingElement);

lexi.Box.prototype.typeName = 'box';

lexi.Box.prototype.onTick = function (now) {

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

lexi.Box.prototype.draw = function () {

  if (this.isHidden_) {
    return;
  }

  if (this.fillColor !== undefined) {
    this.setFillStyle_(this.fillColor);
  }

  if (this.lineColor !== undefined) {
    this.setLineColor_(this.lineColor);
  }

  var centerX = this.x + this.width_ / 2;
  var centerY = this.y + this.height_ / 2;
  var x = -this.width_ / 2;
  var y = -this.height_ / 2;
  var x2 = this.width_ / 2;
  var y2 = this.height_ / 2;

  this.ctx_.save();
  this.ctx_.translate(centerX, centerY);
  this.ctx_.rotate(this.library_.radians(this.rotation));
  this.ctx_.beginPath();
  this.ctx_.moveTo(x, y);
  this.ctx_.lineTo(x2, y);
  this.ctx_.lineTo(x2, y2);
  this.ctx_.lineTo(x, y2);
  this.ctx_.lineTo(x, y);
  this.ctx_.closePath();
  if (this.solidFill !== false) {
    this.ctx_.fill();
  }
  this.ctx_.stroke();
  this.ctx_.restore();
};


lexi.Box.prototype.move = function (x, y, milliseconds) {
  var args = parseArguments(arguments);
  x = args['numbers'][0];
  y = args['numbers'][1];
  milliseconds = args['numbers'][2];

  // If nothing is passed, move randomly.
  if (arguments.length === 0) {
    var minX = this.width_ / 2;
    var minY = this.height_ / 2;
    var maxX = this.library_.width() - (this.width_ / 2);
    var maxY = this.library_.height() - (this.height_ / 2);
    x = this.library_.random(minX, maxX);
    y = this.library_.random(minY, maxY);
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
    x = this.x + delta['dx'] + (this.width_ / 2);
    y = this.y + delta['dy'] + (this.height_ / 2);

    // For relative directions, the milliseconds are the
    // second number.
    milliseconds = args['numbers'][1];
  }

  if (milliseconds) {
    this.moveAnimation_ = {};
    this.moveAnimation_.endX = x - (this.width_ / 2);
    this.moveAnimation_.endY = y - (this.height_ / 2);
    this.moveAnimation_.startX = this.x;
    this.moveAnimation_.startY = this.y;
    this.moveAnimation_.startTime = this.library_.getLastFrameEndTime_();
    this.moveAnimation_.length = milliseconds;
  } else {
    this.x = x - (this.width_ / 2);
    this.y = y - (this.height_ / 2);
    this.moveAnimation_ = null;
  }

  this.library_.requestRedraw();
  return this;
};


lexi.Box.prototype.size = function (width, height, milliseconds) {

  var ratio;

  if (milliseconds) {
    this.sizeAnimation_ = {};
    this.sizeAnimation_.endW = width;
    this.sizeAnimation_.endH = height;
    this.sizeAnimation_.startW = this.width_;
    this.sizeAnimation_.startH = this.height_;
    this.sizeAnimation_.startTime = this.library_.getLastFrameEndTime_();
    this.sizeAnimation_.length = milliseconds;
  } else if (width !== undefined && height !== undefined) {
    this.width_ = width;
    this.height_ = height;
    this.sizeAnimation_ = null;
  } else if (width !== undefined && height === undefined) {
    // Maintain ratio between width and height.
    ratio = this.width_ / this.height_;
    this.width_ = width;
    this.height_ = width / ratio;
  } else {
    // Nothing was passed, choose a random size between 20 and 500.
    // Maintain ratio between width and height.
    ratio = this.width_ / this.height_;
    var newWidth = random(20, 500);
    this.width_ = newWidth;
    this.height_ = newWidth / ratio;
    this.sizeAnimation_ = null;
  }
  this.library_.requestRedraw();
  return this;
};


lexi.Box.prototype.getBoundingPoints_ = function () {

  var boundingPoints = {
    'left': this.x,
    'top': this.y,
    'width': this.width_,
    'height': this.height_,
    'centerX': this.x + (this.width_ / 2),
    'centerY': this.y + (this.height_ / 2)
  };
  return boundingPoints;
};


lexi.Box.prototype.change = function (fillColor, opt_lineColor, opt_solidFill) {

  var args = parseArguments(arguments);
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