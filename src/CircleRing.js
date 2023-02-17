(function(exports) {
  function CircleRing(options) {
    if(!options) {
      options = {};
    }
    // 初始化配置信息
    var content = options.content || "";
    this.size = options.size || 200;
    this.rotate = options.rotate || 0;
    this.backgroundColor = options.backgroundColor || "#FFF";
    this.ringColor = options.ringColor || "#909399";
    this.ringWidth = options.ringWidth || "8%";
    this.activeRingColor = options.activeRingColor || "#409EFF";

    // 初始化圆环
    var elements = this.createElements();
    Object.defineProperty(this, "content", {
      get: function() {
        return content;
      },
      set: function(newValue) {
        content = newValue;
        elements.content.innerHTML = content;
        return content;
      }
    });
    // 圆环方法
    this.setRotate = function(rotate) {
      rotate = Math.min(rotate, 360);
      var leftRotate, rightRotate;
      if(rotate > 180) {
        leftRotate = "rotateZ(" + rotate + "deg)";
        rightRotate = "rotateZ(180deg)";
        this.setElementStyle(elements.left, {
          transform: leftRotate,
          backgroundColor: this.activeRingColor
        });
        this.setElementStyle(elements.right, {
          transform: rightRotate,
          backgroundColor: this.activeRingColor
        });
      } else {
        leftRotate = "rotateZ(0deg)";
        rightRotate = "rotateZ(" + rotate + "deg)";
        this.setElementStyle(elements.left, {
          transform: leftRotate,
          backgroundColor: this.ringColor
        });
        this.setElementStyle(elements.right, {
          transform: rightRotate,
          backgroundColor: this.activeRingColor
        });
      }
      elements.left.style["-webkit-transform"] = leftRotate;
      elements.right.style["-webkit-transform"] = rightRotate;
    }
    this.mount = function(element) {
      elements.root.appendChild(elements.left);
      elements.root.appendChild(elements.content);
      elements.root.appendChild(elements.right);
      element.appendChild(elements.root);
    }
    this.setRotate(this.rotate);
  }
  CircleRing.prototype.createElements = function() {
    var root = document.createElement("div");
    var left = document.createElement("div");
    var content = document.createElement("div");
    var right = document.createElement("div");
    var sizePx = this.size + (/^\d+$/.test(this.size) ? "px" : "");
    // 获取content大小
    var contentValue = (this.ringWidth.toString()).match(/\d+/)[0];
    var contentUnit = (this.ringWidth.toString()).match(/\D+/);
    if(contentUnit) {
      contentUnit = contentUnit[0]
    } else {
      contentUnit = "px";
    }
    var contentSize = "calc(100% - " + (contentValue * 2) + contentUnit + ")";

    // 设置元素样式
    this.setElementStyle(root, {
      display: "inline-block",
      overflow: "hidden",
      position: "relative",
      width: sizePx,
      height: sizePx,
      borderRadius: "50%",
      backgroundColor: this.ringColor
    });

    this.setElementStyle(content, {
      position: "absolute",
      left: "0",
      right: "0",
      top: "0",
      bottom: "0",
      margin: "auto",
      width: contentSize,
      height: contentSize,
      borderRadius: "50%",
      backgroundColor: this.backgroundColor,
      zIndex: 2
    });

    left.style.cssText = "z-index: 1; -webkit-transform-origin: right 50%;";
    right.style.cssText = "z-index: 0; -webkit-transform-origin: right 50%;";
    var commonStyle = {
      position: "absolute",
      left: "0",
      top: "0",
      width: "50%",
      height: "100%",
      transformOrigin: "right 50%"
    }
    this.setElementStyle(left, commonStyle);
    this.setElementStyle(right, commonStyle);
    return {
      root: root,
      left: left,
      content: content,
      right: right
    }
  }
  CircleRing.prototype.setElementStyle = function(element, styleObject) {
    for(var key in styleObject) {
      element.style[key] = styleObject[key];
    }
  }
  // 导出信息
  exports.CircleRing = CircleRing;
})(window);
