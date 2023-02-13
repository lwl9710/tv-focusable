(function(global) {
  var DEFAULT_OPTIONS = {
    // 安全距离
    root: global.document.body,
    rootExtractClass: "focusable-root-extract",
    elExtractClass: "focusable-el-extract"
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
        bottom: offset.top + height,
        x: offset.left + (width / 2),
        y: offset.top + (height / 2)
      }
    }
  }
  global.IFocusable = {
    create: function(options) {
      options = common.assign(DEFAULT_OPTIONS, {
        el: $("[focusable]", options.root).get(0)
      },options);
      var _position = common.getElementPosition(options.el);
      var _el = options.el;
      var _root = options.root;
      $(_root).addClass(options.rootExtractClass);
      $(_el).addClass(options.elExtractClass);
      var instance = {
        up: function() {
          var self = this;
          var nextElement = null;
          var nextPosition = null;
          var nextThreshold = null;
          $("[focusable]", options.root).each(function(i, el) {
            if(el !== self.el) {
              var position = common.getElementPosition(el);
              if(position.width > 0 && position.height > 0 && position.top < self.position.top && position.bottom < self.position.bottom) {
                var threshold = {
                  x: Math.abs(position.x - self.position.x),
                  y: Math.abs(self.position.top - position.bottom)
                }
                if(nextElement === null || (threshold.y < nextThreshold.y) || (threshold.y === nextThreshold.y && threshold.x < nextThreshold.x)) {
                  nextElement = el;
                  nextPosition = position;
                  nextThreshold = threshold;
                }
              }
            }
          })
          if(nextElement !== null) {
            this.el = nextElement;
            this.position = nextPosition;
          }
        },
        down: function() {
          var self = this;
          var nextElement = null;
          var nextPosition = null;
          var nextThreshold = null;
          $("[focusable]", options.root).each(function(i, el) {
            if(el !== self.el) {
              var position = common.getElementPosition(el);
              if(position.width > 0 && position.height > 0 && position.bottom > self.position.bottom && position.top > self.position.top) {
                // 有效元素
                var threshold = {
                  x: Math.abs(position.x - self.position.x),
                  y: Math.abs(position.top - self.position.bottom)
                }
                if(nextElement === null || (threshold.y < nextThreshold.y) || (threshold.y === nextThreshold.y && threshold.x < nextThreshold.x)) {
                  nextElement = el;
                  nextPosition = position;
                  nextThreshold = threshold;
                }
              }
            }
          })
          if(nextElement !== null) {
            this.el = nextElement;
            this.position = nextPosition;
          }
        },
        left: function() {
          var self = this;
          var nextElement = null;
          var nextPosition = null;
          var nextThreshold = null;
          $("[focusable]", options.root).each(function(i, el) {
            if(el !== self.el) {
              var position = common.getElementPosition(el);
              if(position.width > 0 && position.height > 0 && position.left < self.position.left && position.right < self.position.right) {
                var threshold = {
                  x: Math.abs(self.position.left - position.right),
                  y: Math.abs(position.y - self.position.y)
                }
                if(nextElement === null || (threshold.x < nextThreshold.x) || (threshold.x === nextThreshold.x && threshold.y < nextThreshold.y)) {
                  nextElement = el;
                  nextPosition = position;
                  nextThreshold = threshold;
                }
              }
            }
          })
          if(nextElement !== null) {
            this.el = nextElement;
            this.position = nextPosition;
          }
        },
        right: function() {
          var self = this;
          var nextElement = null;
          var nextPosition = null;
          var nextThreshold = null;
          $("[focusable]", options.root).each(function(i, el) {
            if(el !== self.el) {
              var position = common.getElementPosition(el);
              if(position.width > 0 && position.height > 0 && position.left > self.position.left && position.right > self.position.right) {
                // 有效元素
                var threshold = {
                  x: Math.abs(position.left - self.position.right),
                  y: Math.abs(position.y - self.position.y)
                }
                if(nextElement === null || (threshold.x < nextThreshold.x) || (threshold.x === nextThreshold.x && threshold.y < nextThreshold.y)) {
                  nextElement = el;
                  nextPosition = position;
                  nextThreshold = threshold;
                }
              }
            }
          })
          if(nextElement !== null) {
            this.el = nextElement;
            this.position = nextPosition;
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
          $(_el).removeClass(options.elExtractClass)
          $(htmlElement).addClass(options.elExtractClass)
          return _el = htmlElement;
        },
        get position() {
          return _position;
        },
        set position(position) {
          return _position = position;
        }
      }
      $(document).keydown(function(event) {
        switch(event.keyCode) {
          case 37: instance.left();break;
          case 38: instance.up();break;
          case 39: instance.right();break;
          case 40: instance.down();break;
        }
      });
      return instance;
    }
  }
})(window);
