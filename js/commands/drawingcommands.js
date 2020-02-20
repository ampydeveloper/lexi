var library = library || {};
var lexi = lexi || {};

function box(x1, y1, w, h) {
  var args = parseArguments(arguments);
  var settings = {};

  if (args.colors.length === 1) {
    settings.lineColor = args.colors[0];
    settings.fillColor = args.colors[0];
  } else if (args.colors.length === 2) {
    settings.lineColor = args.colors[1];
    settings.fillColor = args.colors[0];
  }

  // Check to see if we should fill the box.
  if (args.booleans[0] !== undefined && args.booleans[0] === false) {
    settings.solidFill = false;
  }


  //libfunction
  library.largestZ_++;
  settings.z = library.largestZ_;

  var newBox = new lexi.Box(library, x1, y1, w, h, settings);
  library.sceneStack_.push(newBox);
  newBox.draw();
  return newBox;
}


function circle(x, y, opt_radius) {

  var args = parseArguments(arguments);
  var settings = {};

  if (args.colors.length === 1) {
    settings.lineColor = args.colors[0];
    settings.fillColor = args.colors[0];
  } else if (args.colors.length === 2) {
    settings.lineColor = args.colors[1];
    settings.fillColor = args.colors[0];
  }

  settings.radius = 100;
  if (opt_radius && !isNaN(opt_radius)) {
    settings.radius = opt_radius;
  } else if (args.numbers.length > 2) {
    settings.radius = args.numbers[2];
  }

  // Check to see if we should fill the circle.
  if (args.booleans[0] !== undefined && args.booleans[0] === false) {
    settings.solidFill = false;
  }

  library.largestZ_++;
  settings.z = library.largestZ_;

  var newCircle = new lexi.Circle(library, x, y, settings);
  library.sceneStack_.push(newCircle);
  newCircle.draw();
  return newCircle;
}


function color(style) {
  var ctx = library.ctx_;
  var args = parseArguments(arguments);

  if (args.numbers.length > 0) {
    var rgb;

    if (args.numbers.length === 1) {
      rgb = 'rgb(' + Math.round(args.numbers[0]) + ',' +
        0 + ',' + 0 + ')';
    }

    if (args.numbers.length === 2) {
      rgb = 'rgb(' + Math.round(args.numbers[0]) + ',' +
        Math.round(args.numbers[1]) + ',' + 0 + ')';
    }

    if (args.numbers.length === 3) {
      rgb = 'rgb(' + Math.round(args.numbers[0]) + ',' +
        Math.round(args.numbers[1]) + ',' +
        Math.round(args.numbers[2]) + ')';
    }

    ctx.strokeStyle = rgb;
    ctx.fillStyle = rgb;

    return library.addCommandToStack_('color', arguments);
  }

  if (style) {
    ctx.strokeStyle = library.getCleanName_(style);
    ctx.fillStyle = library.getCleanName_(style);
  } else {
    var colors = lexi.colors;
    var colorNames = Object.keys(colors);
    var i = library.random(0, colorNames.length);
    var selectedColor = colorNames[i];

    ctx.strokeStyle = colors[selectedColor];
    ctx.fillStyle = colors[selectedColor];

    return library.addCommandToStack_('color', [selectedColor]);
  }

  return library.addCommandToStack_('color', arguments);
}


// Fill

function fill(fillNameOrRedChannel, opt_greenChannel, opt_blueChannel) {

  library.stateLog.lastFill = fillNameOrRedChannel;
  if (opt_greenChannel !== undefined) {
    library.stateLog.lastFill += ',' + opt_greenChannel;
  }
  if (opt_blueChannel !== undefined) {
    library.stateLog.lastFill += ',' + opt_blueChannel;
  }

  library.sceneStack_[0] = new lexi.Command(library, 'reset',
    [fillNameOrRedChannel, opt_greenChannel, opt_blueChannel], 0);
  library.renderCommands_();
}



function line() {
  var args = parseArguments(arguments);
  var settings = {};

  if (args.colors.length) {
    library.setLineColor_(args.colors[0]);
    settings.lineColor = args.colors[0];
  }

  // If there's an odd number of number params, the last one is the width.
  if (args.numbers.length % 2) {
    var lineWidth = args.numbers.pop();
    library.setLineWidth_(lineWidth);
    settings.lineWidth = lineWidth;

    // If there was only one parameter, we're just setting the line width,
    // not drawing a line. Add a command to the stack and return.
    if (args.numbers.length === 0) {
      return library.addCommandToStack_('line', arguments);
    }
  }

  var x, y, x2, y2;

  if (args.numbers.length === 2) {
    x = library.cursor_.x;
    y = library.cursor_.y;
    x2 = args.numbers[0];
    y2 = args.numbers[1];
  } else if (args.numbers.length === 4) {
    x = args.numbers[0];
    y = args.numbers[1];
    x2 = args.numbers[2];
    y2 = args.numbers[3];
  }

  library.largestZ_++;
  settings.z = library.largestZ_;

  var newLine = new lexi.Line(library, x, y, x2, y2, settings);
  library.cursor_.x = x2;
  library.cursor_.y = y2;

  library.sceneStack_.push(newLine);
  newLine.draw();

  return newLine;
}

function stamp(name, opt_x, opt_y, opt_w, opt_rotation) {

  var args = parseArguments(arguments);

  var settings = {};

  var n = args.numbers;
  if (arguments.length === 0) {
    var stamps = lexi.stamps;
    var stampsList = lexi.stampList;
    var stampNames = Object.keys(stampsList);
    var i = library.random(0, stampNames.length);

    name = stampNames[i];
    var val = stamps[name];

    while (val && val.hasOwnProperty('hideInAssetsPanel')) {
      i = library.random(0, stampNames.length);
      name = stampNames[i];
      val = stamps[name];
    }

  } else if (n.length === 1) {
    settings.width = n[0];
    settings.height = n[0];
  } else if (n.length === 2) {
    settings.x = n[0];
    settings.y = n[1];
  } else if (n.length === 3) {
    settings.x = n[0];
    settings.y = n[1];
    settings.width = n[2];
    settings.height = n[2];
  } else if (n.length >= 4) {
    settings.x = n[0];
    settings.y = n[1];
    settings.width = n[2];
    settings.height = n[2];
    settings.rotation = n[3];
  }

  settings.background = args.colors[0];
  settings.foreground = args.colors[1];

  library.largestZ_++;
  settings.z = library.largestZ_;
  library.stateLog.lastStamp = name;

  var newStamp = new lexi.Stamp(library, name, settings);
  library.sceneStack_.push(newStamp);
  return newStamp;
}


function text(str, opt_x, opt_y) {

  var args = parseArguments(arguments, 1);

  var fontFace = library.initialFontFace_;
  var fontSize = library.initialFontSize_;
  if (args.fonts) {
    fontFace = args.fonts[0];
  }
  var x, y;

  if (args.numbers.length === 1) {
    fontSize = args.numbers[0];
  } else if (args.numbers.length === 2) {
    x = args.numbers[0];
    y = args.numbers[1];
  } else if (args.numbers.length >= 3) {
    x = args.numbers[0];
    y = args.numbers[1];
    fontSize = args.numbers[2];
  }
  library.stateLog.lastFontFace = fontFace;
  library.stateLog.lastFontSize = fontSize;

  var textAlign = library.ctx_.textAlign;
  if (args.directions) {
    // We only accept center, right, or left as a valid alignments.
    var argsTextAlign = args.directions[0];
    if (argsTextAlign === 'center' ||
      argsTextAlign === 'right' ||
      argsTextAlign === 'left') {
      textAlign = argsTextAlign;
    }
  }

  var settings = {};
  settings.fontFace = fontFace;
  settings.fontSize = fontSize;
  settings.textAlign = textAlign;
  settings.x = x;
  settings.y = y;
  if (args.colors.length > 0) {
    settings.fillStyle = args.colors[0];
  }
  settings.displayString = str;

  library.largestZ_++;
  settings.z = library.largestZ_;

  var newText = new lexi.Text(library, settings);
  library.sceneStack_.push(newText);
  newText.draw();
  return newText;
}
