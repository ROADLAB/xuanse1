document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const productNav = document.querySelector('.product-nav');
    const colorNav = document.querySelector('.color-nav');
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
        'sink': '碟型沥水槽台面'
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
        'sink': ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white', 'yellow']
    };

    // 默认颜色
    const defaultColor = 'amazon';

    // 从本地存储获取保存的状态或使用默认值
    let currentProduct = localStorage.getItem('selectedProduct') || 'flat';
    let currentColor = localStorage.getItem('selectedColor') || defaultColor;

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
        if (savedColor && !savedColor.style.display) {
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

    // 预加载产品的所有颜色图片
    function preloadProductImages(product) {
        const availableColors = productAvailableColors[product];
        const productName = productNames[product];
        
        // 预加载常用颜色的图片
        const priorityColors = ['amazon', 'black', 'grey']; // 优先预加载的颜色
        const preloadPromises = [];
        
        availableColors.forEach(color => {
            const colorName = colorNames[color];
            const frontUrl = `images/${productName}-${colorName}.jpg`;
            const sideUrl = `images/${productName}-${colorName}-侧视图.jpg`;
            
            // 优先颜色立即预加载，其他颜色延迟预加载
            if (priorityColors.includes(color)) {
                preloadPromises.push(preloadImage(frontUrl));
                preloadPromises.push(preloadImage(sideUrl));
            } else {
                // 延迟预加载非优先颜色
                setTimeout(() => {
                    preloadImage(frontUrl);
                    preloadImage(sideUrl);
                }, 1000);
            }
        });
        
        return Promise.all(preloadPromises);
    }

    // 更新颜色按钮显示状态
    function updateColorButtons(productType) {
        const availableColors = productAvailableColors[productType];
        const colorButtons = colorNav.querySelectorAll('.nav-item');
        
        colorButtons.forEach(button => {
            const color = button.dataset.color;
            if (availableColors.includes(color)) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
                if (button.classList.contains('active')) {
                    // 如果当前选中的颜色不可用，切换到默认颜色
                    const defaultButton = colorNav.querySelector(`[data-color="${defaultColor}"]`);
                    defaultButton.classList.add('active');
                    currentColor = defaultColor;
                    saveSelection();
                }
            }
        });
    }

    // 更新图片 - 优化版本
    async function updateImages() {
        const productName = productNames[currentProduct];
        const colorName = colorNames[currentColor];
        
        // 并行处理两个图片容器，使用Promise.allSettled来处理可能的错误
        const updatePromises = Array.from(imageContainers).map(async (container) => {
            const view = container.dataset.view;
            const img = container.querySelector('.preview-image');
            const currentSrc = img.src;
            
            // 构建图片URL
            const imageUrl = `images/${productName}-${colorName}${view === 'side' ? '-侧视图' : ''}.jpg`;

            // 如果URL相同，跳过更新
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
                // 侧视图失败时保持当前图片，正视图失败时使用默认图片
                if (view !== 'side') {
                    img.src = 'images/平板台面-亚马逊蓝' + (view === 'side' ? '-侧视图' : '') + '.jpg';
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

    // 添加触摸事件处理
    function handleTouchStart(e) {
        e.preventDefault();
        const button = e.target.closest('.nav-item');
        if (!button) return;

        const isProduct = button.hasAttribute('data-product');
        const isColor = button.hasAttribute('data-color');

        if (isProduct) {
            currentProduct = button.dataset.product;
            productNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            currentColor = defaultColor;
            updateColorButtons(currentProduct);
            const defaultButton = colorNav.querySelector(`[data-color="${defaultColor}"]`);
            colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            defaultButton.classList.add('active');
            // 预加载新产品的常用颜色图片
            preloadProductImages(currentProduct);
        } else if (isColor) {
            currentColor = button.dataset.color;
            colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
        }

        saveSelection();
        updateImages();
    }

    // 绑定触摸事件
    productNav.addEventListener('touchstart', handleTouchStart, { passive: false });
    colorNav.addEventListener('touchstart', handleTouchStart, { passive: false });

    // 图片点击放大
    imageContainers.forEach(container => {
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const img = container.querySelector('.preview-image');
            modalImage.src = img.src;
            modal.classList.add('show');
        }, { passive: false });
    });

    // 关闭模态框
    closeButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        modal.classList.remove('show');
    }, { passive: false });

    // 点击模态框外部关闭
    modal.addEventListener('touchstart', (e) => {
        if (e.target === modal) {
            e.preventDefault();
            modal.classList.remove('show');
        }
    }, { passive: false });

    // 初始化
    restoreSelection();
    updateImages();
    
    // 初始化时预加载当前产品的图片
    preloadProductImages(currentProduct);
}); 