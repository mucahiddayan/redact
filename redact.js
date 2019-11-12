function Redact(canvas, options) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw TypeError(`Element must be a HTMLCanvasElement!`);
  }

  let _drawArea, _ctx, _parent, _onchange, _width, _height, _isActive;
  let startX,
    startY = 0;

  let mousedown = false;

  const EVENTS = ['up', 'down', 'move', 'out'];
  const _options = { multiple: false, fillColor: 'rgba(0,0,0,.2)', strokeWidth: 1, strokeColor: '#333', ...options };

  const determineXY = (e) => {
    if (mousedown) {
      const tempX = e.offsetX;
      const tempY = e.offsetY;
      _width = Math.abs(startX - tempX);
      _height = Math.abs(startY - tempY);
      draw({ x: startX, y: startY, width: _width, height: _height });
    }
  };

  const clear = () => {
    _ctx.clearRect(0, 0, _drawArea.width, _drawArea.height);
  };

  const mouseup = () => {
    mousedown = false;
    if (typeof _onchange === 'function') {
      _onchange({ x: startX, y: startY, width: _width, height: _height });
    }
  };

  const events = {
    down: (e) => {
      startX = e.offsetX;
      startY = e.offsetY;
      mousedown = true;
    },
    up: mouseup,
    move: determineXY,
    out: mouseup,
  };

  const draw = ({ x, y, width, height }) => {
    if (!_isActive) {
      return;
    }
    if (_options.multiple === false) {
      clear();
    }
    _ctx.beginPath();
    _ctx.rect(x, y, width, height);
    _ctx.strokeStyle = _options.strokeColor;
    _ctx.fillStyle = _options.fillColor;
    _ctx.fillRect(x, y, width, height);
    _ctx.lineWidth = _options.strokeWidth;
    _ctx.stroke();
  };

  const syncWithCanvas = () => {
    if (!_drawArea) {
      throw Error('Drawarea is not initialized yet!');
    }
    _drawArea.width = canvas.width;
    _drawArea.height = canvas.height;
    _drawArea.style.top = `${canvas.offsetTop}px`;
    _drawArea.style.left = `${canvas.offsetLeft}px`;
  };

  const init = () => {
    if (document.querySelector('.drawarea')) {
      document.querySelector('.drawarea').remove();
    }
    _isActive = true;

    _drawArea = document.createElement('canvas');
    // static properties
    _drawArea.style.position = 'absolute';
    _drawArea.style.cursor = 'crosshair';
    _drawArea.style.zIndex = 99;
    _drawArea.classList.add('drawarea');
    _ctx = _drawArea.getContext('2d');
    canvas.parentNode.insertBefore(_drawArea, canvas.nextElementSibling);
    _parent = canvas.parentElement;

    syncWithCanvas();

    // register listeners
    EVENTS.forEach((event) => _drawArea.addEventListener(`mouse${event}`, events[event]));
  };

  const getCanvasSize = () => ({ canvasWidth: canvas.width, canvasHeight: canvas.height });

  const destroy = () => {
    if (!_isActive) return;
    _isActive = false;
    EVENTS.forEach((event) => _drawArea.removeEventListener(`mouse${event}`, events[event]));
    _drawArea.remove();
  };

  return {
    subscribe: (cb) => {
      if (typeof cb !== 'function') {
        throw TypeError(`parameter of subscribe must be a function!`);
      }
      _onchange = cb;
    },
    clear,
    init,
    destroy,
    draw,
    getCanvasSize,
    get isActive() {
      return _isActive;
    },
  };
}