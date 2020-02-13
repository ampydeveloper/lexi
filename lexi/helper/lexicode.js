var lexicode = lexicode || {};

lexicode.removeOneFromAssetName = function(name) {
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

lexicode.cleanAssetName = function(name) {
    var cleanAsset = ('' + name).toLowerCase().replace(/\s/gi, '').
        replace(/['".,/#!$%^&*;:{}=`~()]/gi, '');
    return lexicode.removeOneFromAssetName(cleanAsset);
};

lexicode.bind = function(fn, selfObj, var_args) {
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
  