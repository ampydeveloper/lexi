// Load up our library.
var library = {},
  $_page = {},
  editor; // empty
var lexi = lexi || {};

$_page.apps_ = {};

$_page.pageTitleInput = document.getElementById('page-title');
$_page.pageIconDiv = document.getElementById('page-icon');
$_page.tabletDiv = document.getElementById('tablet');
$_page.buttonRunDiv = document.getElementById('button-run');
$_page.pagePanelDiv = document.getElementById('page-panel');
// $_page.sandboxPanelDiv = document.getElementById('sandbox-panel');
// $_page.sandbox_ = new codepops.Sandbox($_page, $_page.sandboxPanelDiv);
$_page.userPreferences_ = {};

$_page.errorPanelDiv = document.getElementById('error-panel');

$_page.resetErrorOutput = function () {
  console.log('resetErrorOutput');
  $_page.errorPanelDiv.style.display = 'none';
  var errorLineNumberDivs = document.getElementsByClassName('CodeMirror-linenumber-error');
  for (var i = 0; i < errorLineNumberDivs.length; i++) {
    var currentClass = errorLineNumberDivs[i].className;
    errorLineNumberDivs[i].className =
      currentClass.replace(/ CodeMirror-linenumber-error/gi, '');
  }
};

$_page.generateAppKey_ = function () {
  var largestAppNumber = 0;
  for (var key in $_page.apps_) {
    var number = parseFloat(key.replace('app', ''));
    if (number > largestAppNumber) {
      largestAppNumber = number;
    }
  }
  largestAppNumber = largestAppNumber + 1;
  return 'app' + largestAppNumber;
};



/**
 * Initialize necessary scripts.
 */

function setupEditor() {
  editor = CodeMirror.fromTextArea(
    document.getElementById('textarea-code'), {
      lineNumbers: true,
      matchBrackets: true,
      continueComments: 'Enter',
      extraKeys: {
        'Ctrl-Q': 'toggleComment'
      },
      theme: 'neat',
      viewportMargin: Infinity
    });

  editor.on('gutterClick', function (editor, lineNumber) {
    editor.focus();
    editor.setCursor(lineNumber);
  });

  editor.on('keydown', function (editor, e) {
    editor.lastCursorLine = editor.getCursor().line;
    editor.lastCursorCh = editor.getCursor().ch;
  });

  editor.setValue('\n\n');
}

function init() {

  setupEditor();

  var settings = {};
  settings.canvas = document.getElementById('tablet-canvas');
  settings.canvasScale = 0.5;

  var library = new lexi.Library(settings);

  // var pageSettings = {
  //   'library': library
  // };

  $_page.tabletColorCanvas = document.getElementById('tablet-color');
  $_page.tabletColorCtx_ = $_page.tabletColorCanvas.getContext('2d');
  $_page.tabletColorCtx_.drawImage(document.getElementById('tablet-i-color'), 0, 0);

  // $_page = new codepops.EditorPage(pageSettings);

  $_page.library_ = library;
  $_page.tabletDiv.className = 'left';
  $_page.buttonRunDiv.className = 'visible';
  $_page.pagePanelDiv.className = 'visible';

  var code = code || 'a=stamp("apple",200)\na.tap = function() {\na.rotate(45,500)\n}\n\n\n\n\n\n\n\n';
  startNewApp(code);
}

function runeditorcode() {
  startNewApp(editor.getValue());
}

function startNewApp(code) {
  var title = "New App";
  var iconUrl = '/img/icon-question.png';
  
  var newKey = $_page.generateAppKey_();

  var app = {
    'title': title,
    'iconUrl': iconUrl,
    'code': code,
    'appKey': newKey
  };

  $_page.apps_[newKey] = app;
  launch(newKey, code);
}


function launch(appKey, code) {

  var app = $_page.apps_[appKey];
  $_page.currentAppKey_ = appKey;
  $_page.pageTitleInput.value = app.title;
  $_page.pageIconDiv.style.backgroundImage = 'url(' + app.iconUrl + ')';

  editor.setValue(code);
  editor.focus();

  // If line 1 is longer than 50 char, place the cursor at the
  // beginning of the line instead of at the end. Gives a better
  // experience to our users (especially on a tablet) who have
  // long first lines of code.
  var lineOneCharLength = editor.lineInfo(0).text.length;
  if (lineOneCharLength >= 50) {
    editor.setCursor(0, 0);
  } else {
    // The 999 puts the cursor at the end of the line.
    editor.setCursor(0, 999);
  }

  editor.on('gutterClick', function (editor, lineNum, gutter, eventObj) {
    // The 999 puts the cursor at the end of the line.
    editor.setCursor(lineNum, 999);
  });

  editor.on('cursorActivity', codepops.bind(function (editor) {
    var lineCount = editor.lineCount();
    var startPosition = editor.getCursor('start');

    if (startPosition && startPosition['line'] &&
      startPosition['line'] === lineCount - 1) {

      var position = {
        'line': startPosition['line'],
        'ch': null
      };
      editor.replaceRange('\n\n', position);

      // Leave the cursor on the original line.
      editor.setCursor(startPosition['line'], 999);
    }
  }, $_page));

  editor.refresh();
  editor.clearHistory();


  runcode(code);
}

function runcode(code) {
  // Reset any error output.
  $_page.resetErrorOutput();

  // var code = editor.getValue();

  // Check if we've had a bunch of stamp load errors. If so, display a message
  // letting them know to check for a firewall or other network error.
  if ($_page.library_.numberOfStampLoadErrors >= 5 &&
    !$_page.hasDismissedFirewallWarning_) {

    var firewallDiv = $_page.document_.getElementById('firewall-warning');
    if (firewallDiv) {
      firewallDiv.style.display = 'block';
    }
  }

  // Using setValue on the editor moves the cursor to the beginning of
  // the code. To keep us from losing our place, we'll save off the
  // position before we set the value and then set it back after.
  var cursorPosition = editor.getCursor('start');

  // In the international keyboard on chromebooks, the ' is replaced by ´.
  // Replace this to avoid confusing errors.
  code = code.replace(/´/g, "'");
  editor.setValue(code);

  editor.setCursor(cursorPosition['line'], cursorPosition['ch']);

  var app = $_page.apps_[$_page.currentAppKey_];
  app.title = $_page.pageTitleInput.value;
  // app.code = editor.getValue();
  app.code = code;
  // Since the error handler checks for errors every time, always start
  // with the app not having an error. We do this so that fixed apps
  // will be marked as fixed.
  app['hasError'] = false;

  // This needs to run after we set hasError, or it'll get clobbered.
  // $_page.sandbox_.run(code, $_page.userPreferences_['customAssets']);
  $_page.library_.getCanvas();
  $_page.library_.run(code, $_page.userPreferences_['customAssets']);
}


function loadassets(hash) {
  var ajax = false;
  var assetsContentDiv = document.getElementById('assets-content');

  if (window.XMLHttpRequest) {
    ajax = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    ajax = new ActiveXObject('Microsoft.XMLHTTP');
  }
  ajax.open('GET', '/docs/' + hash + '.html', true);
  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4) {
        assetsContentDiv.innerHTML = ajax.responseText;
        applyAssetInteractionHandlers();
    }
  };

  ajax.send();
}


window.onload = function () {
  init();
};



//////////////////////////////////////////////////////////

function applyAssetInteractionHandlers() {
    var assetsContentDiv = document.getElementById('assets-content');
//   var thumbs = this.assetsContentDiv.getElementsByClassName('thumb-stamp');

//   var thumbListener = function(thumb) {
//       thumb.addEventListener('click', function() {
//       var children = thumb.parentNode.childNodes;
//       for (i = 0; i < children.length; i++) {
//         if (children[i]['classList']) {
//           children[i].classList.remove('selectedThumb');
//         }
//       }
//       thumb.classList.toggle('selectedThumb');

//       // If the selected thumb is an animated stamp, change border radius
//       // to match the hard corner of the animate badge.
//       if (thumb.childNodes[0] !== undefined &&
//           thumb.childNodes[0].className.indexOf('animate-badge') > -1) {
//         thumb.style.borderRadius = '15px 15px 0 15px';
//       }
//     });
//   };

//   var thumbClickHandler = function(clickEvent) {
//       var clickedThumb = clickEvent.target;
//       this.displayThumbInSandbox(clickedThumb);
//       if (clickedThumb.title.indexOf('@') === 0) {
//         // Call function here to drop down edit menu for custom assets.
//         this.showCustomAssetEditMenu(clickedThumb);
//       }
//   }.bind(this);

//   var thumbFillClickHandler = function(clickEvent) {
//     var clickedThumb = clickEvent.target;
//     var thumbTitle = clickedThumb.title;
//     var displayTitle = "'" + thumbTitle + "'";
//     var textX = 390 - displayTitle.length * 19;
//     // Draw white over black text to create a stroke around the text.
//     // TODO(scott): Make the API do this.
//     var code = 'fill("' + thumbTitle + '");' +
//       'text("' + displayTitle + '",' + (textX - 2) +
//       ',918,65,"black","console");' +
//       'text("' + displayTitle + '",' + (textX + 2) +
//       ',922,65,"black","console");' +
//       'text("' + displayTitle + '",' + (textX + 2) +
//       ',918,65,"black","console");' +
//       'text("' + displayTitle + '",' + (textX - 2) +
//       ',922,65,"black","console");' +
//       'text("' + displayTitle + '",' + textX + ',920,65,"white","console");';
    
//     // Add attribution for this specific fill (Troop Zero asset).
//     if (thumbTitle === 'space') {
//       code += 'text("Illustration © Josh Lewis",' + textX +
//               ',995,25,"gray","Arial");';
//     }
//     this.sandbox_.run(code);
//   };

//   var thumbColorClickHandler = function(clickEvent) {
//     var clickedThumb = clickEvent.target;
//     var text = clickedThumb.innerText || clickedThumb.textContent;
//     var displayText = "'" + text + "'";
//     var textX = 390 - displayText.length * 19;
//     // Draw white over black text to create a stroke around the text.
//     // TODO(scott): Make the API do this.
//     var code = 'fill("' + text.replace(/'/gi, '') + '");' +
//       'text("' + displayText + '",' + (textX - 2) +
//       ',918,65,"black","console");' +
//       'text("' + displayText + '",' + (textX + 2) +
//       ',922,65,"black","console");' +
//       'text("' + displayText + '",' + (textX + 2) +
//       ',918,65,"black","console");' +
//       'text("' + displayText + '",' + (textX - 2) +
//       ',922,65,"black","console");' +
//       'text("' + displayText + '",' + textX +
//       ',920,65,"white","console");';
//     this.sandbox_.run(code);
//   };

//   var thumbSoundClickHandler = function(clickEvent) {
//     var clickedThumb = clickEvent.target;
//     var text = clickedThumb.innerText || clickedThumb.textContent;
//     var displayText = "'" + text + "'";
//     var textX = 390 - displayText.length * 19;
//     var code = 'fill("worldofmusic");' +
//       'text("' + displayText + '",' + (textX - 2) +
//       ',260,65,"white", "console");' +
//       'silence();' +
//       'sound("' + text + '",100);';
//     this.sandbox_.run(code);
//   };


//   var thumbSongClickHandler = function(clickEvent) {
//     var clickedThumb = clickEvent.target;
//     var text = clickedThumb.innerText || clickedThumb.textContent;
//     var displayText = "'" + text + "'";
//     var textX = 390 - displayText.length * 19;
//     var code = 'fill("worldofmusic");' +
//       'text("' + displayText + '",' + (textX - 2) +
//       ',260,65,"white","console");' +'silence();' +
//       'song("' + text + '",100);';
//     this.sandbox_.run(code);
//   };

//   var thumbFontClickHandler = function(clickEvent) {
//     var clickedThumb = clickEvent.target;
//     var text = clickedThumb.innerText || clickedThumb.textContent;
//     var code = 'fill("blackboard");' +
//                 'font = "' + text + '";' +
//                 'align = CENTER;' +
//                 'xPos = -956;' +
//                 'size = 90;' +
//                 'color = "white";' +
//                 'line1 = text("ABCDEF",xPos,260,size,align,color,font);' +
//                 'line2 = text("GHIJKL",xPos,360,size,align,color,font);' +
//                 'line3 = text("MNOPQR",xPos,460,size,align,color,font);' +
//                 'line4 = text("STUVWX",xPos,560,size,align,color,font);' +
//                 'line5 = text("YZ",xPos,660,size,align,color,font);' +
//                 'line6 = text("\'" + font + "\'",xPos,920,65,CENTER,color,' +
//                   'font);' +
//                 'words = font.split(\' \');' +
//                 'widthIsFine = false;' +
//                 'delay(function() {' +
//                   'if (line6.width > 710) {' +
//                     'line6.size(50);' +
//                     'delay(function() {' +
//                       'if (line6.width > 700) {' +
//                         'words = font.split(\' \');' +
//                         'halfWayPoint = Math.round(words.length / 2);' +
//                         'outputStr1 = [];' +
//                         'outputStr2 = [];' +
//                         'for (i = 0; i < words.length; i++) {' +
//                           'if (i < halfWayPoint) {' +
//                             'outputStr1.push(words[i] + \' \');' +
//                           '} else {' +
//                             'outputStr2.push(words[i] + \' \');' +
//                           '}' +
//                         '}' +
//                         'line7 = text("\'" + outputStr1.join(\'\').trim(),' +
//                                     '384,880,45,CENTER,color,font);' +
//                         'line8 = text(outputStr2.join(\'\').trim() + "\'",' +
//                                     '384,950,45,CENTER,color,font);' +
//                       '} else {' +
//                         'line6.move(RIGHT,1340);' +
//                       '}' +
//                     '}, 50);' +
//                   '} else {' +
//                     'widthIsFine = true;' +
//                   '}' +
//                   'line3Width = line3.width;' +
//                   'if (line3Width > 800) {' +
//                     'newSize = 80;' +
//                     'if (line3Width > 840) {' +
//                       'newSize = 70;' +
//                     '}' +
//                     'line1.size(newSize);line2.size(newSize);' +
//                     'line3.size(newSize);line4.size(newSize);' +
//                     'line5.size(newSize);' +
//                   '}' +
//                   'line1.move(RIGHT,1340);line2.move(RIGHT,1340);' +
//                   'line3.move(RIGHT,1340);line4.move(RIGHT,1340);' +
//                   'line5.move(RIGHT,1340);' +
//                   'if (widthIsFine) {' +
//                     'line6.move(RIGHT,1340);' +
//                   '}' +
//                 '},800);';

//     this.sandbox_.run(code);
//   };

//   // Clicking on stamps shows them in the main editor.
//   for (var i = 0; i < thumbs.length; i++) {
//     var thumb = thumbs[i];
//     thumbListener(thumb);
//     thumb.addEventListener('click', thumbClickHandler);
//   }

//   // Clicking on fills shows them in the main editor.
//   thumbs = this.assetsContentDiv.getElementsByClassName('thumb-fill');
//   for (i = 0; i < thumbs.length; i++) {
//     thumb = thumbs[i];
//     boundThumbClickHandler = codepops.bind(thumbFillClickHandler, this);
//     thumb.addEventListener('click', boundThumbClickHandler);
//   }

//   // Clicking on colors shows them in the main editor.
//   thumbs = this.assetsContentDiv.getElementsByClassName('thumb-color');
//   for (i = 0; i < thumbs.length; i++) {
//     thumb = thumbs[i];
//     boundThumbClickHandler = codepops.bind(thumbColorClickHandler, this);
//     thumb.addEventListener('click', boundThumbClickHandler);
//   }

  // Clicking on sounds plays them.
  // thumbs = this.assetsContentDiv.getElementsByClassName('thumb-sound');
  // for (i = 0; i < thumbs.length; i++) {
  //   thumb = thumbs[i];
  //   boundThumbClickHandler = codepops.bind(thumbSoundClickHandler, this);
  //   thumb.addEventListener('click', boundThumbClickHandler);
  // }

  // Clicking on songs plays them.
  // thumbs = this.assetsContentDiv.getElementsByClassName('thumb-song');
  // for (i = 0; i < thumbs.length; i++) {
  //   thumb = thumbs[i];
  //   boundThumbClickHandler = codepops.bind(thumbSongClickHandler, this);
  //   thumb.addEventListener('click', boundThumbClickHandler);
  // }

  // Clicking on fonts displays a preview of them.
  // thumbs = this.assetsContentDiv.getElementsByClassName('thumb-font');
  // for (i = 0; i < thumbs.length; i++) {
  //   thumb = thumbs[i];
  //   boundThumbClickHandler = codepops.bind(thumbFontClickHandler, this);
  //   thumb.addEventListener('click', boundThumbClickHandler);
  // }

  // Any textareas get turned into CodeMirror editors.
  var textAreas = assetsContentDiv.getElementsByTagName('textarea');
  var runButtons = assetsContentDiv.getElementsByClassName('button-run-docs');
  var textAreasToConvert = [];
  for (i = 0; i < textAreas.length; i++) {
    textAreasToConvert.push(textAreas[i]);
  }

  // As we loop across the text areas, wire up a click handler for
  // each run button.
  for (i = 0; i < textAreasToConvert.length; i++) {
    var textArea = textAreasToConvert[i];
    loadAssetsFromParentApp(textArea.value);
    var runButton = runButtons[i];

    if (!runButton) {
      continue;
    }

    runButton.editor = CodeMirror.fromTextArea(textArea, {
      lineNumbers: false,
      matchBrackets: false,
      continueComments: 'Enter',
      extraKeys: {'Ctrl-Q': 'toggleComment'},
      theme: 'neat'
    });

    // runButton.sandbox_ = this.sandbox_;
    // runButton.page = this;
    runButton.onclick = function() {
      // $_page.resetErrorOutput();

      console.log(this.editor.getValue());
      startNewApp(this.editor.getValue());
      startNewApp(editor.getValue());
      // $_page.library_.getCanvas();
      // $_page.library_.run(this.editor.getValue(), $_page.userPreferences_['customAssets']);
    };
  }
}

function loadAssetsFromParentApp(parentCode) {
  var strings = parentCode.match(/(["'])(?:\\\1|.)*?\1/g) || [];
  $_page.library_.loadAssets_(strings);
}