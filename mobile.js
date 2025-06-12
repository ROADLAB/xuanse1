document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const productNav = document.querySelector('.product-nav');
    const colorNav = document.querySelector('.color-nav');
    const imageContainers = document.querySelectorAll('.image-container');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeButton = document.querySelector('.close-button');

    // 图片缓存对象
    const imageCache = {};

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
        'sink': ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white']
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

    // 检查图片是否存在
    function checkImage(url) {
        return new Promise((resolve, reject) => {
            if (imageCache[url]) {
                resolve(url);
                return;
            }

            const img = new Image();
            img.onload = () => {
                imageCache[url] = true;
                resolve(url);
            };
            img.onerror = () => {
                reject(new Error('Image not found'));
            };
            img.src = url;
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

    // 更新图片
    async function updateImages() {
        for (const container of imageContainers) {
            const view = container.dataset.view;
            const img = container.querySelector('.preview-image');
            
            // 构建图片URL
            const productName = productNames[currentProduct];
            const colorName = colorNames[currentColor];
            const imageUrl = `images/${encodeURIComponent(productName)}${encodeURIComponent('-' + colorName)}${encodeURIComponent(view === 'side' ? '-侧视图' : '')}.jpg`;

            // 添加加载状态
            container.classList.add('loading');

            try {
                // 清除之前的src，确保重新加载
                img.src = '';
                
                // 检查图片是否存在
                await checkImage(imageUrl);
                img.src = imageUrl;
            } catch (error) {
                console.log('图片不存在:', imageUrl);
                // 无论是正视图还是侧视图，如果图片不存在就显示默认图片
                img.src = 'lab-image.jpg';
            } finally {
                container.classList.remove('loading');
            }
        }
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
            // 清除图片缓存
            imageCache = {};
        } else if (isColor) {
            currentColor = button.dataset.color;
            colorNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            // 清除图片缓存
            imageCache = {};
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
}); 