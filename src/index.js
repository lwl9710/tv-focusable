(function(global) {
  var DEFAULT_OPTIONS = {
    // 进行焦点管理的容器
    root: global.document.documentElement,
    // 进行焦点管理的容器类名
    rootExtractClass: "focusable-root",
    // 以获取焦点元素的类名
    elExtractClass: "focusable-el-focus",
    // 滚动时长
    scrollTime: 200,
    // 移动触发延迟
    delay: 200,
    // 是否处于激活状态
    isActive: true,
    // 元素是否可移动
    isMove: true,
    // 是否可滚动
    isScroll: true,
    // 焦点元素的方法集合
    methods: {}
  }
  // 按键键位
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
    // 获取元素位置信息
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
    // 使用节流函数
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
  // 生成键盘监听事件
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
  // 全局导出
  global.IFocusable = {
    create: function(options) {
      options = common.assign(DEFAULT_OPTIONS, {
        el: $("[focusable=\"autofocus\"]").get(0) || $("[focusable]", options.root).get(0)
      }, options);
      if(!options.el) {
        console.warn("The create is invalid and focusable element not existent.");
        return ;
      }
      var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var _position = common.getElementPosition(options.el);
      var _el = null;
      var _root = null;
      var beforeEl = null;
      var isActive = options.isActive;
      var instance = {
        // 滚动元素 默认整个页面窗口
        scrollEl: null,
        // 是否处于激活状态
        isActive: options.isActive,
        // 是否可滚动
        isScroll: options.isScroll,
        // 是否可移动
        isMove: options.isMove,
        // 元素方法集合
        methods: options.methods,
        // 设置滚动元素
        setScrollElement: function(scrollRoot) {
          var $scrollRoot = $(scrollRoot);
          this.scrollEl = scrollRoot;
          windowWidth = $scrollRoot.width();
          windowHeight = $scrollRoot.height();
        },
        // 重置滚动元素
        resetScrollElement: function() {
          this.scrollEl = null;
          windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          windowHeight = window.innerHeight || document.html.clientHeight || document.body.clientHeight;
        },
        // 显示dialog
        showDialog: function(dialogRoot, el) {
          var nextElement =  el || $("[focusable]", dialogRoot).get(0);
          this.root = dialogRoot;
          this.isScroll = false;
          beforeEl = this.el;
          this.el = nextElement;
          _position = common.getElementPosition(nextElement);
        },
        // 隐藏dialog
        hideDialog: function() {
          this.root = options.root;
          this.el = beforeEl;
          this.isScroll = true;
          _position = common.getElementPosition(beforeEl);
          beforeEl = null;
        },
        // 触发元素事件
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
          if(this.isActive) {
            this.triggerEvent("ok");
          }
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
          if(this.isMove && this.isActive) {
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
              this.triggerEvent("blur");
              _position = nextPosition;
              this.el = nextElement;
              this.triggerEvent("focus");
              options["onChange"] && options["onChange"].call(this);
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
            var width = _position.width;
            var height = _position.height;
            var scrollTop = Math.max(_position.top - (height > windowHeight ? 0 : Math.round((windowHeight - height) / 2)), 0);
            var scrollLeft = Math.max(_position.left - (width > windowWidth ? 0 : Math.round(windowWidth - width) / 2), 0);
            if(this.scrollEl) {
              $(this.scrollEl).animate({ scrollTop: scrollTop - this.scrollEl.offsetTop, scrollLeft: scrollLeft - this.scrollEl.offsetLeft }, options.scrollTime);
            } else {
              $(this.root).animate({ scrollTop: scrollTop, scrollLeft: scrollLeft }, options.scrollTime);
            }
          }
          return _el = htmlElement;
        },
        get isActive() {
          return isActive;
        },
        set isActive(state) {
          isActive = state;
          if(isActive === false) {
            $(_el).removeClass(options.elExtractClass);
          } else {
            $(_el).addClass(options.elExtractClass);
          }
        },
      }
      var callback = createKeydownCallback(instance, options.delay, options.keyCode || DEFAULT_CODE);
      instance.root = options.root;
      instance.el = options.el;
      $(global.document).keydown(callback);
      return instance;
    }
  }
})(window);
