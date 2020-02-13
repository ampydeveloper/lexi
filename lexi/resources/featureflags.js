// Copyright 2018 Codepops Inc. All rights reserved.


/**
 * The list of flags and whether or not they're currently active.
 * @type {Object}
 * @private
 */
lexi.featureFlagConfig_ = {
    'customStamps': {
      'global': true,
      'beta': true,
      'activeSubscriber': false,
      'turnOffForHoc': true,
      'turnOffForSqula': true,
      'turnOffForYoutz': true
    },
    'grownupAccounts': {
      'global': false,
      'beta': false,
      'activeSubscriber': false
    },
    'googleFonts': {
      'global': true,
      'beta': false,
      'activeSubscriber': false
    },
    'alphaTool': {
      'global': true,
      'beta': true,
      'activeSubscriber': false,
      'turnOffForHoc': true,
      'turnOffForSqula': true,
      'turnOffForYoutz': true
    },
    'signUpPrompt': {
      'global': true,
      'beta': false,
      'turnOffForSqula': true,
      'activeSubscriber': false
    },
    'copyToGoogleDoc': {
      'global': true,
      'beta': false,
      'turnOffForSqula': true,
      'activeSubscriber': false
    },
    'accountConnectWidget': {
      'global': true,
      'beta': true,
      'turnOffForHoc': true,
      'turnOffForSqula': true,
      'turnOffForYoutz': true,
      'activeSubscriber': false
    },
    'shareAppViaText': {
      'global': false,
      'beta': true,
      'turnOffForHoc': true,
      'turnOffForSqula': true,
      'turnOffForYoutz': true,
      'activeSubscriber': false
    },
    'draggableAppCards': {
      'global': false,
      'beta': false,
      'turnOffForHoc': true,
      'turnOffForSqula': true,
      'turnOffForYoutz': true,
      'activeSubscriber': false
    }
  };
  
  
  /**
   * Checks if a feature flag is turned on. It checks both the config hash and
   * the page url.
   * This check is case-sensitive.
   * @param {string} featureFlag The name of the featureFlag to check.
   * @param {string} opt_category An additional category to check (e.g. beta
   *     or activeSubscriber). This can cause us to return true even if
   *     global is false.
   * @return {boolean} true if the flag is on, false otherwise.
   */
  lexi.isFeatureFlagOn = function(featureFlag, opt_category) {
  
    var isFlagOn = false;
  
    // If the global category is on, that trumps other categories.
    if (lexi.featureFlagConfig_[featureFlag] !== undefined &&
        lexi.featureFlagConfig_[featureFlag]['global'] !== undefined &&
        lexi.featureFlagConfig_[featureFlag]['global']) {
      isFlagOn = true;
    } else if (opt_category &&
        lexi.featureFlagConfig_[featureFlag] !== undefined &&
        lexi.featureFlagConfig_[featureFlag][opt_category] !== undefined &&
        lexi.featureFlagConfig_[featureFlag][opt_category]) {
      isFlagOn = true;
    }
  
    // The turnOffFor* options can turn off the flag for the given type of page,
    // even when it's on globally, but they do not ever turn on a flag.
    if (lexi.isSqulaPage_()) {
      if (lexi.featureFlagConfig_[featureFlag] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForSqula'] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForSqula']) {
        isFlagOn = false;
      }
    }
  
    if (lexi.isHocPage_()) {
      if (lexi.featureFlagConfig_[featureFlag] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForHoc'] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForHoc']) {
        isFlagOn = false;
      }
    }
  
    if (lexi.isYoutzPage_()) {
      if (lexi.featureFlagConfig_[featureFlag] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForYoutz'] !== undefined &&
          lexi.featureFlagConfig_[featureFlag]['turnOffForYoutz']) {
        isFlagOn = false;
      }
    }
  
    // Can be overridden with a parameter in the url.
    var flagFromUrl = lexi.featureFlagCheckUrl_(featureFlag);
    if (flagFromUrl !== null) {
      if (flagFromUrl === 'on') {
        isFlagOn = true;
      } else if (flagFromUrl === 'off') {
        isFlagOn = false;
      }
    }
  
    return isFlagOn;
  };
  
  
  /**
   * Checks for a parameter in the url that sets a flag. We look for
   * flagName and flagStatus, so that we can turn a flag on or off.
   * The url parameter will have a value of 'on' or 'off'
   * This check is case-insensitive.
   * e.g. customStamps=on
   * @param {string} featureFlag The flag we're checking.
   * @return {string} 'on' if the flag is turned on, 'off' if turned off, and
   *     null if no parameter exists.
   * @private
   */
  lexi.featureFlagCheckUrl_ = function(featureFlag) {
    // The search field of location ignores the hash portion of the url.
    var href = '' + window.location.search;
    if (lexi.canAccessTopFrame()) {
      href = '' + top.window.location.search;
    }
  
    if (href.toLowerCase().indexOf(featureFlag.toLowerCase()) < 0) {
      // The parameter is not present.
      return null;
    }
  
    var urlParts = href.split('?');
    if (urlParts.length <= 1) {
      // No ? means no params. Url is not setting flag.
      return null;
    }
    var urlParams = urlParts[1].split('&');
    if (urlParams.length === 0) {
      return null;
    }
    for (var i = 0; i < urlParams.length; i++) {
      var paramParts = urlParams[i].split('=');
      if (paramParts.length &&
          paramParts[0].toLowerCase() === featureFlag.toLowerCase()) {
        var value = paramParts[1];
        if (value.toLowerCase() === 'on') {
          return 'on';
        } else if (value.toLowerCase() === 'off') {
          return 'off';
        }
        return null;
      }
    }
    // Unlikely to get here, but return something just in case.
    return null;
  };
  
  
  /**
   * Check the url to see if this is a Squla page.
   * @return {boolean} True if we're on a Squla page.
   * @private
   */
  lexi.isSqulaPage_ = function() {
  
    var isSqula = false;
    
    var hostname = window.location.hostname;
    var pathname = window.location.pathname;
      
    if (lexi.canAccessTopFrame()) {
      hostname = top.window.location.hostname;
      pathname = top.window.location.pathname;
    }
    
    if (hostname && hostname.toLowerCase().indexOf('leukprogrammeren.nl') > -1 ||
          pathname && pathname === '/squla.html') {
        isSqula = true;
      }
  
    return isSqula;
  };
  
  
  /**
   * Check the url to see if this is an Hour of Code page.
   * @return {boolean} True if we're on an Hour of Code page.
   * @private
   */
  lexi.isHocPage_ = function() {
  
    var isHoc = false;
    var pathname = window.location.pathname;
    
    if (lexi.canAccessTopFrame()) {
      pathname = top.window.location.pathname;
    }
  
    if (pathname && pathname.indexOf('hoc') > -1) {
      isHoc = true;
    }
  
    return isHoc;
  };
  
  
  /**
   * Check the url to see if this is a Youtz page.
   * @return {boolean} True if we're on a Youtz page.
   * @private
   */
  lexi.isYoutzPage_ = function() {
  
    var isYoutz = false;
    var pathname = window.location.pathname;
    
    if (lexi.canAccessTopFrame()) {
      pathname = top.window.location.pathname;
    }
  
    if (pathname && pathname.indexOf('youtz') > -1) {
      isYoutz = true;
    }
  
    return isYoutz;
  };
  