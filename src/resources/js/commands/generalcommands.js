var library = library || {};
var lexi = lexi || {};


function delay(callback, pause) {
    if (arguments.length <= 2) {
        library.window_.setTimeout(callback, pause);
    } else {
        // The slice call is needed because arguments is not an array.
        var argsAsArray = Array.prototype.slice.call(arguments);
        library.window_.setTimeout.apply(library.window_, argsAsArray);
    }
}


/**
 * Returns the distance between a couple of numbers or a couple of
 * Stamps. The number will always be positive.
 * @param {lexi.Stamp|number} a The first thing to use.
 * @param {lexi.Stamp|number} b The second thing to use.
 * @return {number} The distance between a and b.
 */
function distance(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        return Math.abs(a - b);
    }

    // If the thing is a stamp (or a stamp-like object with x's and y's), we
    // can measure between them with a little math.
    if (a.x !== undefined && a.y !== undefined &&
        b.x !== undefined && b.y !== undefined) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}



/**
 * Returns an array of unhidden stamps that match the queried name.
 * @param {string} query The name of the stamps to find.
 * @return {Array.<lexi.Command>} The array of stamps found.
 */
function find(query) {
    var name = library.getCleanName_(query);
    if (name.indexOf('.') > -1) {
        name = name.replace(/\./gi, '');
    }
    var commands = library.sceneStack_;
    var stamps = [];
    for (var i = 0; i < commands.length; i++) {
        var stamp = commands[i];
        if (stamp.cleanName_ && stamp.cleanName_ === name &&
            stamp.hidden === false) {
            stamps.push(stamp);
        }
    }
    return stamps;
}


/**
 * Returns a string representing a color at a given x,y position.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @return {object} A color string, like 'red' or 'rgb(0,0,0)'.
 */
function look(x, y) {
    var pixel = peek(x, y);
    
    return 'rgb(' + pixel.rgb + ')';
}


/**
 * Reads a handy pixel struct from the canvas.
 * @param {number} floatX The x position, which may be a fraction.
 * @param {number} floatY The y position, which may be a fraction.
 * @return {Object} A nice struct with r, g, b, a values.
 */
function peek(floatX, floatY) {
    // TODO(scott): Make the drawing commands "dirty" the buffer so that we
    // don't have to do a full image read. Really expensive.
    var x = Math.floor(floatX);
    var y = Math.floor(floatY);
    var imgData = library.ctx_.getImageData(0, 0, library.width_, library.height_);
    var index = (y * imgData.width + x) * 4;
    var r = imgData.data[index] || 0;
    var g = imgData.data[index + 1] || 0;
    var b = imgData.data[index + 2] || 0;
    var a = imgData.data[index + 3] || 0;
    return {
        'r': r,
        'g': g,
        'b': b,
        'a': a,
        'rgb': r + ',' + g + ',' + b
    };
}



/**
 * Returns true if a position or stamp is offscreen.
 * @param {number} x The x coordinate of the stamp or position.
 * @param {number} y The y coordinate of the stamp or position.
 * @return {boolean} True if the stamp or position is offscreen.
 */
offscreen = function offscreen(x, y) {

    var offscreen_ = function(x, y) {
        if (x < 0 || y < 0) {
        return true;
        }
        var maxX = library.width_;
        var maxY = library.height_;
        if (x > maxX || y > maxY) {
        return true;
        }
        return false;
    };
  
    var offscreenArray_ = function(stampArray) {
        for (var i = 0; i < stampArray.length; i++) {
        var stamp = stampArray[i];
        if (offscreen_(stamp.x, stamp.y)) {
            return true;
        }
        }
        return false;
    };
  
  
    var args = parseArguments(arguments);
  
    // If the first argument is an object that contains x and y
    // members, use those. Useful for testing stamps for offscreen-ness.
    if (args.objects.length === 1 &&
        args.objects[0].x !== undefined &&
        args.objects[0].y !== undefined) {
  
        x = args.objects[0].x;
        y = args.objects[0].y;
        return offscreen_(x, y);
    }
    if (args.arrays && args.arrays.length === 1 &&
        Array.isArray(args.arrays[0])) {
      return offscreenArray_(args.arrays[0]);
    }
    return offscreen_(x, y);
};



/**
 * Rolls a random integer between two values. If only one is passed, choose
 * between 1 and that number.
 *
 * Alternatively, you can pass in a list of 3 or more values, and it will
 * choose between all of them. Or, you can pass in an array and it will
 * choose one thing from within the array.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @return {number|Object} The randomly generated number or randomly chosen
 *     object from the passed-in array.
 */
 function random(a, b) {
    var args = parseArguments(arguments);
  
    // We start with the assumption that we do not have a list of items to choose.
    var listOfItems = false;
  
    // If we have no arguments, then choose number 0 thru 9.
    if (arguments.length === 0) {
      var r = Math.floor(10 * Math.random());
      return r;
    }
  
    // If we have 3 or more arguments, then choose from among them.
    if (arguments.length > 2) {
      listOfItems = arguments;
    }
  
    // If we have two or fewer arguments, and any of them is not a number,
    // then choose from among them. (Like random(true,false) or random(1,'foo');
    if (arguments.length <= 2 && args.numbers.length !== arguments.length) {
      listOfItems = arguments;
    }
  
    // If there is exactly one array passed, the list of items to choose from
    // is the array's contents.
    if (args.arrays && args.arrays.length === 1 && arguments.length === 1) {
      listOfItems = args.arrays[0];
    }
  
    if (listOfItems) {
      // It's always possible one might accidentally pass in an empty array,
      // in which case, return null.
      if (listOfItems.length === 0) {
        return null;
      }
      return listOfItems[Math.floor(Math.random() * listOfItems.length)];
    }
  
    // If we got library far, then it's just a numeric random we're running.
    var min = 1;
    var max = a;
  
    if (typeof b === 'number') {
      min = Math.min(a, b);
      max = Math.max(a, b);
    } else if (a < 0) {
      min = Math.min(a, -1);
      max = Math.max(a, -1);
    }
    var range = max - min + 1;
    var r = Math.floor(range * Math.random());
    return min + r;
}
  

/**
 * Repeats a function a number of times. The function that is called will
 * be passed a single parameter, i, which contains an integer from 1 to count.
 * @param {function} func The function to run.
 * @param {number} count The number of times to run it.
 */
function repeat(func, count) {

    var args = parseArguments(arguments);
    if (args.functions.length !== 1) {
      throw ('You must pass a function into the repeat() call.');
    }
    count = args.numbers[0] || 0;
    var functionToCall = args.functions[0];
  
    if (arguments.length <= 2) {
      // No arguments to pass through to callback.
      for (var i = 1; i <= count; i++) {
        functionToCall(i);
      }
    } else {
      // Ignore the first two args; pass the rest through to the callback.
      var argsToPass = Array.prototype.slice.call(arguments, 2);
      for (var j = 1; j <= count; j++) {
        // All args must be passed as part of same array, so stick j at the front.
        if (j === 1) {
          argsToPass.unshift(j);
        } else {
          argsToPass[0] = j;
        }
        functionToCall.apply(library, argsToPass);
      }
    }
}
  


/**
 * Resets (aka clears) the canvas.
 * @param {string} style Anything special about the reset.
 * @return {lexi.Command} The newly created Fill object.
 */
function reset(style) {
    // Clear our stamps and reset our zIndex value, but not if we're
    // just rerunning a reset for animation's sake.
    if (!library.isRedrawingACommand_) {
      library.largestZ_ = 0;
      library.sceneStack_ = [];
    }
    var ctx = library.ctx_;
    ctx.clearRect(0, 0, library.width_, library.height_);
  
    var args = parseArguments(arguments);
  
    if (args.numbers.length === 3) {
      var rgb = 'rgb(' + Math.round(args.numbers[0]) + ',' +
                Math.round(args.numbers[1]) + ',' +
                Math.round(args.numbers[2]) + ')';
      ctx.fillStyle = rgb;
      ctx.fillRect(0, 0, library.width_, library.height_);
    } else if (args.colors.length > 0) {
      ctx.fillStyle = args.colors[0];
      ctx.fillRect(0, 0, library.width_, library.height_);
  
    } else if (args.pictures.length > 0) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, library.width_, library.height_);
      if (args.pictures[0].complete || args.pictures[0].naturalWidth) {
        ctx.drawImage(args.pictures[0], 0, 0);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, library.width_, library.height_);
      }
  
      if (args.pictures[0].src &&
          args.pictures[0].src.indexOf('resources/fillnotfound.png') > -1) {
        // If we get here, we haven't found a fill. Record library fact.
        if (library.onAssetLoadError_) {
          library.onAssetLoadError_(
            cleanAssetName(args.strings[0]), 'fill');
        }
      }
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, library.width_, library.height_);
    }
  
    ctx.fillStyle = library.lastFillStyle_;
  
    return library.addCommandToStack_('reset', arguments);
}
  
  