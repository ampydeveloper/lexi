var lexi = lexi || {};

/**
 * This hash holds optional configuration information for fonts.
 * The main reason for this file is that we've decided to hide some of the
 * google fonts. One reason is bcause we load google fonts by pointing to a
 * specific url in the google fonts api and appending the font name to the
 * ?family= query string. While this works for most, some of the fonts download
 * urls also include a colon and the fonts weight. Since this would likely take
 * a decent amount of effort to deduce, we've decided it'd be easier to just
 * hide those instead. We have also deemed some of the font names potentially
 * offensive and are removing those as well.
 *
 * Note: This file, unlike songs.js and sounds.js, etc. is manually created.
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


lexi.fonts = {
  'Abril Fatface': {'hideInAssetsPanel': true},
  'Buda': {'hideInAssetsPanel': true},
  'Coda Caption': {'hideInAssetsPanel': true},
  'Fahkwang': {'hideInAssetsPanel': true},
  'Molle': {'hideInAssetsPanel': true},
  'Open Sans Condensed': {'hideInAssetsPanel': true},
  'Roboto': {'hideInAssetsPanel': true},
  'Stalinist One': {'hideInAssetsPanel': true},
  'Sunflower': {'hideInAssetsPanel': true},
  'UnifrakturCook': {'hideInAssetsPanel': true}
};
