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