lexi.Command = function(library, functionName, args, z) {
    this.library_ = library;
    this.functionName_ = functionName;
    this.args_ = args;
    this.z = z;
    this.isHidden_ = false;
  };
  

  lexi.Command.prototype.draw = function() {
    if (this.isHidden_) {
      return;
    }
    this.library_.isRedrawingACommand_ = true;
    window[this.functionName_].apply(this.library_, this.args_);
    this.library_.isRedrawingACommand_ = false;
  };
  
  
  lexi.Command.prototype.onTick = function() {
  };
  
  
  lexi.Command.prototype.hide = function() {
    this.isHidden_ = true;
    this.library_.requestRedraw();
  };
  
  

  lexi.Command.prototype.change = function(value) {
    if (this.functionName_ === 'text') {
      this.args_[0] = value;
      this.library_.requestRedraw();
      return this;
    }
  };
  

  lexi.Command.prototype.unhide = function() {
    this.isHidden_ = false;
    this.library_.requestRedraw();
  };
  
  lexi.Command.prototype.show = lexi.Command.prototype.unhide;
  
  Object.defineProperty(lexi.Command.prototype, 'hidden', {
    'get': function() {
      return this.isHidden_;
    }
  });
  