const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const errorEl = document.getElementById('error');

const padding = 50;

function parseValues(str) {
  return str
    .split(',')
    .map((v) => parseFloat(v.trim()))
    .filter((v) => !isNaN(v));
}

function drawGraph(xValues, yValues, type) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = canvas.width;
  const height = canvas.height;

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(0, ...yValues);
  const yMax = Math.max(...yValues);

  const xScale = (width - 2 * padding) / (xMax - xMin || 1);
  const yScale = (height - 2 * padding) / (yMax - yMin || 1);

  const toPixelX = (x) => padding + (x - xMin) * xScale;
  const toPixelY = (y) => height - padding - (y - yMin) * yScale;

  // Axes
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Axis labels (ticks)
  ctx.fillStyle = '#555';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'center';
  const xTicks = 5;
  for (let i = 0; i <= xTicks; i++) {
    const val = xMin + ((xMax - xMin) * i) / xTicks;
    const px = toPixelX(val);
    ctx.fillText(val.toFixed(1), px, height - padding + 18);
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(px, padding);
    ctx.lineTo(px, height - padding);
    ctx.stroke();
  }

  ctx.textAlign = 'right';
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = yMin + ((yMax - yMin) * i) / yTicks;
    const py = toPixelY(val);
    ctx.fillText(val.toFixed(1), padding - 10, py + 4);
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(padding, py);
    ctx.lineTo(width - padding, py);
    ctx.stroke();
  }

  // Data
  const points = xValues.map((x, i) => ({
    x: toPixelX(x),
    y: toPixelY(yValues[i]),
  }));

  if (type === 'line') {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === 'bar') {
    const barWidth = Math.max(6, (width - 2 * padding) / points.length / 1.6);
    ctx.fillStyle = '#2563eb';
    points.forEach((p) => {
      const zeroY = toPixelY(0);
      ctx.fillRect(p.x - barWidth / 2, Math.min(p.y, zeroY), barWidth, Math.abs(zeroY - p.y));
    });
  } else if (type === 'scatter') {
    ctx.fillStyle = '#2563eb';
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function plot() {
  const xValues = parseValues(document.getElementById('xInput').value);
  const yValues = parseValues(document.getElementById('yInput').value);
  const type = document.getElementById('chartType').value;

  if (xValues.length === 0 || yValues.length === 0) {
    errorEl.textContent = 'Please enter valid comma-separated numbers for both X and Y.';
    return;
  }
  if (xValues.length !== yValues.length) {
    errorEl.textContent = `X has ${xValues.length} values but Y has ${yValues.length}. They must match.`;
    return;
  }

  errorEl.textContent = '';
  drawGraph(xValues, yValues, type);
}

document.getElementById('plotBtn').addEventListener('click', plot);
document.getElementById('chartType').addEventListener('change', plot);

// Draw once on load with default values
plot();