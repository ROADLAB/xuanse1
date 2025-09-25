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

    // 检测WebP支持
    function supportsWebP() {
        if (typeof supportsWebP.result === 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            supportsWebP.result = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
        }
        return supportsWebP.result;
    }

    // 获取优化的图片URL（支持WebP格式）
    function getImageUrl(productCode, colorCode, view) {
        try {
            const customImages = JSON.parse(localStorage.getItem('adminImages') || '{}');
            const imageId = `${productCode}-${colorCode}-${view}`;
            
            // 如果有自定义图片，验证其有效性
            if (customImages[imageId]) {
                const customUrl = customImages[imageId];
                // 验证base64数据的有效性
                if (customUrl && customUrl.startsWith('data:image/') && customUrl.length > 50) {
                    console.log(`使用自定义图片: ${imageId}`);
                    return customUrl;
                } else {
                    console.warn(`自定义图片数据损坏，删除: ${imageId}`);
                    // 删除损坏的数据
                    delete customImages[imageId];
                    localStorage.setItem('adminImages', JSON.stringify(customImages));
                }
            }
        } catch (error) {
            console.error('处理localStorage数据出错:', error);
            // 如果localStorage数据完全损坏，清理它
            localStorage.removeItem('adminImages');
        }
        
        // 使用优化的默认图片（支持WebP格式）
        const productName = productNames[productCode];
        const colorName = colorNames[colorCode];
        const extension = supportsWebP() ? 'webp' : 'jpg';
        const defaultUrl = `images/${productName}-${colorName}${view === 'side' ? '-侧视图' : ''}.${extension}`;
        console.log(`使用${supportsWebP() ? 'WebP' : 'JPEG'}格式: ${defaultUrl}`);
        return defaultUrl;
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

    // 智能预加载策略 - 基于用户行为和网络条件
    function smartPreloadImages(product) {
        const availableColors = productAvailableColors[product];
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        
        // 根据网络条件调整预加载策略
        const priorityColors = isSlowConnection ? ['amazon'] : ['amazon', 'black', 'grey']; 
        const preloadPromises = [];
        
        // 立即预加载当前选中的图片
        const currentFrontUrl = getImageUrl(product, currentColor, 'front');
        const currentSideUrl = getImageUrl(product, currentColor, 'side');
        preloadPromises.push(preloadImage(currentFrontUrl));
        preloadPromises.push(preloadImage(currentSideUrl));
        
        // 预加载优先颜色
        availableColors.forEach((color, index) => {
            if (color === currentColor) return; // 当前颜色已预加载
            
            const frontUrl = getImageUrl(product, color, 'front');
            const sideUrl = getImageUrl(product, color, 'side');
            
            if (priorityColors.includes(color)) {
                // 优先颜色延迟100ms预加载（避免阻塞当前图片）
                setTimeout(() => {
                    preloadImage(frontUrl);
                    preloadImage(sideUrl);
                }, 100 + index * 50);
            } else if (!isSlowConnection) {
                // 慢网络下跳过非优先颜色，快网络下延迟预加载
                setTimeout(() => {
                    preloadImage(frontUrl);
                    preloadImage(sideUrl);
                }, 2000 + index * 200);
            }
        });
        
        return Promise.all(preloadPromises);
    }
    
    // 预测性加载 - 根据用户行为模式
    let userBehavior = {
        colorSwitchCount: {},
        lastColors: [],
        preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
    };
    
    function recordUserBehavior(product, color) {
        const key = `${product}-${color}`;
        userBehavior.colorSwitchCount[key] = (userBehavior.colorSwitchCount[key] || 0) + 1;
        userBehavior.lastColors.push(key);
        if (userBehavior.lastColors.length > 10) {
            userBehavior.lastColors.shift();
        }
        
        // 保存用户偏好
        userBehavior.preferences[product] = color;
        localStorage.setItem('userPreferences', JSON.stringify(userBehavior.preferences));
    }
    
    function predictivePreload(product) {
        // 基于历史行为预测用户可能选择的颜色
        const availableColors = productAvailableColors[product];
        const scores = availableColors.map(color => {
            const key = `${product}-${color}`;
            const switchCount = userBehavior.colorSwitchCount[key] || 0;
            const recentUse = userBehavior.lastColors.includes(key) ? 2 : 0;
            const isPreferred = userBehavior.preferences[product] === color ? 3 : 0;
            return { color, score: switchCount + recentUse + isPreferred };
        });
        
        // 按分数排序，预加载前3个最可能的颜色
        scores.sort((a, b) => b.score - a.score);
        scores.slice(0, 3).forEach((item, index) => {
            if (item.color !== currentColor) {
                setTimeout(() => {
                    const frontUrl = getImageUrl(product, item.color, 'front');
                    const sideUrl = getImageUrl(product, item.color, 'side');
                    preloadImage(frontUrl);
                    preloadImage(sideUrl);
                }, 1000 + index * 500);
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
        
        console.log(`正在加载图片: ${currentProduct}(${productName}) - ${currentColor}(${colorName})`);
        
        // 并行处理两个图片容器，使用Promise.allSettled来处理可能的错误
        const updatePromises = Array.from(imageContainers).map(async (container) => {
            const view = container.dataset.view;
            const img = container.querySelector('.preview-image');
            const currentSrc = img.src;
            
            // 获取正确的图片URL（自定义图片优先）
            const imageUrl = getImageUrl(currentProduct, currentColor, view);
            
            console.log(`${view}视图: 目标URL = ${imageUrl}, 当前URL = ${currentSrc}`);

            // 如果新的URL与当前URL相同，则跳过
            if (currentSrc === imageUrl || (currentSrc.endsWith(imageUrl) && !imageUrl.startsWith('data:'))) {
                console.log(`${view}视图: URL相同，跳过加载`);
                return { status: 'fulfilled', url: imageUrl };
            }

            // 添加加载状态
            container.classList.add('loading');

            try {
                // 如果是base64图片（自定义上传的图片），直接显示
                if (imageUrl.startsWith('data:')) {
                    img.src = imageUrl;
                    container.classList.remove('loading');
                    return { status: 'fulfilled', url: imageUrl };
                }
                
                // 检查默认图片是否存在
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
                    img.src = getImageUrl('flat', 'amazon', view); // 使用默认图片
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

    // 添加触摸事件处理 - 集成智能预加载
    function handleTouchStart(e) {
        e.preventDefault();
        const button = e.target.closest('.nav-item');
        if (!button) return;

        const isProduct = button.hasAttribute('data-product');
        const isColor = button.hasAttribute('data-color');

        if (isProduct) {
            const newProduct = button.dataset.product;
            if (newProduct !== currentProduct) {
                currentProduct = newProduct;
                productNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                
                // 智能选择颜色：优先使用用户偏好，否则使用默认
                const preferredColor = userBehavior.preferences[currentProduct] || defaultColor;
                currentColor = productAvailableColors[currentProduct].includes(preferredColor) ? preferredColor : defaultColor;
                
                updateColorButtons(currentProduct);
                const selectedButton = colorNav.querySelector(`[data-color="${currentColor}"]`);
                colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                selectedButton.classList.add('active');
                
                // 记录用户行为
                recordUserBehavior(currentProduct, currentColor);
                
                // 使用智能预加载策略
                smartPreloadImages(currentProduct);
                
                // 启动预测性加载
                setTimeout(() => predictivePreload(currentProduct), 3000);
            }
        } else if (isColor) {
            const newColor = button.dataset.color;
            if (newColor !== currentColor) {
                currentColor = newColor;
                colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                
                // 记录用户行为
                recordUserBehavior(currentProduct, currentColor);
                
                // 预加载相邻颜色（用户可能会点击）
                const colorButtons = Array.from(colorNav.querySelectorAll('.nav-item:not([style*="display: none"])'));
                const currentIndex = colorButtons.findIndex(btn => btn.dataset.color === currentColor);
                
                // 预加载左右相邻的颜色
                [-1, 1].forEach(offset => {
                    const adjacentIndex = currentIndex + offset;
                    if (adjacentIndex >= 0 && adjacentIndex < colorButtons.length) {
                        const adjacentColor = colorButtons[adjacentIndex].dataset.color;
                        setTimeout(() => {
                            const frontUrl = getImageUrl(currentProduct, adjacentColor, 'front');
                            const sideUrl = getImageUrl(currentProduct, adjacentColor, 'side');
                            preloadImage(frontUrl);
                            preloadImage(sideUrl);
                        }, 500);
                    }
                });
            }
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
    
    // 使用智能预加载策略
    smartPreloadImages(currentProduct);
    
    // 启动预测性加载
    setTimeout(() => predictivePreload(currentProduct), 2000);

    // 加载自定义favicon（如果有的话）
    function loadCustomFavicon() {
        const customFavicon = localStorage.getItem('adminFavicon');
        if (customFavicon && customFavicon !== 'favicon.svg') {
            const faviconLinks = [
                document.getElementById('favicon-link'),
                document.getElementById('favicon-fallback'),
                document.getElementById('favicon-apple')
            ];

            faviconLinks.forEach(link => {
                if (link) {
                    link.href = customFavicon;
                }
            });
        }
    }

    // 加载自定义favicon
    loadCustomFavicon();
}); 