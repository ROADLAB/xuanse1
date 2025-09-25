document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const productNav = document.getElementById('productNav');
    const colorNav = document.getElementById('colorNav');
    const imageContainers = document.querySelectorAll('.image-container');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeButton = document.querySelector('.close-button');

    // 图片缓存对象
    const imageCache = new Map();
    const preloadedImages = new Set();

    // 产品和颜色名称映射
    const productNames = {
        'flat': '平板台面',
        'groove': '单边凹槽阻水台面',
        'dish': '碟型台面',
        'sink': '碟型沥水槽台面',
        'bidirectional': '肩并肩双向导流防滑沥水槽台面',
        'face_to_face': '面对面双向导流防滑沥水槽台面'
    };

    const colorNames = {
        'amazon': '亚马逊蓝',
        'black': '睿智经典黑',
        'grey': '博雅斑点灰',
        'purple': '皇家紫罗兰',
        'agate': '德国玛瑙灰',
        'orange': '爱马仕橙',
        'green': '罗马青瓷绿',
        'white': '希腊沙滩白',
        'yellow': '冬日暖意黄'
    };

    // 定义每个产品可用的颜色
    const productAvailableColors = {
        'flat': ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white', 'yellow'],
        'groove': ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white'],
        'dish': ['amazon', 'black', 'grey', 'purple', 'agate', 'orange', 'green', 'white', 'yellow'],
        'sink': ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white', 'yellow'],
        'bidirectional': ['amazon', 'grey'],
        'face_to_face': ['amazon', 'grey']
    };

    // 默认颜色
    const defaultColor = 'amazon';

    // 从本地存储获取保存的状态或使用默认值
    let currentProduct = localStorage.getItem('selectedProduct') || 'flat';
    let currentColor = localStorage.getItem('selectedColor') || defaultColor;

    // 获取图片URL - 直接使用WebP格式
    function getImageUrl(productCode, colorCode, view) {
        const productName = productNames[productCode];
        const colorName = colorNames[colorCode];
        const baseName = `${productName}-${colorName}${view === 'side' ? '-侧视图' : ''}`;
        
        // 直接使用WebP格式
        return `images/${baseName}.webp`;
    }
    
    // 检测WebP支持
    function supportsWebP() {
        if (typeof supportsWebP.cache !== 'undefined') {
            return supportsWebP.cache;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const dataURL = canvas.toDataURL('image/webp');
        supportsWebP.cache = dataURL.indexOf('data:image/webp') === 0;
        return supportsWebP.cache;
    }

    // 恢复保存的选择状态
    function restoreSelection() {
        // 恢复产品选择
        const savedProduct = productNav.querySelector(`[data-product="${currentProduct}"]`);
        if (savedProduct) {
            productNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            savedProduct.classList.add('active');
        }

        // 更新颜色按钮显示状态
        updateColorButtons(currentProduct);

        // 恢复颜色选择
        const savedColor = colorNav.querySelector(`[data-color="${currentColor}"]`);
        if (savedColor && savedColor.style.display !== 'none') {
            colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            savedColor.classList.add('active');
        } else {
            // 如果保存的颜色不可用，使用默认颜色
            currentColor = defaultColor;
            const defaultButton = colorNav.querySelector(`[data-color="${defaultColor}"]`);
            if (defaultButton) {
                colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                defaultButton.classList.add('active');
            }
        }
    }

    // 保存选择状态到本地存储
    function saveSelection() {
        localStorage.setItem('selectedProduct', currentProduct);
        localStorage.setItem('selectedColor', currentColor);
    }

    // 检查图片是否存在并缓存
    function checkImage(url) {
        return new Promise((resolve, reject) => {
            if (imageCache.has(url)) {
                resolve(imageCache.get(url));
                return;
            }

            const img = new Image();
            img.onload = () => {
                imageCache.set(url, url);
                resolve(url);
            };
            img.onerror = () => {
                reject(new Error('Image not found'));
            };
            img.src = url;
        });
    }

    // 预加载图片
    function preloadImage(url) {
        if (preloadedImages.has(url) || imageCache.has(url)) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                imageCache.set(url, url);
                preloadedImages.add(url);
                resolve();
            };
            img.onerror = () => {
                resolve(); // 即使失败也继续
            };
            img.src = url;
        });
    }

    // 优化的图片预加载策略
    function preloadProductImages(product) {
        const availableColors = productAvailableColors[product];
        
        // 优先预加载常用颜色，使用requestIdleCallback优化性能
        const priorityColors = ['amazon', 'black', 'grey'];
        
        // 使用requestIdleCallback在浏览器空闲时预加载
        const schedulePreload = (callback) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(callback, { timeout: 2000 });
            } else {
                setTimeout(callback, 100);
            }
        };
        
        availableColors.forEach((color, index) => {
            const frontUrl = getImageUrl(product, color, 'front');
            const sideUrl = getImageUrl(product, color, 'side');
            
            if (priorityColors.includes(color)) {
                // 优先颜色立即预加载
                schedulePreload(() => {
                    preloadImage(frontUrl);
                    preloadImage(sideUrl);
                });
            } else {
                // 其他颜色延迟预加载，错开请求时间
                schedulePreload(() => {
                    setTimeout(() => {
                        preloadImage(frontUrl);
                        preloadImage(sideUrl);
                    }, 500 + index * 200);
                });
            }
        });
    }

    // 更新颜色按钮显示状态
    function updateColorButtons(productType) {
        const availableColors = productAvailableColors[productType];
        const colorButtons = colorNav.querySelectorAll('.nav-item');
        
        colorButtons.forEach(button => {
            const color = button.dataset.color;
            if (availableColors.includes(color)) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
                if (button.classList.contains('active')) {
                    // 如果当前选中的颜色不可用，切换到默认颜色
                    const defaultButton = colorNav.querySelector(`[data-color="${defaultColor}"]`);
                    defaultButton.classList.add('active');
                    currentColor = defaultColor;
                    saveSelection(); // 保存状态变更
                }
            }
        });
    }

    // 导航项点击处理
    function handleNavClick(nav, items, type) {
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // 移除其他项的激活状态
                items.forEach(i => i.classList.remove('active'));
                // 添加当前项的激活状态
                item.classList.add('active');
                
                // 更新当前选中的值
                if (type === 'product') {
                    currentProduct = item.dataset.product;
                    // 重置颜色选择为默认值
                    const colorButtons = colorNav.querySelectorAll('.nav-item');
                    colorButtons.forEach(button => button.classList.remove('active'));
                    const defaultButton = colorNav.querySelector(`[data-color="${defaultColor}"]`);
                    defaultButton.classList.add('active');
                    currentColor = defaultColor;
                    // 更新颜色按钮显示状态
                    updateColorButtons(currentProduct);
                    // 预加载新产品的常用颜色图片
                    preloadProductImages(currentProduct);
                } else {
                    currentColor = item.dataset.color;
                }
                
                // 保存选择状态
                saveSelection();
                
                // 更新图片
                updateImages();
            });
        });
    }

    // 初始化导航交互
    handleNavClick(productNav, productNav.querySelectorAll('.nav-item'), 'product');
    handleNavClick(colorNav, colorNav.querySelectorAll('.nav-item'), 'color');

    // 恢复之前的选择状态
    restoreSelection();

    // 更新图片函数
    async function updateImages() {
        // 并行处理所有图片容器，使用Promise.allSettled来处理可能的错误
        const updatePromises = Array.from(imageContainers).map(async (container) => {
            const view = container.dataset.view;
            const img = container.querySelector('.preview-image');
            const currentSrc = img.src;
            
            // 获取图片URL
            const imageUrl = getImageUrl(currentProduct, currentColor, view);

            // 如果新的URL与当前URL相同，则跳过
            if (currentSrc.endsWith(imageUrl)) {
                return { status: 'fulfilled', url: imageUrl };
            }

            // 添加加载状态
            container.classList.add('loading');

            try {
                // 检查图片是否存在
                await checkImage(imageUrl);
                
                // 如果图片已经缓存，立即显示
                if (imageCache.has(imageUrl)) {
                    img.src = imageUrl;
                    container.classList.remove('loading');
                    return { status: 'fulfilled', url: imageUrl };
                }
                
                // 创建新图片对象进行预加载
                const newImg = new Image();
                await new Promise((resolve, reject) => {
                    newImg.onload = resolve;
                    newImg.onerror = reject;
                    newImg.src = imageUrl;
                });
                
                // 预加载完成后更新显示
                img.src = imageUrl;
                return { status: 'fulfilled', url: imageUrl };
                
            } catch (error) {
                console.log('图片加载失败:', imageUrl);
                
                // WebP加载失败时的处理
                console.log('WebP图片加载失败:', imageUrl);
                
                // 最终降级处理
                if (view === 'side' && currentSrc && !currentSrc.includes('images/')) {
                    // 保持当前图片不变
                } else {
                    // 使用默认WebP图片
                    const defaultUrl = `images/平板台面-亚马逊蓝${view === 'side' ? '-侧视图' : ''}.webp`;
                    img.src = defaultUrl;
                }
                return { status: 'rejected', url: imageUrl, error };
            } finally {
                container.classList.remove('loading');
            }
        });

        const results = await Promise.allSettled(updatePromises);
        
        // 记录加载结果用于调试
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn('图片加载失败:', result.reason);
            }
        });
    }

    // 图片点击放大
    imageContainers.forEach(container => {
        container.addEventListener('click', () => {
            const img = container.querySelector('.preview-image');
            modalImage.src = img.src;
            modal.classList.add('show');
        });
    });

    // 关闭模态框
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });

    // 初始化图片
    updateImages();
    
    // 使用requestIdleCallback在空闲时预加载图片
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            preloadProductImages(currentProduct);
        }, { timeout: 1000 });
    } else {
        setTimeout(() => {
            preloadProductImages(currentProduct);
        }, 500);
    }

    // 优化的数据清理
    const adminKeys = ['adminImages', 'adminFavicon', 'adminUser', 'adminProducts', 'adminColors', 'adminSettings'];
    adminKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
    
    // 实现激进的图片懒加载和优化
    function initImageOptimization() {
        // 1. 只预加载当前显示的图片
        const currentImages = document.querySelectorAll('.preview-image');
        currentImages.forEach(img => {
            // 添加低质量占位符
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s ease';
            
            img.onload = () => {
                img.style.filter = 'none';
            };
        });

        // 2. 延迟预加载非关键资源
        setTimeout(() => {
            preloadProductImages(currentProduct);
        }, 2000); // 延迟2秒预加载

        // 3. 网络感知预加载
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === '4g' && !connection.saveData) {
                // 只在4G且未开启省流量模式时预加载
                setTimeout(() => {
                    preloadProductImages(currentProduct);
                }, 1000);
            }
        }
    }
    
    // 启用图片优化
    initImageOptimization();
}); 