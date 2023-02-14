(function(global) {
  var DEFAULT_OPTIONS = {
    // 安全距离
    root: global.document.documentElement,
    rootExtractClass: "focusable-root-extract",
    elExtractClass: "focusable-el-extract",
    scrollTime: 200,
    delay: 200,
    isMove: true,
    isScroll: true,
    methods: {}
  }
  var DEFAULT_CODE = {
    OK: 13,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  }
  var common = {
    // 合并对象
    assign: function(...args) {
      var resource = {};
      for (var i = 0; i < args.length; i++) {
        var target = args[i];
        for(var key in target) {
          resource[key] = target[key];
        }
      }
      return resource;
    },
    getElementPosition: function(el) {
      var $el = $(el);
      var offset = $el.offset();
      var width = $el.width();
      var height = $el.height();
      return {
        width: width,
        height: height,
        left: offset.left,
        top: offset.top,
        right: offset.left + width,
        bottom: offset.top + height
      }
    },
    useThrottle: function(callback, delay) {
      if(!delay)delay = 300;
      var isTrigger = true;
      return function() {
        if(isTrigger) {
          isTrigger = false;
          setTimeout(function() { isTrigger = true }, delay);
          callback.apply(this, arguments);
        }
      }
    }
  }
  function createKeydownCallback(instance, delay, KEY_CODE) {
    var callback = common.useThrottle(function(event) {
      switch(event.keyCode) {
        case KEY_CODE.OK: instance.__ok();break;
        case KEY_CODE.LEFT: instance.__left();break;
        case KEY_CODE.UP: instance.__up();break;
        case KEY_CODE.RIGHT: instance.__right();break;
        case KEY_CODE.DOWN: instance.__down();break;
      }
      event.preventDefault();
      return false;
    }, delay);
    return function(event) {
      callback(event);
      event.preventDefault();
      return false;
    }
  }
  global.IFocusable = {
    create: function(options) {
      options = common.assign(DEFAULT_OPTIONS, {
        el: $("[focusable=\"autofocus\"]").get(0) || $("[focusable]", options.root).get(0)
      }, options);
      if(!options.el) {
        console.warn("The create is invalid and focusable element not existent.");
        return ;
      }
      var windowHeight = window.innerHeight || document.html.clientHeight || document.body.clientHeight;
      var _position = common.getElementPosition(options.el);
      var _el = null;
      var _root = null;
      var beforeEl = null;
      var instance = {
        isScroll: options.isScroll,
        isMove: options.isMove,
        methods: options.methods,
        showDialog: function(dialogRoot, el) {
          var nextElement =  el || $("[focusable]", dialogRoot).get(0);
          this.root = dialogRoot;
          beforeEl = this.el;
          this.el = nextElement;
          _position = common.getElementPosition(nextElement);
        },
        hideDialog: function() {
          this.root = options.root;
          this.el = beforeEl;
          _position = common.getElementPosition(beforeEl);
          beforeEl = null;
        },
        triggerEvent: function(eventType, el) {
          if(!el)el = this.el;
          var propertyArr = ($(el).attr(eventType) || "").split(".");
          var method = undefined;
          for (var i = 0; i < propertyArr.length; i++) {
            method = this.methods[propertyArr[i]];
          }
          if(method) {
            return method.call(this) !== false;
          } else {
            return true;
          }
        },
        __ok: function() {
          this.triggerEvent("ok");
        },
        __up: function() {
          if(this.triggerEvent("up")) {
            this.__move(function(position) {
              return position.top < _position.top && position.bottom < _position.bottom;
            }, function(position) {
              return Math.abs(position.left - _position.left) + Math.abs(_position.top - position.bottom);
            });
          }
        },
        __down: function() {
          if(this.triggerEvent("down")) {
            this.__move(function(position) {
              return position.bottom > _position.bottom && position.top > _position.top;
            }, function(position) {
              return Math.abs(position.left - _position.left) + Math.abs(position.top - _position.bottom);
            });
          }
        },
        __left: function() {
          if(this.triggerEvent("left")) {
            this.__move(function(position) {
              return position.left < _position.left && position.right < _position.right;
            }, function(position) {
              return Math.abs(_position.left - position.right) + Math.abs(position.top - _position.top);
            });
          }
        },
        __right: function() {
          if(this.triggerEvent("right")) {
            this.__move(function(position) {
              return position.left > _position.left && position.right > _position.right;
            }, function(position) {
              return Math.abs(position.left - _position.right) + Math.abs(position.top - _position.top);
            });
          }
        },
        // 移动方法
        __move: function(isValidElement, getThreshold) {
          if(this.isMove) {
            var self = this;
            var nextElement = null;
            var nextPosition = _position;
            var nextThreshold = 0;
            $("[focusable]", this.root).each(function(i, el) {
              if(el !== self.el) {
                var position = common.getElementPosition(el);
                if(position.width > 0 && position.height > 0 && isValidElement(position, self)) {
                  // 有效元素
                  var threshold = getThreshold(position, self);
                  if(nextElement === null || (threshold < nextThreshold)) {
                    nextElement = el;
                    nextPosition = position;
                    nextThreshold = threshold;
                  }
                }
              }
            });
            if(nextElement !== null) {
              _position = nextPosition;
              this.el = nextElement;
              options["onChange"] && options["onChange"].call(this, nextElement);
            }
          }
        },
        get root() {
          return _root;
        },
        set root(htmlElement) {
          $(_root).removeClass(options.rootExtractClass);
          $(htmlElement).addClass(options.rootExtractClass);
          return _root = htmlElement;
        },
        get el() {
          return _el;
        },
        set el(htmlElement) {
          var $htmlElement = $(htmlElement);
          $(_el).removeClass(options.elExtractClass);
          $htmlElement.addClass(options.elExtractClass);
          if(beforeEl === null && this.isScroll) {
            var height = $htmlElement.height();
            var scrollTop = Math.max($htmlElement.offset().top - (height > windowHeight ? 0 : Math.round((windowHeight - height) / 2)), 0);
            $(this.root).animate({ scrollTop: scrollTop }, options.scrollTime);
          }
          return _el = htmlElement;
        },
      }
      var callback = createKeydownCallback(instance, options.delay, options.keyCode || DEFAULT_CODE);
      instance.el = options.el;
      instance.root = options.root;
      $(global.document).keydown(callback);
      return instance;
    }
  }
})(window);
