function Whiten(canvas, options) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw TypeError(`Element must be a HTMLCanvasElement!`);
  }

  let drawArea, offsetLeft, offsetTop, ctx, left, top, parent, onchange, width, height, isActive;

  let x1,
    y1,
    _x,
    _y = 0;

  let mousedown = false;

  const _options = { multiple: false, fillColor: 'rgba(0,0,0,.2)', strokeWidth: 1, strokeColor: '#333', ...options };

  const getScrolls = () => {
    return { top: parent.scrollTop || 0, left: parent.scrollLeft || 0 };
  };

  const getPositions = event => ({
    left: event.pageX - offsetLeft - left,
    top: event.pageY - offsetTop - top
  });

  const events = {
    down: e => {
      _x = parseInt(getPositions(e).left + getScrolls().left);
      _y = parseInt(getPositions(e).top + getScrolls().top);
      mousedown = true;
    },
    up: () => {
      mousedown = false;
      if (typeof onchange === 'function') {
        onchange({ x: _x, y: _y, width, height });
      }
    },
    move: e => {
      x1 = parseInt(getPositions(e).left + getScrolls().left);
      y1 = parseInt(getPositions(e).top + getScrolls().top);

      if (mousedown) {
        width = x1 - _x;
        height = y1 - _y;
        draw({ x: _x, y: _y, width, height });
      }
    }
  };

  const draw = ({ x, y, width, height }) => {
    if (!isActive) {
      return;
    }
    if (_options.multiple === false) {
      clear();
    }
    ctx.beginPath();

    ctx.rect(Math.abs(x), Math.abs(y), width, height);
    ctx.strokeStyle = _options.strokeColor;
    ctx.fillStyle = _options.fillColor;
    ctx.fillRect(Math.abs(x), Math.abs(y), width, height);
    ctx.lineWidth = _options.strokeWidth;
    ctx.stroke();
  };

  const clear = () => {
    ctx.clearRect(0, 0, drawArea.width, drawArea.height);
  };

  const init = () => {
    if (document.querySelector('.drawarea')) {
      document.querySelector('.drawarea').remove();
    }
    isActive = true;

    drawArea = document.createElement('canvas');
    drawArea.width = canvas.width;
    drawArea.height = canvas.height;
    drawArea.style.position = 'absolute';
    drawArea.style.cursor = 'crosshair';
    offsetLeft = drawArea.offsetLeft;
    offsetTop = drawArea.offsetTop;
    drawArea.style.top = `${canvas.offsetTop}px`;
    drawArea.style.left = `${canvas.offsetLeft}px`;
    drawArea.style.zIndex = 99;
    drawArea.classList.add('drawarea');
    ctx = drawArea.getContext('2d');
    canvas.parentNode.insertBefore(drawArea, canvas.nextElementSibling);
    const boundingClientRect = drawArea.getBoundingClientRect();

    parent = canvas.parentElement;
    left = boundingClientRect.left + getScrolls().left;
    top = boundingClientRect.top + getScrolls().top;

    ['up', 'down', 'move'].forEach(event => drawArea.addEventListener(`mouse${event}`, events[event]));
  };

  const destroy = () => {
    isActive = false;
    ['up', 'down', 'move'].forEach(event => drawArea.removeEventListener(`mouse${event}`, events[event]));
    drawArea.remove();
  };

  return {
    subscribe: cb => {
      if (typeof cb !== 'function') {
        throw TypeError(`parameter of subscribe must be a function!`);
      }
      onchange = cb;
    },
    clear,
    init,
    destroy,
    draw,
    get isActive() {
      return isActive;
    }
  };
}
