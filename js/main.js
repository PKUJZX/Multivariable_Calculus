document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content');
    const navLinks = document.querySelectorAll('.nav-link');

    // 定义一个函数来加载并显示章节内容
    const loadContent = async (pageName) => {
        // 在加载新内容前，先显示一个提示
        contentArea.innerHTML = '<p>正在加载内容，请稍候...</p>';
        
        // 更新活动链接的样式
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        try {
            // 使用 fetch API 异步获取 HTML 文件内容
            const response = await fetch(`chapters/${pageName}.html`);

            // 检查请求是否成功
            if (!response.ok) {
                throw new Error(`无法加载页面: ${response.status} ${response.statusText}`);
            }

            // 获取响应的文本内容
            const htmlContent = await response.text();
            
            // 将获取到的 HTML 内容注入到主内容区域
            contentArea.innerHTML = htmlContent;

            // **关键步骤**: 内容加载后，需要告诉 MathJax 重新扫描并渲染页面上的数学公式
            if (window.MathJax) {
                MathJax.typesetPromise([contentArea]).catch((err) => console.log('MathJax typeset failed: ', err));
            }
            
            // **新增**: 内容加载后，初始化该章节对应的可视化图表
            initializeVisualizations(pageName);

        } catch (error) {
            // 如果加载失败，显示错误信息
            contentArea.innerHTML = `<p style="color: red;">抱歉，加载内容时发生错误。请检查文件路径是否正确，或查看控制台获取更多信息。</p>`;
            console.error('加载内容失败:', error);
        }
    };

    // 为每个导航链接添加点击事件监听器
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止链接的默认跳转行为
            const page = link.getAttribute('data-page');
            if (page) {
                loadContent(page);
            }
        });
    });

    // 页面首次加载时，默认加载第一部分的内容
    loadContent('ch1');
});


// --- 可视化函数 ---

/**
 * 根据页面名称初始化对应的Canvas图表
 * @param {string} pageName - 当前加载的页面标识 (e.g., 'ch1', 'ch2', 'ch3', 'ch4')
 */
const initializeVisualizations = (pageName) => {
    if (pageName === 'ch1') {
        const vectorCanvas = document.getElementById('vectorFieldCanvas');
        if (vectorCanvas) drawVectorField(vectorCanvas);
        const contourCanvas = document.getElementById('contourPlotCanvas');
        if (contourCanvas) drawContourPlot(contourCanvas);
        const limitCanvas = document.getElementById('limitPathCanvas');
        if (limitCanvas) drawLimitPaths(limitCanvas);
    } else if (pageName === 'ch2') {
        const partialCanvas = document.getElementById('partialDerivativeCanvas');
        if(partialCanvas) drawPartialDerivativeViz(partialCanvas);
        const gradientCanvas = document.getElementById('gradientDirectionalCanvas');
        if(gradientCanvas) drawGradientViz(gradientCanvas);
    } else if (pageName === 'ch3') {
        const changeVarCanvas = document.getElementById('changeOfVariablesCanvas');
        if(changeVarCanvas) drawChangeOfVariablesViz(changeVarCanvas);
        const lineIntegralCanvas = document.getElementById('lineIntegralCanvas');
        if(lineIntegralCanvas) drawLineIntegralViz(lineIntegralCanvas);
    } else if (pageName === 'ch4') {
        const greenCanvas = document.getElementById('greenTheoremCanvas');
        if(greenCanvas) drawGreenTheoremViz(greenCanvas);
        const divergenceCanvas = document.getElementById('divergenceTheoremCanvas');
        if(divergenceCanvas) drawDivergenceTheoremViz(divergenceCanvas);
    }
};

// --- CH1 Visualizations ---

/**
 * 绘制向量场 F = <-y, x>
 * @param {HTMLCanvasElement} canvas 
 */
function drawVectorField(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const gridSize = 30;
    const arrowLength = 12;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);
    for (let i = gridSize; i < width; i += gridSize) {
        for (let j = gridSize; j < height; j += gridSize) {
            const x = (i - width / 2) / gridSize;
            const y = (height / 2 - j) / gridSize;
            const vx = -y;
            const vy = x;
            const mag = Math.sqrt(vx * vx + vy * vy);
            if (mag > 0) {
                const ux = vx / mag * arrowLength;
                const uy = vy / mag * arrowLength;
                drawArrow(ctx, i, j, i + ux, j - uy, '#0d47a1');
            }
        }
    }
}

/**
 * 绘制函数 f = x^2 + y^2 的等高线
 * @param {HTMLCanvasElement} canvas 
 */
function drawContourPlot(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 20;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);
    const c_values = [1, 4, 9, 16, 25];
    ctx.strokeStyle = '#28a745';
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    c_values.forEach(c => {
        const radius = Math.sqrt(c) * scale;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(`c=${c}`, width / 2 + radius / Math.sqrt(2) + 5, height / 2 - radius / Math.sqrt(2));
    });
}

/**
 * 绘制极限 f = (x^2-y^2)/(x^2+y^2) 的不同趋近路径
 * @param {HTMLCanvasElement} canvas 
 */
function drawLimitPaths(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height, 'x', 'y');
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width, height / 2);
    ctx.lineTo(width / 2 + 15, height / 2);
    ctx.stroke();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width / 2 - 15, height / 2);
    ctx.stroke();
    drawArrow(ctx, width - 50, height / 2, width / 2 + 15, height / 2, '#dc3545');
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('路径 1 (y=0): 极限 → 1', width / 2 + 20, height / 2 - 20);
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height / 2 - 15);
    ctx.stroke();
    ctx.moveTo(width / 2, height);
    ctx.lineTo(width / 2, height / 2 + 15);
    ctx.stroke();
    drawArrow(ctx, width / 2, height - 50, width / 2, height / 2 + 15, '#0d47a1');
    ctx.fillStyle = '#0d47a1';
    ctx.fillText('路径 2 (x=0): 极限 → -1', width / 2 + 20, height / 2 + 30);
    ctx.lineWidth = 1;
}

// --- CH2 Visualizations ---

/**
 * 绘制偏导数的可视化 f(x,y) = x^2 + 0.25y^2
 * @param {HTMLCanvasElement} canvas 
 */
function drawPartialDerivativeViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 40; // Scale for coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);

    // 函数 f(x, y) = x^2 + 0.25*y^2
    // 等高线是 x^2 + 0.25y^2 = c, 是椭圆
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#a9a9a9'; // Light gray for contours

    levels.forEach(c => {
        const radiusX = Math.sqrt(c) * scale;
        const radiusY = Math.sqrt(c / 0.25) * scale; // i.e., 2 * sqrt(c) * scale
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    });

    // 点 P(1, 2)
    const px = centerX + 1 * scale;
    const py = centerY - 2 * scale; // Y is inverted in canvas coordinates

    // 绘制点 P
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillText('P(1, 2)', px + 10, py + 5);

    // 绘制 x 方向的切片和箭头
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(width, py);
    ctx.stroke();
    drawArrow(ctx, px, py, px + 60, py, '#dc3545', 2.5);
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('x 方向 (∂f/∂x = 2)', px + 5, py - 15);

    // 绘制 y 方向的切片和箭头
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();
    drawArrow(ctx, px, py, px, py - 60, '#0d47a1', 2.5); // y-direction is up in math coords, so negative in canvas
    ctx.fillStyle = '#0d47a1';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('y 方向 (∂f/∂y = 1)', px + 10, py + 30);
    
    // 重置字体和线宽
    ctx.font = '12px Arial';
    ctx.lineWidth = 1;
}

/**
 * 绘制梯度和方向导数的可视化 (f = x^2+y^2 at P(-2,-1))
 * @param {HTMLCanvasElement} canvas 
 */
function drawGradientViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 35; // Adjusted scale
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);

    // 等高线 f(x,y) = x^2 + y^2 = c
    const c_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ccc';
    c_values.forEach(c => {
        const radius = Math.sqrt(c) * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    });

    // 点 P(-2, -1)
    const p_math = { x: -2, y: -1 };
    const px = centerX + p_math.x * scale;
    const py = centerY - p_math.y * scale; // y is inverted

    // 绘制点 P
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillText('P(-2, -1)', px - 90, py - 5);

    // 梯度 ∇f = <-4, -2>
    const grad_math = { x: -4, y: -2 };
    const gradX_canvas = grad_math.x * scale;
    const gradY_canvas = -grad_math.y * scale;
    drawArrow(ctx, px, py, px + gradX_canvas, py + gradY_canvas, '#28a745', 3);
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('∇f', px + gradX_canvas - 30, py + gradY_canvas - 5);

    // 方向向量 u = <1/sqrt(2), -1/sqrt(2)>
    const u_math = { x: 1 / Math.sqrt(2), y: -1 / Math.sqrt(2) };
    const uVecScale = 80;
    const ux_canvas = u_math.x * uVecScale;
    const uy_canvas = -u_math.y * uVecScale;
    drawArrow(ctx, px, py, px + ux_canvas, py + uy_canvas, '#0d47a1', 2);
    ctx.fillStyle = '#0d47a1';
    ctx.fillText('u', px + ux_canvas, py + uy_canvas + 15);

    // 方向导数 D_u f (投影向量)
    const dot_product = grad_math.x * u_math.x + grad_math.y * u_math.y; // This is D_u f
    const proj_math = { x: dot_product * u_math.x, y: dot_product * u_math.y };
    const projX_canvas = proj_math.x * scale;
    const projY_canvas = -proj_math.y * scale;

    // 绘制投影向量
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + projX_canvas, py + projY_canvas);
    ctx.stroke();
    ctx.fillStyle = '#dc3545';
    ctx.fillText('D_u f (投影)', px + projX_canvas / 2 - 20, py + projY_canvas / 2 + 20);
    
    // 绘制从梯度末端到投影点的虚线
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(px + gradX_canvas, py + gradY_canvas);
    ctx.lineTo(px + projX_canvas, py + projY_canvas);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '12px Arial';
}


// --- CH3 Visualizations ---

function drawChangeOfVariablesViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const leftCenterX = width / 4;
    const leftCenterY = height / 2;
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(leftCenterX - 100, leftCenterY - 100, 200, 200);
    ctx.fillStyle = '#888';
    ctx.fillText('r-θ space', leftCenterX - 30, leftCenterY + 120);
    const r0 = 60, dr = 20;
    const th0 = 50, dth = 25;
    ctx.fillStyle = 'rgba(220, 53, 69, 0.3)';
    ctx.fillRect(leftCenterX + r0, leftCenterY - th0 - dth, dr, dth);
    ctx.strokeStyle = '#dc3545';
    ctx.strokeRect(leftCenterX + r0, leftCenterY - th0 - dth, dr, dth);
    ctx.fillStyle = '#333';
    ctx.fillText('dA = dr dθ', leftCenterX + r0, leftCenterY - th0 - dth - 5);
    drawArrow(ctx, width / 2 - 20, height / 2, width / 2 + 20, height / 2, 'black', 2);
    ctx.fillText('映射', width/2 - 15, height/2 - 10);
    const rightCenterX = width * 3 / 4;
    const rightCenterY = height / 2;
    drawAxes(ctx, width, height, 'x', 'y', rightCenterX, rightCenterY);
    const polarToCartesian = (r, theta) => ({
        x: rightCenterX + r * Math.cos(theta),
        y: rightCenterY - r * Math.sin(theta)
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ccc';
    for (let r = 20; r < 150; r += 20) {
        ctx.beginPath();
        ctx.arc(rightCenterX, rightCenterY, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
    for (let th = 0; th < 2 * Math.PI; th += Math.PI / 8) {
        const start = polarToCartesian(0, th);
        const end = polarToCartesian(150, th);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    const r_map = 100, dr_map = 20;
    const th_map = Math.PI / 6, dth_map = Math.PI / 12;
    const p1 = polarToCartesian(r_map, th_map);
    const p2 = polarToCartesian(r_map + dr_map, th_map);
    const p3 = polarToCartesian(r_map + dr_map, th_map + dth_map);
    const p4 = polarToCartesian(r_map, th_map + dth_map);
    ctx.fillStyle = 'rgba(220, 53, 69, 0.5)';
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.arc(rightCenterX, rightCenterY, r_map + dr_map, - (th_map), - (th_map + dth_map), true);
    ctx.lineTo(p4.x, p4.y);
    ctx.arc(rightCenterX, rightCenterY, r_map, - (th_map + dth_map), - (th_map), false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.fillText('dA = r dr dθ', p3.x, p3.y + 15);
}

function drawLineIntegralViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 120;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);
    const gridSize = 40;
    for (let i = 0; i < width; i += gridSize) {
        for (let j = 0; j < height; j += gridSize) {
            const x = (i - width / 2) / scale;
            const y = (height / 2 - j) / scale;
            const vx = -y;
            const vy = x;
            const mag = Math.sqrt(vx * vx + vy * vy);
            if (mag > 0) {
                const ux = vx / mag * 15;
                const uy = vy / mag * 15;
                drawArrow(ctx, i, j, i + ux, j - uy, '#add8e6');
            }
        }
    }
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText('C', width / 2 + scale + 5, height / 2);
    const t = Math.PI / 4;
    const px = width / 2 + Math.cos(t) * scale;
    const py = height / 2 - Math.sin(t) * scale;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fill();
    const Fx = -Math.sin(t) * 50;
    const Fy = Math.cos(t) * 50;
    drawArrow(ctx, px, py, px + Fx, py - Fy, '#0d47a1', 2);
    ctx.fillStyle = '#0d47a1';
    ctx.fillText('F', px + Fx - 20, py - Fy);
    const drx = -Math.sin(t) * 50;
    const dry = Math.cos(t) * 50;
    drawArrow(ctx, px, py, px + drx, py - dry, '#dc3545', 2);
    ctx.fillStyle = '#dc3545';
    ctx.fillText('dr', px + drx, py - dry + 15);
}

// --- CH4 Visualizations ---

function drawGreenTheoremViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 120;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);
    const gridSize = 30;
    for (let i = 0; i < width; i += gridSize) {
        for (let j = 0; j < height; j += gridSize) {
            const x = (i - centerX) / scale;
            const y = (centerY - j) / scale;
            if (x*x + y*y < 1.1*1.1) {
                const vx = -y;
                const vy = x;
                const mag = Math.sqrt(vx*vx + vy*vy);
                if (mag > 0) {
                    const ux = vx / mag * 10;
                    const uy = vy / mag * 10;
                    drawArrow(ctx, i, j, i + ux, j - uy, '#cae9ff');
                }
            }
        }
    }
    ctx.strokeStyle = '#0d47a1';
    for (let r = 0.2; r < 1; r += 0.4) {
        for (let th = 0; th < 2 * Math.PI; th += Math.PI / 4) {
            const px = centerX + r * scale * Math.cos(th);
            const py = centerY - r * scale * Math.sin(th);
            ctx.beginPath();
            ctx.arc(px, py, 10, 0, 2 * Math.PI);
            ctx.stroke();
            drawArrow(ctx, px + 10, py, px + 9, py - 1, '#0d47a1', 1);
        }
    }
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
    ctx.stroke();
    const ax = centerX + scale * Math.cos(Math.PI/4);
    const ay = centerY - scale * Math.sin(Math.PI/4);
    drawArrow(ctx, ax - 10, ay - 10, ax, ay, '#dc3545', 3);
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('∂D', ax + 5, ay + 5);
}

function drawDivergenceTheoremViz(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 120;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, width, height);
    ctx.fillStyle = 'rgba(34, 139, 34, 0.5)';
    for(let i=0; i<150; i++) {
        const r = Math.random() * scale;
        const th = Math.random() * 2 * Math.PI;
        const px = centerX + r * Math.cos(th);
        const py = centerY + r * Math.sin(th);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.lineWidth = 2;
    for (let th = 0; th < 2 * Math.PI; th += Math.PI / 8) {
        const x = Math.cos(th);
        const y = Math.sin(th);
        const startX = centerX + x * scale;
        const startY = centerY - y * scale;
        const endX = startX + x * 25;
        const endY = startY - y * 25;
        drawArrow(ctx, startX, startY, endX, endY, '#0d47a1', 2);
    }
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('∂V', centerX + scale * Math.cos(Math.PI/4) + 5, centerY - scale * Math.sin(Math.PI/4) - 5);
}


// --- 绘图辅助函数 ---

function drawAxes(ctx, width, height, xLabel = 'x', yLabel = 'y', cx, cy) {
    const centerX = cx || width / 2;
    const centerY = cy || height / 2;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - width/2, centerY);
    ctx.lineTo(centerX + width/2, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - height/2);
    ctx.lineTo(centerX, centerY + height/2);
    ctx.stroke();
    ctx.fillStyle = '#888';
    ctx.font = 'italic 14px Arial';
    ctx.fillText(xLabel, centerX + width/2 - 15, centerY - 10);
    ctx.fillText(yLabel, centerX + 10, centerY - height/2 + 15);
}

function drawArrow(ctx, fromX, fromY, toX, toY, color = '#333', lineWidth = 1.5) {
    const headlen = 8;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}
