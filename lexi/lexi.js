var lexi = lexi || {};


/**
 * Namespace where we'll store any localized strings.
 * @namespace
 */
lexi.strings = lexi.strings || {};


/**
 * Maximum line width.
 * @const
 * @type {number}
 */
lexi.MAX_LINE_WIDTH = 40;

/**
 * Minimum line width.
 * @const
 * @type {number}
 */
lexi.MIN_LINE_WIDTH = 0;

/**
 * Default line width.
 * @const
 * @type {number}
 */
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

/**
 * A list of valid fonts and their definitions.
 */
lexi.fontList = {
  'impact': 'Impact, Charcoal, sans-serif',
  'palatino': '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  'tahoma': 'Tahoma, Geneva, sans-serif',
  'roboto': 'roboto',
  'sans': 'sans-serif',
  'sans-serif': 'sans-serif',
  'serif': 'serif',
  'hand': 'cursive',
  'mono': 'monospace',
  'century': 'Century Gothic, sans-serif',
  'lucida': '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  'gadget': '"Arial Black", Gadget, sans-serif',
  'times': '"Times New Roman", Times, serif',
  'narrow': '"Arial Narrow", sans-serif',
  'verdana': 'Verdana, Geneva, sans-serif',
  'console': '"Lucida Console", Monaco, monospace',
  'gill': '"Gill Sans", "Gill Sans MT", sans-serif',
  'trebuchet': '"Trebuchet MS", Helvetica, sans-serif',
  'courier': '"Courier New", Courier, monospace',
  'arial': 'Arial, Helvetica, sans-serif',
  'georgia': 'Georgia, Serif'
};

/**
 * A collection of google fonts. This gets populated in the lexi.Library
 * constructor.
 */
lexi.googleFonts = {};

// TODO(jeff): Does this variable name make sense for up and down?
var compassDirections = {'north': true, 'south': true, 'east': true,
                         'west': true, 'northeast': true, 'southeast': true,
                         'northwest': true, 'southwest': true, 'up': true,
                         'down': true};



/**
 * Handy bind function.
 * @param {Function} fn The function to be bound.
 * @param {Object} selfObj The object to be bound as 'this'.
 * @param {Array} var_args The arguments to be handed in to the bound function.
 * @return {Function} The newly bound function.
 */
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


/**
 * Handy inherits function. Here's what usage looks like.
 *
 * lexi.Car = function(settings) {
 *   this.fuel = 'gas';
 *   this.wheels = 4;
 * }
 *
 * lexi.Tesla = function(settings) {
 *   // Call the constructor code of the parent (optional).
 *   lexi.base(this, settings);
 *   this.fuel = 'electric';
 * }
 * lexi.inherits(lexi.Tesla, lexi.Car);
 *
 *
 * @param {function} childCtor The child constructor.
 * @param {function} parentCtor The parent constructor we want to inherit from.
 */
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


/**
 * Handy base function. Call from within the a constructor of child class and
 * it'll run the code inside the parent's class constructor.
 * See the lexi.inherits function for an example.
 * @param {Object} a The parent object.
 * @param {Object} b The child object.
 * @return {Object} The newly based object.
 */
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

/**
 * Detects if the user's browser is IE of any kind.
 * @param {string} opt_userAgent An optional user agent string. Useful for
 *     unit testing.
 * @return {Boolean} True if the user's browser is IE.
 */
lexi.isIE = function(opt_userAgent) {
  var userAgent = opt_userAgent || navigator.userAgent;
  return userAgent.indexOf('MSIE ') > -1 ||
         userAgent.indexOf('Trident') > -1 ||
         userAgent.indexOf('Edge') > -1;
};


/**
 * Detects if the user's browser is netscape/firefox of any kind.
 * @param {string} opt_userAgent An optional user agent string. Useful for
 *     unit testing.
 * @return {Boolean} True if the user's browser is firefox.
 */
lexi.isFirefox = function(opt_userAgent) {
  var userAgent = opt_userAgent || navigator.userAgent;
  return userAgent.toLowerCase().indexOf('firefox') > -1;
};


/**
 * Returns whether the code is able to access the top frame.
 * @return {string} path The datastore path.
 */
lexi.canAccessTopFrame = function() {
  try {
    // This code will fail if we try to access a top frame that doesn't match
    // the domain the library is running within.
    var topDocument = top.document;
    if (topDocument) {
      return true;
    } else {
      return false;
    }
  } catch(e) {
    return false;
  }
};

/**
 * Returns true if the query string has offline=1 somewhere inside it.
 * @return {boolean} Whether we're in offline mode.
 */
lexi.isOfflineMode = function() {
  return ('' + top.location.href).indexOf('offline=1') > -1;
};


/**
 * Gets a query parameter value based on the variable name.
 * @param {string} name The parameter's name.
 * @return {string} The value, or undefined if there's no variable of that name.
 */
lexi.getQueryParameter = function(name) {
  var queryString = window.location.search.substr(1);
  var parts = queryString.split('&');
  for (var i = 0; i < parts.length; i++) {
    var tuple = parts[i].split('=');
    if (tuple[0] === name && tuple.length > 1) {
      return decodeURIComponent(tuple[1]);
    }
  }
  return undefined;
};


/**
 * Make the Array forEach method be a bit more case insensitive.
 */
Array.prototype.foreach = Array.prototype.forEach;


/**
 * Checks if a font is available to be used on a web page.
 * @param {String} fontName The font to check.
 * @return {Boolean} Whether the font is available.
 * @license MIT
 * @copyright Sam Clarke 2013
 * @author Sam Clarke <sam@samclarke.com>
 * 
 * See: https://www.samclarke.com/javascript-is-font-available/
 */
lexi.isFontAvailable = function(fontName) {
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

  // Pre compute the widths of monospace, serif & sans-serif
  // to improve performance.
  var monoWidth  = getWidth('monospace');
  var serifWidth = getWidth('serif');
  var sansWidth  = getWidth('sans-serif');
  
  return monoWidth !== getWidth(fontName + ',monospace') ||
    sansWidth !== getWidth(fontName + ',sans-serif') ||
    serifWidth !== getWidth(fontName + ',serif');
};