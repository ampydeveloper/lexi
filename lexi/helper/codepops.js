var codepops = codepops || {};


/**
 * Array of our standard Codepops colors.
 * @type {Array.<Array.<number>>}
 */
codepops.colors = [
  [222, 32, 44],
  [241, 90, 41],
  [247, 147, 29],
  [0, 147, 68],
  [10, 78, 155],
  [103, 45, 145],
  [158, 31, 99],
  [222, 32, 44]
];


/**
 * A list of commands that can load custom content.
 * @type {Array.<string>}
 */
//TODO (jeff): Need reset to go with fills.
codepops.customAssetCommands = ['stamp', 'fill', 'change'];

/**
 * A list of asset types that can have custom content.
 * @type {Array.<string>}
 */
codepops.customAssetTypes = ['stamp', 'fill'];

// Polyfills for our lovely IE users <3.
if (!Object.entries) {

  /**
   * Polyfill for the Object.entries method.
   * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/
   *         Reference/Global_Objects/Object/entries#Polyfill
   * @param {Object} obj The object in which to return the entries from.
   * @return {Object} An array of the handed in object's enumerable
   *     property [key, value] pairs.
   */
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i); // Preallocate the Array.
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
  };
}


/**
 * Polyfill for the .remove() DOM command, to make it work in IE.
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
 * @param {Element} arr The child node to remove from the DOM tree
 *     it belongs to.
 */
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode === null) {
          return;
        }
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


/**
 * Handy bind function.
 * @param {function} fn The function to be bound.
 * @param {object} selfObj The object that should be bound to the keyword this.
 * @param {object} var_args Additional arguments to be passed to bound function.
 * @return {function} The bound function.
 */
codepops.bind = function(fn, selfObj, var_args) {
  var boundArgs = fn.boundArgs_;
  if (arguments.length > 2) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (boundArgs) {
      args.unshift.apply(args, boundArgs);
    }
    boundArgs = args;
  }
  selfObj = fn.boundSelf_ || selfObj;
  fn = fn.boundFn_ || fn;
  var newfn;
  var context = selfObj || top;
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
 * Returns a deep clone of an object.
 * @param {object} obj The object to be cloned.
 * @return {object} The clone of the object.
 */
codepops.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};


/**
 * Converts string to title case.
 * @param {string} str The string to be modified.
 * @return {string} The title-cased string.
 */
codepops.toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};


/**
 * Sends an event to Google analytics.
 * @param {string} category The category of event, like 'editor'.
 * @param {string} eventName The name of event, like 'launch'.
 * @param {string} note Arbitrary note about the event.
 */
codepops.trackEvent = function(category, eventName, note) {
  if (window._gaq !== undefined) {
    window._gaq.push(['_trackEvent', category, eventName, note]);
  }
};


/**
 * Lerps between two numbers.
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @param {number} u The factor between 0 and 1.
 * @return {number} The interpolated value.
 */
codepops.lerp = function(a, b, u) {
  return (1 - u) * a + u * b;
};


/**
 * Translates a string to the current user language.
 * @param {string} str The string to translate.
 * @return {string} The translated string.
 */
codepops.translate = function(str) {
  var namespace = lexi || {};
  var strings = namespace.strings || {};
  var collection = strings.ui || {};
  var translation = collection[str] || str;
  return translation;
};


/**
 * Global pointer to our translate function.
 * @export
 */
$t = codepops.translate;


/**
 * Searches through the HTML of the current web page for elements containing
 * an attribute like <span l10n="all">Foo</span>, or a tag like <l10n>Foo</l10n>
 * and attempts to translate their contents in place.
 * @param {Document} document The HTML document to localize.
 */
codepops.localizeHtml = function(document) {

  // Bail unless a page query contains hl=[language code besides en].
  if (codepops.language == 'en') {
    return;
  }
  
  // Match the tag l10n or an attribute.
  var els = document.querySelectorAll('l10n, [l10n]');
  
  for (var i = 0; i < els.length; i++) {
    var englishString = els[i].innerHTML || '';
    var localizedString = $t(englishString);
    if (localizedString != englishString) {
      els[i].innerHTML = localizedString;
    }
  }
};


/**
 * Returns a random color from the codepops set, expressed as rgb statement.
 * @return {string} A color string, such as 'rgb(255,0,0)'.
 */
codepops.randomColor = function() {
  var index = Math.floor(Math.random() * 7);
  var colorArray = codepops.colors[index];
  return 'rgb(' + colorArray[0] + ',' + colorArray[1] + ',' +
      colorArray[2] + ')';
};


/**
 * Rolls a random integer between two values. If only one is passed, choose
 * between 1 and that number.
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @return {number} The random number.
 */
codepops.dice = function(a, b) {
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
};


/**
 * Returns a random name. A nicer alternative to being named "guest".
 * @return {string} A name, like "Scoobie"
 */
codepops.randomName = function() {
  var names = [
    $t('big coder')
  ];
  var index = Math.floor(Math.random() * names.length);
  return names[index];
};


/**
 * Takes a date object and returns something that is one day later.
 * @param {Date} date The date object to increment.
 * @param {number=} opt_amount How many days to increment, defaults to 1.
 * @return {Date} The incremented date.
 */
codepops.incrementDay = function(date, opt_amount) {
  var amount = opt_amount || 1;
  var tzOff = date.getTimezoneOffset() * 60 * 1000,
      t = date.getTime(),
      d = new Date(),
      tzOff2;

  t += (1000 * 60 * 60 * 24) * amount;
  d.setTime(t);

  tzOff2 = d.getTimezoneOffset() * 60 * 1000;
  if (tzOff !== tzOff2) {
    var diff = tzOff2 - tzOff;
    t += diff;
    d.setTime(t);
  }

  return d;
};


/**
 * Takes a Date() object, and returns the "date string" for it. Which is a
 * handy string in the form 2014-2-25.
 * @param {Date} date The date to convert.
 * @return {string} String in the form '2014-2-5'.
 */
codepops.dateToString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
      date.getDate();
};


/**
 * Takes a string representing a date, like '2014-12-25', and returns a
 * Date object for it.
 * @param {string} dateString String in the form '2014-2-5'.
 * @return {Date} The new date object.
 */
codepops.stringToDate = function(dateString) {
  return new Date(dateString.replace('-', ' '));
};


/**
 * Takes an element id and some content, and pokes that content into the
 * element. If the element is not found, it's ignored.
 * @param {string} id The element id to poke into.
 * @param {string} content The HTML content to use.
 */
codepops.setContent = function(id, content) {
  var el = document.getElementById(id);
  if (el) {
    el.innerHTML = content;
  }
};


/**
 * Takes an element id and returns whatever it has inside of it.
 * @param {string} id The element id to get content from.
 * @return {string} The content.
 */
codepops.getContent = function(id) {
  var el = document.getElementById(id);
  if (el) {
    if (el.value) {
      return el.value;
    }
    if (el.innerHTML) {
      return el.innerHTML;
    }
  }
  return null;
};


/**
 * Toggles an element between two CSS classes.
 * @param {string} id The element id to toggle.
 * @param {string} class1 The first CSS class.
 * @param {string} class2 The second CSS class.
 */
codepops.toggleClass = function(id, class1, class2) {
  var el = document.getElementById(id);
  if (el) {
    if (el.className === class1) {
      el.className = class2;
    } else {
      el.className = class1;
    }
  }
};


/**
 * Replaces instance of templatized substrings based on matching keys in
 * some hash. So a string like 'Hello, {{name}}' with a collection of
 * {'name': 'fred'} would return 'Hello, fred'. Any keys in the string
 * that aren't in the collection will not be replaced.
 * @param {string} str The string to find/replace within.
 * @param {Object} collection A hash of stuff to look for.
 * @return {string} The fixed string.
 */
codepops.replaceFromTemplate = function(str, collection) {
  var fixedString = str.replace(/\{\{(\w+)\}\}/g, function(match, $1) {
    if (collection[$1]) {
      return collection[$1];
    }
    return '{{' + $1 + '}}';
  });
  return fixedString;
};


/**
 *
 */
codepops.codeCompareStates = {'INCOMPLETE': 0, 'COMPLETE': 1, 'MODIFIED': 2};

/**
 * This function compares the full code of two apps, (usually a parent and
 * child) line-by-line to see if the child app is "complete". We use
 * doesCodeContain to do the comparisons of each line.
 * @param {String} originalAppCode The code for the parent app.
 * @param {String} childAppCode The code for the current child app.
 * @return {Boolean} True if the child app is "complete".
 */
codepops.compareCode = function(originalAppCode, childAppCode) {

  var childLines = childAppCode.trim().split(/\n+/g);
  var origLines = originalAppCode.trim().split(/\n+/g);
  var numMatches = 0;

  for (var i = 0; i < childLines.length; i++) {
    var childLine = childLines[i];
    var origLine = origLines[i];
    if ((childLine === undefined && origLine !== undefined) ||
        (childLine !== undefined && origLine === undefined)) {
      continue;
    } else if (codepops.doesCodeContain(childLine, origLine)) {
      numMatches++;
    }
  }

  if (numMatches >= origLines.length &&
      childLines.length >= origLines.length * 1.1) {
    return codepops.codeCompareStates.MODIFIED;
  } else if (numMatches >= origLines.length * 0.9) {
    return codepops.codeCompareStates.COMPLETE;
  }
  return codepops.codeCompareStates.INCOMPLETE;

};


/**
 * A semi-smart way of seeing if a given code snippet exists within
 * another. Useful for checking if user code exists inside some tutorial
 * expectations, for example.
 * @param {string} actualCode The code that we have, presumably that the
 *     user typed.
 * @param {string} expectedCode Some code to look for.
 * @return {boolean} Whether the actualCode contains the expectedCode.
 */
codepops.doesCodeContain = function(actualCode, expectedCode) {
  var actual = actualCode;
  var expected = expectedCode;

  // Remove things inside double quotes.
  var doubleQuotesPattern = /("(\\"|[^"])+")/g;
  actual = actual.replace(doubleQuotesPattern, '""');
  expected = expected.replace(doubleQuotesPattern, '""');

  // Remove things inside single quotes.
  var singleQuotesPattern = /('(\\'|[^'])+')/g;
  actual = actual.replace(singleQuotesPattern, "''");
  expected = expected.replace(singleQuotesPattern, "''");

  // Standardize on single quotes, so "" and '' are equivalent.
  actual = actual.replace(/"/g, "'");
  expected = expected.replace(/"/g, "'");

  // Remove all whitespace.
  actual = actual.replace(/\s/g, '');
  expected = expected.replace(/\s/g, '');

  // Collapse numbers.
  actual = actual.replace(/[\d.]+/g, '1');
  expected = expected.replace(/[\d.]+/g, '1');

  // Erase semicolons.
  actual = actual.replace(/;/g, '');
  expected = expected.replace(/;/g, '');

  // If the expectedCode is an empty string (""), it will always be found
  // in the actual string. The empty string is present between every character
  // of any string. So "Foo".indexOf("") always returns 0.
  // So, check for that first.
  if (expected === '' && actual !== '') {
    return false;
  }

  if ((expected.indexOf('//') === 0 || expected.indexOf('/*') === 0) &&
       actual === '') {
    return true;
  }

  if (actual.indexOf(expected) > -1) {
    return true;
  }
  return false;
};


/**
 * Returns a nice object representation of the query string data.
 * @return {Object} The nice object.
 */
codepops.parseQueryString = function() {
  var pairs = location.search.slice(1).split('&');

  var result = {};
  pairs.forEach(function(pair) {
    pair = pair.split('=');
    result[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  return JSON.parse(JSON.stringify(result));
};


/**
 * Displays a hidden div in our HOC teacher page. It will also hide
 * the same div if clicked again.
 * @param {string} theChosenOne The id of the element to show.
 */
codepops.showDiv = function(theChosenOne) {
  var newBoxes = document.getElementsByTagName('div');
  for (var i = 0; i < newBoxes.length; i++) {
    var name = newBoxes[i].className;
    if (name === 'new-boxes-2') {
      if (newBoxes[i].id === theChosenOne) {
        if (newBoxes[i].style.display === 'block') {
          newBoxes[i].style.display = 'none';
        } else {
          newBoxes[i].style.display = 'block';
        }
      }
    }
  }
};


/**
 * Takes a string name of an asset and "cleans it up" to be all lower case,
 * with no spaces and no punctuation. That way you could get your 'choochoo'
 * sprite by using 'ChooChoo' or 'Choo choo!'. It's just a way of being more
 * forgiving to beginning programmers. Upon being cleaned up, the asset name
 * will then get run through the removeOneFromAssetName function.
 * @param {string} name The name to clean up.
 * @return {string} The cleaned up name.
 */
codepops.cleanAssetName = function(name) {
  var cleanAsset = ('' + name).toLowerCase().replace(/\s/gi, '').
      replace(/['".,/#!$%^&*;:{}=`~()]/gi, '');
  return codepops.removeOneFromAssetName(cleanAsset);
};


/**
 * Takes a string name of an asset with a '1' on the end and removes it, unless
 * that string name already exists in lexi.stampList. That way when the user
 * types 'cube1' it will return the 'cube' sprite instead of 'stampnotfound'.
 * If the string name of the asset does exist, it will return that string name,
 * unchanged.
 * @param {string} name The name to remove '1' from.
 * @return {string} The name with '1' removed.
 */
codepops.removeOneFromAssetName = function(name) {
  // If the string name is of a custom asset, let's cut it off at the pass
  // and return the name. No need to remove a '1' from those.
  if (name.indexOf('@') === 0) {
    return name;
  }

  var str = ('' + name);
  var n = str.lastIndexOf('1') === str.length - 1;
  if (n && lexi.stampList[str]) {
    return str;
  }
  return str.replace(/([a-zA-Z]+)1$/, '$1');
};


/**
 * Look in the user preferences for an asset of the given type, and return
 * the Cloud Storage URL.
 * @param {String} assetType The asset type. This should be a value from
 *     codepops.customAssetTypes.
 * @param {String} assetName The name of the asset we're looking for.
 * @param {Object} customAssetHash The customAssets collection from the
 *     user preferences.
 * @return {String|undefined} The Cloud Storage URL, or undefined if not found.
 */
codepops.getCustomAssetPath = function(assetType, assetName, customAssetHash) {

  if (assetName.indexOf('@') === 0) {
    assetName = assetName.substring(1);
  }

  if (assetType.indexOf('s') < 0 ||
      assetType.indexOf('s') !== assetType.length) {
    assetType = assetType + 's';
  }

  if (customAssetHash && customAssetHash[assetType] &&
      customAssetHash[assetType][assetName] &&
      customAssetHash[assetType][assetName]['url']) {

    return customAssetHash[assetType][assetName]['url'];
  }
  return undefined;
};


/**
 * Checks every pixel within a canvas object to see if the majority of
 * pixels are white. If so, run the onComplete function with a parameter
 * of true, signifying that the image should be displayed with a
 * gray background.
 * @param {object} thumb The canvas object to check every pixel of.
 * @param {function} onComplete The callback function to run once we're
 *   done here.
 */
codepops.isImageAllWhite = function(thumb,
  onComplete) {

  var w = thumb.width;
  var h = thumb.height;

  var thumbCtx = thumb.getContext('2d');
  var thumbData = thumbCtx.getImageData(0, 0, w, h);

  // Loop across the images and count all the relatively
  // white/light pixels.
  var whitePixels = 0;

  var totalPixels = w * h;

  var firstPixel = false;
  var firstPixelIsWhite = false;
  var colorPixelInMiddle = false;
  var lastPixelIsWhiteOrAlpha = false;
  var whiteObjectWithColor = false;

  var alpha = true;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var pixel = this.getPixel(thumbData, x, y, w);

      // Leave a little room for variation in white.
      var r = pixel['r'];
      var whiteR = r >= 240;

      var g = pixel['g'];
      var whiteG = g >= 240;

      var b = pixel['b'];
      var whiteB = b >= 240;

      var a = pixel['a'];

      // If we have our first non-transparent pixel, continue.
      if (a !== 0 && !firstPixel) {
        firstPixel = true;
        if (whiteR && whiteG && whiteB) {
          firstPixelIsWhite = true;
        }
      } else if (a !== 0 && firstPixelIsWhite) {
        if (!(whiteR && whiteG && whiteB) && !colorPixelInMiddle) {
          colorPixelInMiddle = true;
        }
      }

      // Once the last pixel has been checked, we'll be left with a
      // boolean stating whether or not our last pixel was of color
      // or not.
      if ((whiteR && whiteG && whiteB) || (a === 0)) {
        lastPixelIsWhiteOrAlpha = true;
      } else {
        lastPixelIsWhiteOrAlpha = false;
      }

      if (whiteR && whiteG && whiteB) {

        // Count white pixels.
        whitePixels = whitePixels + 1;
      } else if (a === 0) {

        // Exclude alpha so that we're just comparing
        // non-transparent pixels.
        totalPixels = totalPixels - 1;
      }
    }
  }

  if (colorPixelInMiddle && lastPixelIsWhiteOrAlpha) {
    whiteObjectWithColor = true;
  }

  // If true, no alpha was found.
  if (totalPixels === w * h) {
    alpha = false;
  }

  var whitePixelRatio = whitePixels / totalPixels;

  if (((whitePixelRatio >= .9) || whiteObjectWithColor) && alpha) {
    // Add gray background.
    onComplete(true);
  } else {
    onComplete(false);
  }
};


/**
 * Retrieves and returns the RGBA values of a pixel from the handed
 * in image data.
 * @param {Array} imageData The data as returned from a canvas.getImageData()
 *     call.
 * @param {number} x The x position, from the top-left origin.
 * @param {number} y The y position, from the top-left origin.
 * @param {number} w The width of the image.
 * @return {Object} A nice object in the form {r:255, g:255, b:255, a:128}.
 */
codepops.getPixel = function(imageData, x, y, w) {
  var i = (y * w + x) * 4;
  var pixel = {};
  pixel['r'] = imageData.data[i + 0];
  pixel['g'] = imageData.data[i + 1];
  pixel['b'] = imageData.data[i + 2];
  pixel['a'] = imageData.data[i + 3];
  return pixel;
};


/**
 * Takes an ugly backend error and tries to make it friendlier.
 * @param {string} error The error message returned by the server.
 * @return {string} A friendly error.
 * @private
 */
codepops.friendlyBackendError_ = function(error) {

  // TODO(scott): I believe that all of these UPPERCASE error codes
  // have changed in the latest Firebase API, so we need to audit them and fix.
  if (error && error['code']) {
    if (error['code'] === 'INVALID_EMAIL' ||
        error['code'] === 'auth/invalid-email') {
      return $t('Oops! Did you make a typo in your email?');
    }
    if (error['code'] === 'INVALID_USER' ||
        error['code'] === 'auth/user-not-found') {
      return $t('<small><b>Uh oh! That doesn\'t seem to be a coding account.' +
          '</b><ul><li>Did you <span onclick="$_page.loginWithGoogle()" ' +
          'style="text-decoration: underline; cursor: pointer;">sign in ' +
          'with a Google account</span> when you started coding?</li>' +
          '<li>Head to your ' +
          '<a href="https://subscribe.bitsbox.com/customer/login" ' +
          'target="_blank" style="color:black">store ' +
          'account</a> if you want to manage your subscription.</li>' +
          '<li>Questions? Feel free to contact help@bitsbox.com.</li></ul>' +
          '</small>');
    }
    if (error['code'] === 'INVALID_PASSWORD' ||
        error['code'] === 'auth/wrong-password') {
      return $t('Sorry, that username or password is incorrect.');
    }
    if (error['code'] === 'auth/requires-recent-login') {
      return $t('Oops. We need you to logout and log ' +
          'back in before you can do that.');
    }
    if (error['code'] === 'auth/email-already-in-use') {
      return $t('<p><strong>Oops. It looks like we already have an account '
          + 'under this email address!</strong></p>'
          + '<a href="#">Click here to login instead.</a>');
    }
  }

  if (error['message']) {
    console.error(error['message']);
    return error['message'].replace(/FirebaseSimpleLogin:/g, '');
  }

  return error;
};


/**
 * Combines the values of two hashes. The values from the second hash will
 * overwrite any existing values with the same keys in the first hash.
 * Directly modifies and returns the first hash.
 * This is a very simple implementation of Object.assign, which is not
 * supported in ES5 (and hence IE11)
 * @param {Object} hash1 The first hash.
 * @param {Object} hash2 The second hash.
 * @return {Object} The modified hash1.
 */
codepops.combineHashes = function(hash1, hash2) {
  var hash2Keys = Object.keys(hash2);
  for (var i = 0; i < hash2Keys.length; i++) {
    var key = hash2Keys[i];
    hash1[key] = hash2[key];
  }
  return hash1;
};

/**
 * Firebase does not allow certain characters as part of keys, notably dot (.).
 * This is because every path to a node in firebase must also be a legal URL.
 * This function (based on a post by a Google engineer:
 * https://groups.google.com/d/msg/firebase-talk/vtX8lfxxShk/skzA5vQFdosJ)
 * encodes the specific disallowed characters.
 * When we run this on a string that has been URI encoded and then unencoded,
 * it's important to remember that the + character will have been automatically
 * unencoded as a space. But it may be part of a legit email address.
 * (e.g. scott+audrey@bitsbox.com) So we added another line to replace
 * whitespace with +.
 * @param {string} stringToEscape The string to encode.
 * @return {string} The encoded string.
 */
codepops.encodeAsFirebaseKey = function(stringToEscape) {
  return stringToEscape.replace(/%/g, '%25')
    .replace(/\./g, '%2E')
    .replace(/#/g, '%23')
    .replace(/\$/g, '%24')
    .replace(/\//g, '%2F')
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D')
    .replace(/\s/g, '+');
};
