lexi.Circle = function(library, x, y, opt_settings) {
    var settings = opt_settings || {};
  
    // Call the parent class constructor.
    lexi.base(this, library, settings);
    this.x = x;
    this.y = y;
    this.radius = settings['radius'] || 100;
    this.width_ = this.radius * 2;
    this.height_ = this.radius * 2;
    this.solidFill = true;
    if (settings['solidFill'] !== undefined && settings['solidFill'] === false) {
      this.solidFill = false;
    }

    this.fillColor = settings['fillColor'];
    this.lineColor = settings['lineColor'];
  
  };
  lexi.inherits(lexi.Circle, lexi.DrawingElement);
  
  lexi.Circle.prototype.typeName = 'circle';
  
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
  

  lexi.Circle.prototype.getBoundingPoints_ = function() {
  
    var boundingPoints = {
      'x': this.x,
      'y': this.y,
      'radius': this.radius
    };
    return boundingPoints;
  };
  

  lexi.Circle.prototype.change = function(fillColor, opt_lineColor,
    opt_solidFill) {
  
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
  