function Whiten(canvas, options) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw TypeError(`Element must be a HTMLCanvasElement!`);
  }

  let drawArea, offsetLeft, offsetTop, ctx, left, top, parent;

  let onchange, width, height;

  let x1,
    y1,
    x2,
    y2 = 0;

  let mousedown = false;

  const _options = { multiple: false, fillColor: 'rgba(0,0,0,.2)', strokeColor: '#333', ...options };

  const getScrolls = () => {
    return { top: parent.scrollTop || 0, left: parent.scrollLeft || 0 };
  };

  const getPositions = event => ({
    left: event.pageX - offsetLeft - left,
    top: event.pageY - offsetTop - top
  });

  const events = {
    down: e => {
      x2 = parseInt(getPositions(e).left + getScrolls().left);
      y2 = parseInt(getPositions(e).top + getScrolls().top);
      mousedown = true;
    },
    up: e => {
      mousedown = false;
      onchange({ x1, x2, y1, y2, width, height, canvasWidth: canvas.width, canvasHeight: canvas.height });
    },
    move: e => {
      x1 = parseInt(getPositions(e).left + getScrolls().left);
      y1 = parseInt(getPositions(e).top + getScrolls().top);
      if (_options.multiple === false) {
        ctx.clearRect(0, 0, drawArea.width, drawArea.height);
      }

      if (mousedown) {
        ctx.beginPath();
        width = x1 - x2;
        height = y1 - y2;
        ctx.rect(Math.abs(x2), Math.abs(y2), width, height);
        ctx.strokeStyle = _options.strokeColor;
        ctx.fillStyle = _options.fillColor;
        ctx.fillRect(Math.abs(x2), Math.abs(y2), width, height);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  const init = () => {
    if (document.querySelector('.drawarea')) {
      document.querySelector('.drawarea').remove();
    }

    drawArea = document.createElement('canvas');
    drawArea.width = canvas.width;
    drawArea.height = canvas.height;
    drawArea.style.position = 'absolute';
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

  init();

  return {
    subscribe: cb => {
      onchange = cb;
    }
  };
}
