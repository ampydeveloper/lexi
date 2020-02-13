lexi.Command = function(library, functionName, args, z) {
    /**
     * The library we're running within.
     * @type {lexi.Library}
     * @private
     */
    this.library_ = library;
  
    /**
     * The function name to call, like 'line'.
     * @type {string}
     * @private
     */
    this.functionName_ = functionName;
  
    /**
     * The arguments to pass along.
     * @type {lexi.Library}
     * @private
     */
    this.args_ = args;
  
    /**
     * The zIndex of this command.
     * @type {number}
     */
    this.z = z;
  
    /**
     * Whether we are hidden.
     * @private
     */
    this.isHidden_ = false;
  };
  
  
  /**
   * Draws out the command.
   */
  lexi.Command.prototype.draw = function() {
    if (this.isHidden_) {
      return;
    }
    this.library_.isRedrawingACommand_ = true;
    this.library_[this.functionName_].apply(this.library_, this.args_);
    this.library_.isRedrawingACommand_ = false;
  };
  
  
  /**
   * Does nothing at the moment, but it's called by the scene redraw code, and
   * we will eventually use it for animation.
   */
  lexi.Command.prototype.onTick = function() {
  };
  
  
  /**
   * Erases the current command. Poof!
   */
  lexi.Command.prototype.hide = function() {
    this.isHidden_ = true;
    this.library_.requestRedraw();
  };
  
  
  
  /**
   * Changes the command. Currently only works for Text objects.
   * @param {string} value The value to set.
   * @return {lexi.Command} The object that was changed.
   */
  lexi.Command.prototype.change = function(value) {
    // TODO(scott): Make it work with all commands.
    if (this.functionName_ === 'text') {
      this.args_[0] = value;
      this.library_.requestRedraw();
      return this;
    }
  };
  
  
  /**
   * Hides the current command. Poof!
   */
  lexi.Command.prototype.unhide = function() {
    this.isHidden_ = false;
    this.library_.requestRedraw();
  };
  
  
  /**
   * Unhides the current command. Poof!
   */
  lexi.Command.prototype.show = lexi.Command.prototype.unhide;
  
  
  /**
   * Gets the hidden-ness of the command.
   */
  Object.defineProperty(lexi.Command.prototype, 'hidden', {
    'get': function() {
      return this.isHidden_;
    }
  });
  