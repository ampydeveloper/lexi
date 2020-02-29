var library = library || {};
var lexi = lexi || {};


function cleanAssetName(name) {
    var cleanAsset = ('' + name).toLowerCase().replace(/\s/gi, '').
        replace(/['".,/#!$%^&*;:{}=`~()]/gi, '');
    return removeOneFromAssetName(cleanAsset);
}

function removeOneFromAssetName(name) {
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
  }


  /**
 * Parses a javascript arguments list into a nice structure like so:
 * {
 *   "numbers": [0, 0, 100, 100],
 *   "colors": ['red'],
 *   "strings": ['Cat1', 'wood'],
 *   "functions": [foo],
 *   "objects": [bar, bam, [whatever]]
 * }
 * @param {Array} args The array of arguments.
 * @param {number=} opt_skip Optional number of parameters to skip. Useful
 *     for functions like text() where the first param is of particular
 *     value.
 * @return {Object} A nice hash of arrays, by argument type.
 * @private
 */
function parseArguments(args, opt_skip) {
  var vals = {'numbers': [],
              'colors': [],
              'strings': [],
              'functions': [],
              'objects': [],
              'booleans': [],
              'pictures': []};
  var first = opt_skip || 0;
  for (var i = first; i < args.length; i++) {
    var arg = args[i];
    var type = typeof arg;
    if (Array.isArray(arg)) {
      vals.arrays = vals.arrays || [];
      vals.arrays.push(arg);
    } else if (type === 'number') {
      vals.numbers.push(arg);
    } else if (type === 'string') {

      vals.strings.push(arg);
      if (parseDirection(arg)) {
        vals.directions = vals.directions || [];
        vals.directions.push(parseDirection(arg));
      }

      if (parseFont(arg)) {
        vals.fonts = vals.fonts || [];
        vals.fonts.push(parseFont(arg));
      }

      if (parsePicture(arg)) {
        vals.pictures = vals.pictures || [];
        vals.pictures.push(parsePicture(arg));
      }

      var color = parseColor(arg);
      if (color) {
        vals.colors.push(color);
      }

    } else {
      vals[type + 's'] = vals[type + 's'] || [];
      vals[type + 's'].push(arg);
    }
  }
  return vals;
}



/**
 * Cleans up an asset name by removing spaces and making it lowercase.
 * @param {string} asset A potential asset name.
 * @return {string} A guaranteed clean asset name.
 * @private
 */
function getCleanName(asset) {
  return (asset || '').replace(/\s/gi, '').toLowerCase();
}


/**
 * Parses a string to see if it contains a supported font.
 * @param {string} font The array of arguments.
 * @return {string|boolean} The full font definition if found, or
 *     false if none matches.
 * @private
 */
function parseFont(font) {
  var fontName = getCleanName(font);
  return lexi.fontList[fontName] || lexi.googleFonts[fontName] || false;
}


/**
 * Parses a string to see if it contains a common "direction", such
 * as up, down, etc.
 * @param {string} direction The potential direction string.
 * @return {string|boolean} The lowercased direction if one is found, or
 *     false if none matches.
 * @private
 */
function parseDirection (direction) {
  var lowercaseDirection = direction.toLowerCase().replace(/\s/gi, '');
  if (lowercaseDirection === 'up' || lowercaseDirection === 'down' ||
      lowercaseDirection === 'left' || lowercaseDirection === 'right' ||
      lowercaseDirection === 'north' || lowercaseDirection === 'south' ||
      lowercaseDirection === 'east' || lowercaseDirection === 'west' ||
      lowercaseDirection === 'northeast' ||
      lowercaseDirection === 'southeast' ||
      lowercaseDirection === 'southwest' ||
      lowercaseDirection === 'northwest' ||
      lowercaseDirection === 'center') {
    return lowercaseDirection;
  }
  return false;
}

/**
 * Parses a string to see if it expresses a valid image. If so, returns an
 * Image object.
 * @param {string} image The potential image name string.
 * @return {string} A URL to load the image from, or false if not found.
 * @private
 */
function parsePicture(image) {
  var imageName = getCleanName(image);

  // Look to see if we have any language-localized fills of this name.
  if (lexi.strings.fills && lexi.strings.fills[imageName]) {
    imageName = lexi.strings.fills[imageName];
  }

  if (library.picturesByName_[imageName]) {
    return library.picturesByName_[imageName];
  }

  var url;
  if (lexi.pictures && lexi.pictures[imageName]) {
    url = lexi.pictures[imageName];
    return library.loadFillPicture_(imageName, url);
  } else if (library.stampsByName_[imageName]) {
    return library.stampsByName_[imageName];
  }

  return library.loadFillPicture_(imageName,'fills/fillnotfound.png');
}



function parseColor(color) {
  var colorName = getCleanName(color);
  if (lexi.colors && lexi.colors[colorName]) {
    return lexi.colors[colorName];
  }

  // Look to see if we have any language-localized colors of this name.
  if (lexi.strings.colors && lexi.strings.colors[colorName]) {
    return lexi.strings.colors[colorName];
  }
  return false;
}






