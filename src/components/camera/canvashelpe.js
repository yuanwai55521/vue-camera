var ViewCanvas = function () {
  var cWidth = 0, // 画布宽度
    cHeight = 0, // 画布高度
    iWidth = 0, // 图片宽度
    iHeight = 0, // 图片高度
    canvas = null, // 画布element
    ctx = null, // 画布上下文
    appearSize = 100, // 图片拖拽至边缘的最小显示
    scaleStep = 0.02, // 缩放步进
    minScale = 0.0008, // 最小缩放比例
    maxScale = 32, // 最大缩放比例
    x = 0, // 图片在画布中的横坐标
    y = 0, // 图片在画布中的纵坐标
    prevX = 0, // 拖动过程中，鼠标前一次移动位置的横坐标
    prevY = 0, // 拖动过程中，鼠标前一次移动位置的纵坐标
    scale = 1, // 缩放比例
    image = null, // 图片element
    bCanvas = null, // 存储图像数据的画布
    bCtx = null, // 存储图像数据画布的上下文
    textOptions = null, // 存储文本信息
    mergeImg = null, // 合并图像
    mWidth = 0, // 合并图像宽
    mHeight = 0, //合并图像高
    initCtxImg = '', // ctx默认图像
    features = {
      // 开关拖动
      dragOn: false,
      // 开关缩放
      ScaleOn: false
    };

  /* 记录canvas的宽高，绑定鼠标按下和滚动事件 */
  function initial(options) {
    ctx = options.canvas.getContext('2d');
    cWidth = options.canvas.clientWidth;
    cHeight = options.canvas.clientHeight;
    canvas = options.canvas;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousewheel', handleMouseWheel);
    if (options.initCtxImg) {
      let coincideImg = new Image();
      coincideImg.src = options.initCtxImg;
      coincideImg.addEventListener('load', function () {
        initCtxImg = coincideImg;
      });
    };
  };

  /* 向画布中加入图像 */
  function setImage(src, className = 'noneCanvas') {
    image = new Image();
    image.src = src;
    image.addEventListener('load', function () {
      iWidth = image.width;
      iHeight = image.height;
      if (className === 'noneCanvas' && document.getElementsByClassName(className)[0]) {
        document.body.removeChild(document.getElementsByClassName(className)[0]);
      };
      bCanvas = document.createElement('canvas');
      bCanvas.width = iWidth;
      bCanvas.height = iHeight;
      bCanvas.className = className;
      bCanvas.style.display = 'none';
      bCtx = bCanvas.getContext('2d');
      bCtx.drawImage(image, 0, 0, iWidth, iHeight);
      document.body.appendChild(bCanvas);

      textOptions = null;
      scale = 1;
      setXY(0, 0);
    });
  };

  /* 旋转图像 未能实现*/
  // function rotateImg(size) {
  //   bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
  //   ctx.clearRect(0, 0, cWidth, cHeight);
  //   bCtx.translate(iWidth / 2, iHeight / 2); // 重新映射画布上的（0,0）位置
  //   bCtx.rotate(size);
  //   bCtx.translate(-iWidth / 2, -iHeight / 2);
  //   bCtx.drawImage(image, 0, 0, bCanvas.width, bCanvas.height, (bCanvas.width - iWidth) / 2, (bCanvas.width - iHeight) / 2, iWidth, iHeight);
  //   ctx.drawImage(bCanvas, -x / scale, -y / scale, cWidth / scale, cHeight / scale, 0, 0, cWidth, cHeight);
  // };

  /* 添加文本 */
  function addText(options = textOptions) {
    if (options || textOptions) {
      ctx.clearRect(0, 0, cWidth, cHeight);
      bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
      bCtx.drawImage(image, 0, 0, iWidth, iHeight);
      options && (textOptions = options);
      bCtx.font = options.font;
      bCtx.fillStyle = options.fillStyle;
      bCtx.fillText(options.content, options.x * bCanvas.width / 100, options.y * bCanvas.height / 100);
      ctx.drawImage(bCanvas, -x / scale, -y / scale, cWidth / scale, cHeight / scale, 0, 0, cWidth, cHeight);
    };
  };

  /* 取消文字标注 */
  function cancelTextAdd() {
    if (!bCtx || !ctx) return;
    textOptions = null;
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    bCtx.drawImage(image, 0, 0, iWidth, iHeight);
    ctx.clearRect(0, 0, cWidth, cHeight);
    ctx.drawImage(bCanvas, -x / scale, -y / scale, cWidth / scale, cHeight / scale, 0, 0, cWidth, cHeight);
  };

  /** 合并图像
   * @param {options} 参数direction：方向，base：图像base64
   */
  function addImg(options) {
    // 移除已有的bCtx
    document.body.removeChild(document.getElementsByClassName('noneCanvas')[0]);
    // 实例化合并的图片
    mergeImg = new Image();
    mergeImg.src = options.base;
    mergeImg.addEventListener('load', function () {
      mWidth = mergeImg.width;
      mHeight = mergeImg.height;
      // 创建画布
      bCanvas = document.createElement('canvas');
      bCanvas.className = 'noneCanvas';
      bCanvas.style.display = 'none';
      // 根据方向来确定bCtx画布的宽高
      if (options.direction === 'top' || options.direction === 'bottom') {
        bCanvas.width = iWidth - mWidth >= 0 ? iWidth : mWidth;
        bCanvas.height = iHeight + mHeight;
      } else if (options.direction === 'right' || options.direction === 'left') {
        bCanvas.width = iWidth + mWidth;
        bCanvas.height = iHeight - mHeight >= 0 ? iHeight : mHeight;
      };
      bCtx = bCanvas.getContext('2d');
      // 根据方向的不同将合并的图像画在画布上
      if (options.direction === 'top') {
        bCtx.drawImage(mergeImg, 0, 0, mWidth, mHeight)
        bCtx.drawImage(image, 0, 0, iWidth, iHeight, 0, mHeight, iWidth, iHeight);
      } else if (options.direction === 'right') {
        bCtx.drawImage(image, 0, 0, iWidth, iHeight);
        bCtx.drawImage(mergeImg, 0, 0, mWidth, mHeight, iWidth, 0, mWidth, mHeight);
      } else if (options.direction === 'bottom') {
        bCtx.drawImage(image, 0, 0, iWidth, iHeight);
        bCtx.drawImage(mergeImg, 0, 0, mWidth, mHeight, 0, iHeight, mWidth, mHeight);
      } else if (options.direction === 'left') {
        bCtx.drawImage(mergeImg, 0, 0, mWidth, mHeight)
        bCtx.drawImage(image, 0, 0, iWidth, iHeight, mWidth, 0, iWidth, iHeight);
      };
      document.body.appendChild(bCanvas);
      ctx.drawImage(bCanvas, -x / scale, -y / scale, cWidth / scale, cHeight / scale, 0, 0, cWidth, cHeight);
      setXY(0, 0);
    });
  };

  /* 拖动和滚动缩放的开关 */
  function setFeatures(f, value) {
    features[f] = value;
  };

  /* 实时更新画布 */
  function update() {
    if (!bCanvas) return;
    // 清空画布
    ctx.clearRect(0, 0, cWidth, cHeight);
    initCtxImg && ctx.drawImage(initCtxImg, 0, 0, initCtxImg.width, initCtxImg.height);
    // Debug：这里IE有个bug，第二个和第三个参数不能小于0
    ctx.drawImage(bCanvas, -x / scale, -y / scale, cWidth / scale, cHeight / scale, 0, 0, cWidth, cHeight);
    addText();
  };

  /* 鼠标按下 */
  function handleMouseDown(e) {
    var prevP = calculateChange(e, canvas);
    var ix = Math.floor((prevP.x - x) / scale);
    var iy = Math.floor((prevP.y - y) / scale);
    prevX = prevP.x;
    prevY = prevP.y;
    if (features.dragOn) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleMouseUp);
    };
  };

  /* 鼠标拖动 */
  function handleDrag(e) {
    var p = calculateChange(e, canvas);
    var offsetX = (p.x - prevX);
    var offsetY = (p.y - prevY);
    setXY(x + offsetX, y + offsetY);
    prevX = p.x;
    prevY = p.y;
  };

  /* 鼠标弹起 */
  function handleMouseUp(e) {
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mousemove', handleMouseUp);
  };

  /* 滚动缩放 */
  function handleMouseWheel(e) {
    if (!features.ScaleOn) return;
    var wd = e.wheelDelta;
    var newScale = scale * (1 + (wd > 0 ? scaleStep : -scaleStep));
    newScale = newScale < minScale ? minScale : newScale;
    newScale = newScale > maxScale ? maxScale : newScale;
    if (newScale !== scale) {
      var p = calculateChange(e, canvas);
      var newX = (x - p.x) * newScale / scale + p.x;
      var newY = (y - p.y) * newScale / scale + p.y;
      scale = newScale;
      setXY(newX, newY);
    };
  };

  /* 防止图片被拖出画布 */
  function setXY(vx, vy) {
    if (vx < appearSize - bCanvas.width * scale) {
      x = appearSize - bCanvas.width * scale;
    } else if (vx > cWidth - appearSize) {
      x = cWidth - appearSize;
    } else {
      x = vx;
    }
    if (vy < appearSize - bCanvas.height * scale) {
      y = appearSize - bCanvas.height * scale;
    } else if (vy > cHeight - appearSize) {
      y = cHeight - appearSize;
    } else {
      y = vy;
    }
    update();
  };

  /* 计算鼠标事件相对容器的位置 */
  function calculateChange(e, container, skip) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX;
    const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY;
    let left = x - (container.getBoundingClientRect().left + window.pageXOffset);
    let top = y - (container.getBoundingClientRect().top + window.pageYOffset);

    if (left < 0) {
      left = 0;
    } else if (left > containerWidth) {
      left = containerWidth;
    };
    if (top < 0) {
      top = 0;
    } else if (top > containerHeight) {
      top = containerHeight;
    };

    return {
      x: left,
      y: top
    };
  };

  /* 重置所有画布 */
  function resetAllCanvas() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    ctx.clearRect(0, 0, cWidth, cHeight);
  };

  return {
    initial: initial,
    setImage: setImage,
    setFeatures: setFeatures,
    addText: addText,
    addImg: addImg,
    cancelTextAdd: cancelTextAdd,
    resetAllCanvas: resetAllCanvas
    // rotateImg: rotateImg - 旋转功能
  };
};

export default ViewCanvas;