// 管理后台主要功能
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        
        // 初始化数据
        this.initializeData();
        
        // 绑定事件
        this.bindEvents();
        
        // 检查登录状态
        this.checkLoginStatus();
    }

    // 初始化默认数据
    initializeData() {
        // 图片数据 - 存储自定义上传的图片
        if (!localStorage.getItem('adminImages')) {
            localStorage.setItem('adminImages', JSON.stringify({}));
        }

        // 产品数据
        if (!localStorage.getItem('adminProducts')) {
            const defaultProducts = [
                {
                    id: 'flat',
                    name: '平板台面',
                    code: 'flat',
                    colors: ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white', 'yellow'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'groove',
                    name: '单边凹槽阻水台面',
                    code: 'groove',
                    colors: ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'dish',
                    name: '碟型台面',
                    code: 'dish',
                    colors: ['amazon', 'black', 'grey', 'purple', 'agate', 'orange', 'green', 'white', 'yellow'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sink',
                    name: '碟型沥水槽台面',
                    code: 'sink',
                    colors: ['amazon', 'black', 'grey', 'purple', 'agate', 'green', 'white', 'yellow'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'bidirectional',
                    name: '双向导流防滑沥水槽台面（肩并肩）',
                    code: 'bidirectional',
                    colors: ['amazon', 'grey'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'face_to_face',
                    name: '双向导流防滑沥水槽台面（面对面）',
                    code: 'face_to_face',
                    colors: ['amazon', 'grey'],
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
        }

        // 颜色数据
        if (!localStorage.getItem('adminColors')) {
            const defaultColors = [
                {
                    id: 'amazon',
                    name: '亚马逊蓝',
                    code: 'amazon',
                    hex: '#1e88e5',
                    status: 'active'
                },
                {
                    id: 'black',
                    name: '睿智经典黑',
                    code: 'black',
                    hex: '#2c2c2c',
                    status: 'active'
                },
                {
                    id: 'grey',
                    name: '博雅斑点灰',
                    code: 'grey',
                    hex: '#757575',
                    status: 'active'
                },
                {
                    id: 'purple',
                    name: '皇家紫罗兰',
                    code: 'purple',
                    hex: '#7b1fa2',
                    status: 'active'
                },
                {
                    id: 'agate',
                    name: '德国玛瑙灰',
                    code: 'agate',
                    hex: '#5d4037',
                    status: 'active'
                },
                {
                    id: 'orange',
                    name: '爱马仕橙',
                    code: 'orange',
                    hex: '#ff6f00',
                    status: 'active'
                },
                {
                    id: 'green',
                    name: '罗马青瓷绿',
                    code: 'green',
                    hex: '#2e7d32',
                    status: 'active'
                },
                {
                    id: 'white',
                    name: '希腊沙滩白',
                    code: 'white',
                    hex: '#fafafa',
                    status: 'active'
                },
                {
                    id: 'yellow',
                    name: '冬日暖意黄',
                    code: 'yellow',
                    hex: '#fbc02d',
                    status: 'active'
                }
            ];
            localStorage.setItem('adminColors', JSON.stringify(defaultColors));
        }

        // 系统设置
        if (!localStorage.getItem('adminSettings')) {
            const defaultSettings = {
                siteTitle: '榕德实验室台面台面配色方案',
                siteDescription: '实验室台面产品展示与颜色选择',
                autoSave: true,
                imagePreload: true,
                visitCount: 1234,
                favicon: 'favicon.svg' // 默认favicon
            };
            localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
        }

        // Favicon数据
        if (!localStorage.getItem('adminFavicon')) {
            localStorage.setItem('adminFavicon', 'favicon.svg');
        }
    }

    // 绑定事件
    bindEvents() {
        // 登录表单
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 退出登录
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 侧边栏切换
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // 导航菜单
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage(item.dataset.page);
            });
        });

        // 产品管理相关
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // 颜色管理相关
        const addColorBtn = document.getElementById('addColorBtn');
        if (addColorBtn) {
            addColorBtn.addEventListener('click', () => this.showAddColorModal());
        }

        // 图片管理相关
        const uploadImageBtn = document.getElementById('uploadImageBtn');
        if (uploadImageBtn) {
            uploadImageBtn.addEventListener('click', () => this.showUploadImageModal());
        }

        const productFilter = document.getElementById('productFilter');
        const colorFilter = document.getElementById('colorFilter');
        if (productFilter && colorFilter) {
            productFilter.addEventListener('change', () => this.filterImages());
            colorFilter.addEventListener('change', () => this.filterImages());
        }

        // 模态框相关
        const modal = document.getElementById('modal');
        const modalClose = document.querySelector('.modal-close');
        const modalCancel = document.getElementById('modalCancel');
        const modalSave = document.getElementById('modalSave');

        if (modalClose) modalClose.addEventListener('click', () => this.hideModal());
        if (modalCancel) modalCancel.addEventListener('click', () => this.hideModal());
        if (modalSave) modalSave.addEventListener('click', () => this.saveModal());

        // 点击模态框外部关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Favicon 相关事件
        const faviconUpload = document.getElementById('faviconUpload');
        const resetFavicon = document.getElementById('resetFavicon');

        if (faviconUpload) {
            faviconUpload.addEventListener('change', (e) => this.handleFaviconUpload(e));
        }

        if (resetFavicon) {
            resetFavicon.addEventListener('click', () => this.resetFavicon());
        }

        // 保存设置按钮
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
    }

    // 检查登录状态
    checkLoginStatus() {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showAdminPanel();
        } else {
            this.showLoginPage();
        }
    }

    // 处理登录
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // 表单验证
        if (!username || !password) {
            this.showAlert('请输入用户名和密码', 'warning');
            return;
        }

        // 显示登录中状态
        const loginBtn = e.target.querySelector('button[type="submit"]');
        if (loginBtn) {
            const originalContent = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
            loginBtn.disabled = true;
            
            // 模拟登录延迟
            setTimeout(() => {
                // 简单的登录验证（实际项目中应该使用后端验证）
                if (username === 'admin' && password === '123456') {
                    this.currentUser = {
                        id: 1,
                        username: 'admin',
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('adminUser', JSON.stringify(this.currentUser));
                    
                    // 恢复按钮状态
                    loginBtn.innerHTML = originalContent;
                    loginBtn.disabled = false;
                    
                    // 显示成功消息并跳转
                    this.showAlert('登录成功！正在进入管理后台...', 'success');
                    
                    setTimeout(() => {
                        this.showAdminPanel();
                    }, 1000);
                    
                } else {
                    // 恢复按钮状态
                    loginBtn.innerHTML = originalContent;
                    loginBtn.disabled = false;
                    
                    this.showAlert('用户名或密码错误，请检查后重试', 'error');
                    
                    // 清空密码字段
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();
                }
            }, 1200); // 1.2秒延迟，模拟服务器验证
        }
    }

    // 处理退出登录
    handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('adminUser');
            this.currentUser = null;
            this.showLoginPage();
        }
    }

    // 显示登录页面
    showLoginPage() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    // 显示管理后台
    showAdminPanel() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        this.loadDashboard();
        this.loadProducts();
        this.loadColors();
        this.loadImages();
        this.loadSettings();
    }

    // 切换页面
    switchPage(pageName) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // 更新页面标题
        const titles = {
            dashboard: '仪表板',
            products: '产品管理',
            colors: '颜色管理',
            images: '图片管理',
            settings: '系统设置'
        };
        document.getElementById('pageTitle').textContent = titles[pageName];

        // 显示对应页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageName}Page`).classList.add('active');

        this.currentPage = pageName;

        // 如果切换到图片管理页面，刷新图片筛选器
        if (pageName === 'images') {
            this.updateImageFilters();
        }
    }

    // 切换侧边栏
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
    }

    // 加载仪表板数据
    loadDashboard() {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};

        // 计算图片数量
        let imageCount = 0;
        products.forEach(product => {
            imageCount += product.colors.length * 2; // 每个产品颜色组合有2张图片
        });

        document.getElementById('productCount').textContent = products.length;
        document.getElementById('colorCount').textContent = colors.length;
        document.getElementById('imageCount').textContent = imageCount;
        document.getElementById('visitCount').textContent = settings.visitCount || 0;
    }

    // 加载产品列表
    loadProducts() {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const tbody = document.getElementById('productsTableBody');
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.code}</td>
                <td>${product.colors.length}</td>
                <td>
                    <span class="status-badge ${product.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${product.status === 'active' ? '启用' : '禁用'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary" onclick="adminSystem.editProduct('${product.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="adminSystem.deleteProduct('${product.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 加载颜色列表
    loadColors() {
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        const container = document.getElementById('colorsGrid');
        
        container.innerHTML = colors.map(color => `
            <div class="color-card">
                <div class="color-preview" style="background-color: ${color.hex}"></div>
                <div class="color-info">
                    <h4>${color.name}</h4>
                    <p>代码: ${color.code}</p>
                    <p>色值: ${color.hex}</p>
                    <div class="color-actions">
                        <button class="btn btn-primary" onclick="adminSystem.editColor('${color.id}')">编辑</button>
                        <button class="btn btn-danger" onclick="adminSystem.deleteColor('${color.id}')">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 加载图片列表
    loadImages() {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        const customImages = JSON.parse(localStorage.getItem('adminImages')) || {};
        const container = document.getElementById('imagesGrid');
        
        const colorMap = {};
        colors.forEach(color => {
            colorMap[color.code] = color.name;
        });

        let images = [];
        products.forEach(product => {
            product.colors.forEach(colorCode => {
                const colorName = colorMap[colorCode] || colorCode;
                
                // 正视图
                const frontImageId = `${product.code}-${colorCode}-front`;
                const frontImagePath = customImages[frontImageId] || `images/${product.name}-${colorName}.jpg`;
                images.push({
                    id: frontImageId,
                    productCode: product.code,
                    productName: product.name,
                    colorCode: colorCode,
                    colorName: colorName,
                    type: '正视图',
                    filename: `${product.name}-${colorName}.jpg`,
                    path: frontImagePath,
                    isCustom: !!customImages[frontImageId]
                });
                
                // 侧视图
                const sideImageId = `${product.code}-${colorCode}-side`;
                const sideImagePath = customImages[sideImageId] || `images/${product.name}-${colorName}-侧视图.jpg`;
                images.push({
                    id: sideImageId,
                    productCode: product.code,
                    productName: product.name,
                    colorCode: colorCode,
                    colorName: colorName,
                    type: '侧视图',
                    filename: `${product.name}-${colorName}-侧视图.jpg`,
                    path: sideImagePath,
                    isCustom: !!customImages[sideImageId]
                });
            });
        });

        container.innerHTML = images.map(image => `
            <div class="image-card" data-product="${image.productName}" data-color="${image.colorName}">
                <div class="image-preview-container">
                    <img src="${image.path}" alt="${image.filename}" class="image-preview" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTIwIDk1SDE1MFY2MFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+'">
                    ${image.isCustom ? '<div class="custom-badge">自定义</div>' : ''}
                </div>
                <div class="image-info">
                    <h5>${image.productName} - ${image.colorName}</h5>
                    <p>${image.type}</p>
                    <div class="image-actions">
                        <button class="btn btn-primary" onclick="adminSystem.previewImage('${image.path}')">预览</button>
                        <button class="btn btn-secondary" onclick="adminSystem.replaceImage('${image.id}')">替换</button>
                        ${image.isCustom ? `<button class="btn btn-warning" onclick="adminSystem.resetImage('${image.id}')">重置</button>` : ''}
                        <button class="btn btn-danger" onclick="adminSystem.deleteImage('${image.id}')">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 更新图片筛选器
    updateImageFilters() {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        
        const productFilter = document.getElementById('productFilter');
        const colorFilter = document.getElementById('colorFilter');

        if (productFilter) {
            productFilter.innerHTML = '<option value="">全部产品</option>' +
                products.map(product => `<option value="${product.name}">${product.name}</option>`).join('');
        }

        if (colorFilter) {
            colorFilter.innerHTML = '<option value="">全部颜色</option>' +
                colors.map(color => `<option value="${color.name}">${color.name}</option>`).join('');
        }
    }

    // 筛选图片
    filterImages() {
        const productFilter = document.getElementById('productFilter').value;
        const colorFilter = document.getElementById('colorFilter').value;
        const imageCards = document.querySelectorAll('.image-card');

        imageCards.forEach(card => {
            const productMatch = !productFilter || card.dataset.product === productFilter;
            const colorMatch = !colorFilter || card.dataset.color === colorFilter;
            
            if (productMatch && colorMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 加载设置
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
        const currentFavicon = localStorage.getItem('adminFavicon') || 'favicon.svg';
        
        document.getElementById('siteTitle').value = settings.siteTitle || '';
        document.getElementById('siteDescription').value = settings.siteDescription || '';
        document.getElementById('autoSave').checked = settings.autoSave || false;
        document.getElementById('imagePreload').checked = settings.imagePreload || false;

        // 更新favicon预览
        const faviconPreview = document.getElementById('faviconPreview');
        if (faviconPreview) {
            faviconPreview.src = currentFavicon;
        }
    }

    // 显示添加产品模态框
    showAddProductModal() {
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        
        document.getElementById('modalTitle').textContent = '添加产品';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label for="productName">产品名称</label>
                <input type="text" id="productName" required>
            </div>
            <div class="form-group">
                <label for="productCode">产品代码</label>
                <input type="text" id="productCode" required>
            </div>
            <div class="form-group">
                <label>可用颜色</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${colors.map(color => `
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" value="${color.code}" class="product-color-checkbox">
                            <div style="width: 20px; height: 20px; border-radius: 50%; background: ${color.hex}; border: 1px solid #ddd;"></div>
                            ${color.name}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.saveProduct();
        this.showModal();
    }

    // 显示添加颜色模态框
    showAddColorModal() {
        document.getElementById('modalTitle').textContent = '添加颜色';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label for="colorName">颜色名称</label>
                <input type="text" id="colorName" required>
            </div>
            <div class="form-group">
                <label for="colorCode">颜色代码</label>
                <input type="text" id="colorCode" required>
            </div>
            <div class="form-group">
                <label for="colorHex">颜色值</label>
                <input type="color" id="colorHex" required>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.saveColor();
        this.showModal();
    }

    // 显示上传图片模态框
    showUploadImageModal() {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        
        document.getElementById('modalTitle').textContent = '上传图片';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label for="uploadProduct">选择产品</label>
                <select id="uploadProduct" required>
                    <option value="">请选择产品</option>
                    ${products.map(product => `<option value="${product.code}">${product.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="uploadColor">选择颜色</label>
                <select id="uploadColor" required>
                    <option value="">请选择颜色</option>
                    ${colors.map(color => `<option value="${color.code}">${color.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="uploadType">图片类型</label>
                <select id="uploadType" required>
                    <option value="front">正视图</option>
                    <option value="side">侧视图</option>
                </select>
            </div>
            <div class="form-group">
                <label for="imageFile">选择文件</label>
                <input type="file" id="imageFile" accept="image/*" required>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.uploadImage();
        this.showModal();
    }

    // 保存产品
    saveProduct() {
        const name = document.getElementById('productName').value;
        const code = document.getElementById('productCode').value;
        const colorCheckboxes = document.querySelectorAll('.product-color-checkbox:checked');
        const colors = Array.from(colorCheckboxes).map(cb => cb.value);

        if (!name || !code || colors.length === 0) {
            this.showAlert('请填写完整信息', 'error');
            return;
        }

        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        
        // 检查代码是否重复
        if (products.find(p => p.code === code)) {
            this.showAlert('产品代码已存在', 'error');
            return;
        }

        const newProduct = {
            id: code,
            name,
            code,
            colors,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        products.push(newProduct);
        localStorage.setItem('adminProducts', JSON.stringify(products));
        
        this.hideModal();
        this.loadProducts();
        this.loadDashboard();
        this.showAlert('产品添加成功', 'success');
    }

    // 保存颜色
    saveColor() {
        const name = document.getElementById('colorName').value;
        const code = document.getElementById('colorCode').value;
        const hex = document.getElementById('colorHex').value;

        if (!name || !code || !hex) {
            this.showAlert('请填写完整信息', 'error');
            return;
        }

        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        
        // 检查代码是否重复
        if (colors.find(c => c.code === code)) {
            this.showAlert('颜色代码已存在', 'error');
            return;
        }

        const newColor = {
            id: code,
            name,
            code,
            hex,
            status: 'active'
        };

        colors.push(newColor);
        localStorage.setItem('adminColors', JSON.stringify(colors));
        
        this.hideModal();
        this.loadColors();
        this.loadDashboard();
        this.showAlert('颜色添加成功', 'success');
    }

    // 上传图片
    uploadImage() {
        const product = document.getElementById('uploadProduct').value;
        const color = document.getElementById('uploadColor').value;
        const type = document.getElementById('uploadType').value;
        const file = document.getElementById('imageFile').files[0];

        if (!product || !color || !type || !file) {
            this.showAlert('请填写完整信息', 'error');
            return;
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            this.showAlert('请选择图片文件', 'error');
            return;
        }

        // 检查文件大小（限制5MB）
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('图片文件大小不能超过5MB', 'error');
            return;
        }

        const imageId = `${product}-${color}-${type}`;
        
        // 显示加载状态
        const saveBtn = document.getElementById('modalSave');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
        saveBtn.disabled = true;

        // 读取文件并转换为base64
        this.processImageFile(file, (base64Data) => {
            const customImages = JSON.parse(localStorage.getItem('adminImages')) || {};
            customImages[imageId] = base64Data;
            localStorage.setItem('adminImages', JSON.stringify(customImages));
            
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            this.hideModal();
            this.loadImages();
            this.loadDashboard();
            this.showAlert('图片上传成功', 'success');
        }, (error) => {
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            this.showAlert('图片处理失败: ' + error, 'error');
        });
    }

    // 编辑产品
    editProduct(productId) {
        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) return;

        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        
        document.getElementById('modalTitle').textContent = '编辑产品';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label for="productName">产品名称</label>
                <input type="text" id="productName" value="${product.name}" required>
            </div>
            <div class="form-group">
                <label for="productCode">产品代码</label>
                <input type="text" id="productCode" value="${product.code}" required>
            </div>
            <div class="form-group">
                <label>可用颜色</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${colors.map(color => `
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" value="${color.code}" class="product-color-checkbox" 
                                   ${product.colors.includes(color.code) ? 'checked' : ''}>
                            <div style="width: 20px; height: 20px; border-radius: 50%; background: ${color.hex}; border: 1px solid #ddd;"></div>
                            ${color.name}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="form-group">
                <label for="productStatus">状态</label>
                <select id="productStatus" required>
                    <option value="active" ${product.status === 'active' ? 'selected' : ''}>启用</option>
                    <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>禁用</option>
                </select>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.updateProduct(productId);
        this.showModal();
    }

    // 更新产品
    updateProduct(productId) {
        const name = document.getElementById('productName').value;
        const code = document.getElementById('productCode').value;
        const status = document.getElementById('productStatus').value;
        const colorCheckboxes = document.querySelectorAll('.product-color-checkbox:checked');
        const colors = Array.from(colorCheckboxes).map(cb => cb.value);

        if (!name || !code || colors.length === 0) {
            this.showAlert('请填写完整信息', 'error');
            return;
        }

        const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) return;

        products[productIndex] = {
            ...products[productIndex],
            name,
            code,
            colors,
            status,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('adminProducts', JSON.stringify(products));
        
        this.hideModal();
        this.loadProducts();
        this.loadDashboard();
        this.showAlert('产品更新成功', 'success');
    }

    // 删除产品
    deleteProduct(productId) {
        if (!confirm('确定要删除这个产品吗？此操作不可撤销。')) return;

        try {
            const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
            const productToDelete = products.find(p => p.id === productId);
            
            if (!productToDelete) {
                this.showAlert('产品不存在', 'error');
                return;
            }

            const filteredProducts = products.filter(p => p.id !== productId);
            localStorage.setItem('adminProducts', JSON.stringify(filteredProducts));
            
            this.loadProducts();
            this.loadDashboard();
            this.loadImages(); // 更新图片列表，因为产品删除了
            
            this.showAlert(`产品"${productToDelete.name}"删除成功`, 'success');
        } catch (error) {
            this.showAlert('删除产品失败: ' + error.message, 'error');
        }
    }

    // 编辑颜色
    editColor(colorId) {
        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        const color = colors.find(c => c.id === colorId);
        
        if (!color) return;

        document.getElementById('modalTitle').textContent = '编辑颜色';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label for="colorName">颜色名称</label>
                <input type="text" id="colorName" value="${color.name}" required>
            </div>
            <div class="form-group">
                <label for="colorCode">颜色代码</label>
                <input type="text" id="colorCode" value="${color.code}" required>
            </div>
            <div class="form-group">
                <label for="colorHex">颜色值</label>
                <input type="color" id="colorHex" value="${color.hex}" required>
            </div>
            <div class="form-group">
                <label for="colorStatus">状态</label>
                <select id="colorStatus" required>
                    <option value="active" ${color.status === 'active' ? 'selected' : ''}>启用</option>
                    <option value="inactive" ${color.status === 'inactive' ? 'selected' : ''}>禁用</option>
                </select>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.updateColor(colorId);
        this.showModal();
    }

    // 更新颜色
    updateColor(colorId) {
        const name = document.getElementById('colorName').value;
        const code = document.getElementById('colorCode').value;
        const hex = document.getElementById('colorHex').value;
        const status = document.getElementById('colorStatus').value;

        if (!name || !code || !hex) {
            this.showAlert('请填写完整信息', 'error');
            return;
        }

        const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
        const colorIndex = colors.findIndex(c => c.id === colorId);
        
        if (colorIndex === -1) return;

        colors[colorIndex] = {
            ...colors[colorIndex],
            name,
            code,
            hex,
            status
        };

        localStorage.setItem('adminColors', JSON.stringify(colors));
        
        this.hideModal();
        this.loadColors();
        this.loadDashboard();
        this.showAlert('颜色更新成功', 'success');
    }

    // 删除颜色
    deleteColor(colorId) {
        if (!confirm('确定要删除这个颜色吗？此操作不可撤销，使用该颜色的产品将受到影响。')) return;

        try {
            const colors = JSON.parse(localStorage.getItem('adminColors')) || [];
            const colorToDelete = colors.find(c => c.id === colorId);
            
            if (!colorToDelete) {
                this.showAlert('颜色不存在', 'error');
                return;
            }

            // 检查是否有产品在使用这个颜色
            const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
            const usingProducts = products.filter(product => 
                product.colors && product.colors.includes(colorId)
            );

            if (usingProducts.length > 0) {
                const productNames = usingProducts.map(p => p.name).join('、');
                if (!confirm(`警告：颜色"${colorToDelete.name}"正在被以下产品使用：${productNames}。删除后这些产品将无法显示该颜色。确定要继续吗？`)) {
                    return;
                }
                
                // 从产品中移除这个颜色
                products.forEach(product => {
                    if (product.colors && product.colors.includes(colorId)) {
                        product.colors = product.colors.filter(c => c !== colorId);
                    }
                });
                localStorage.setItem('adminProducts', JSON.stringify(products));
            }

            const filteredColors = colors.filter(c => c.id !== colorId);
            localStorage.setItem('adminColors', JSON.stringify(filteredColors));
            
            this.loadColors();
            this.loadDashboard();
            this.loadProducts(); // 重新加载产品列表
            this.loadImages(); // 更新图片列表
            
            this.showAlert(`颜色"${colorToDelete.name}"删除成功`, 'success');
        } catch (error) {
            this.showAlert('删除颜色失败: ' + error.message, 'error');
        }
    }

    // 预览图片
    previewImage(imagePath) {
        window.open(imagePath, '_blank');
    }

    // 替换图片
    replaceImage(imageId) {
        document.getElementById('modalTitle').textContent = '替换图片';
        document.getElementById('modalBody').innerHTML = `
            <div class="form-group">
                <label>当前图片ID: ${imageId}</label>
                <p style="color: var(--text-muted); font-size: 0.9rem;">选择新的图片文件来替换当前图片</p>
            </div>
            <div class="form-group">
                <label for="replaceImageFile">选择新图片</label>
                <input type="file" id="replaceImageFile" accept="image/*" required>
            </div>
            <div class="form-group">
                <small style="color: var(--text-muted);">
                    支持的格式：JPG、PNG、GIF、WEBP<br>
                    最大文件大小：5MB
                </small>
            </div>
        `;
        
        document.getElementById('modalSave').onclick = () => this.doReplaceImage(imageId);
        this.showModal();
    }

    // 执行图片替换
    doReplaceImage(imageId) {
        const file = document.getElementById('replaceImageFile').files[0];

        if (!file) {
            this.showAlert('请选择图片文件', 'error');
            return;
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            this.showAlert('请选择图片文件', 'error');
            return;
        }

        // 检查文件大小（限制5MB）
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('图片文件大小不能超过5MB', 'error');
            return;
        }

        // 显示加载状态
        const saveBtn = document.getElementById('modalSave');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        saveBtn.disabled = true;

        // 读取文件并转换为base64
        this.processImageFile(file, (base64Data) => {
            const customImages = JSON.parse(localStorage.getItem('adminImages')) || {};
            customImages[imageId] = base64Data;
            localStorage.setItem('adminImages', JSON.stringify(customImages));
            
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            this.hideModal();
            this.loadImages();
            this.showAlert('图片替换成功', 'success');
        }, (error) => {
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            this.showAlert('图片处理失败: ' + error, 'error');
        });
    }

    // 重置图片到默认
    resetImage(imageId) {
        if (!confirm('确定要重置这张图片到默认状态吗？')) return;

        const customImages = JSON.parse(localStorage.getItem('adminImages')) || {};
        delete customImages[imageId];
        localStorage.setItem('adminImages', JSON.stringify(customImages));
        
        this.loadImages();
        this.showAlert('图片已重置到默认状态', 'success');
    }

    // 删除自定义图片
    deleteImage(imageId) {
        if (!confirm('确定要删除这张自定义图片吗？')) return;

        const customImages = JSON.parse(localStorage.getItem('adminImages')) || {};
        if (customImages[imageId]) {
            delete customImages[imageId];
            localStorage.setItem('adminImages', JSON.stringify(customImages));
            this.loadImages();
            this.showAlert('自定义图片已删除', 'success');
        } else {
            this.showAlert('这是默认图片，无法删除', 'warning');
        }
    }

    // 显示模态框
    showModal() {
        document.getElementById('modal').classList.add('show');
    }

    // 隐藏模态框
    hideModal() {
        document.getElementById('modal').classList.remove('show');
    }

    // 保存模态框（占位符）
    saveModal() {
        // 具体实现在各个功能中定义
    }

    // 处理图片文件
    processImageFile(file, successCallback, errorCallback) {
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            // 创建canvas进行图片压缩和优化
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // 计算压缩后的尺寸（最大1200px）
                            let { width, height } = img;
                            const maxSize = 1200;
                            
                            if (width > maxSize || height > maxSize) {
                                if (width > height) {
                                    height = (height * maxSize) / width;
                                    width = maxSize;
                                } else {
                                    width = (width * maxSize) / height;
                                    height = maxSize;
                                }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            
                            // 绘制并压缩图片
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, width, height);
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // 转换为base64，质量为0.85
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                            successCallback(compressedBase64);
                            
                        } catch (error) {
                            errorCallback('图片处理失败: ' + error.message);
                        }
                    };
                    
                    img.onerror = () => {
                        errorCallback('无法加载图片文件');
                    };
                    
                    img.src = e.target.result;
                    
                } catch (error) {
                    errorCallback('读取图片数据失败: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                errorCallback('文件读取失败');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            errorCallback('文件处理失败: ' + error.message);
        }
    }

    // 处理favicon上传
    handleFaviconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        const allowedTypes = ['image/png', 'image/x-icon', 'image/svg+xml', 'image/jpeg', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            this.showAlert('请选择 PNG、ICO、SVG、JPG 或 GIF 格式的图标文件', 'error');
            event.target.value = '';
            return;
        }

        // 检查文件大小（限制1MB）
        if (file.size > 1024 * 1024) {
            this.showAlert('图标文件大小不能超过1MB', 'error');
            event.target.value = '';
            return;
        }

        // 处理文件
        this.processFaviconFile(file, (base64Data) => {
            // 保存favicon
            localStorage.setItem('adminFavicon', base64Data);
            
            // 更新预览
            const faviconPreview = document.getElementById('faviconPreview');
            if (faviconPreview) {
                faviconPreview.src = base64Data;
            }
            
            // 更新页面favicon
            this.updatePageFavicon(base64Data);
            
            this.showAlert('网站图标更新成功', 'success');
            
            // 清空文件输入
            event.target.value = '';
        }, (error) => {
            this.showAlert('图标处理失败: ' + error, 'error');
            event.target.value = '';
        });
    }

    // 处理favicon文件
    processFaviconFile(file, successCallback, errorCallback) {
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // 如果是SVG文件，直接使用
                    if (file.type === 'image/svg+xml') {
                        successCallback(e.target.result);
                        return;
                    }
                    
                    // 对于其他格式，创建图片进行处理
                    const img = new Image();
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // 设置canvas尺寸为32x32
                            canvas.width = 32;
                            canvas.height = 32;
                            
                            // 绘制图片
                            ctx.drawImage(img, 0, 0, 32, 32);
                            
                            // 转换为base64
                            const base64Data = canvas.toDataURL('image/png', 0.9);
                            successCallback(base64Data);
                            
                        } catch (error) {
                            errorCallback('图标处理失败: ' + error.message);
                        }
                    };
                    
                    img.onerror = () => {
                        errorCallback('无法加载图标文件');
                    };
                    
                    img.src = e.target.result;
                    
                } catch (error) {
                    errorCallback('读取图标数据失败: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                errorCallback('文件读取失败');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            errorCallback('文件处理失败: ' + error.message);
        }
    }

    // 重置favicon到默认
    resetFavicon() {
        if (!confirm('确定要重置网站图标到默认状态吗？')) return;

        const defaultFavicon = 'favicon.svg';
        
        // 重置存储
        localStorage.setItem('adminFavicon', defaultFavicon);
        
        // 更新预览
        const faviconPreview = document.getElementById('faviconPreview');
        if (faviconPreview) {
            faviconPreview.src = defaultFavicon;
        }
        
        // 更新页面favicon
        this.updatePageFavicon(defaultFavicon);
        
        this.showAlert('网站图标已重置到默认状态', 'success');
    }

    // 更新页面favicon
    updatePageFavicon(faviconUrl) {
        // 更新当前页面的favicon
        const faviconLinks = [
            document.getElementById('favicon-link'),
            document.getElementById('favicon-fallback'),
            document.getElementById('favicon-apple')
        ];

        faviconLinks.forEach(link => {
            if (link) {
                link.href = faviconUrl;
            }
        });

        // 为了确保favicon立即更新，强制浏览器重新加载
        setTimeout(() => {
            faviconLinks.forEach(link => {
                if (link && link.parentNode) {
                    const newLink = link.cloneNode();
                    newLink.href = faviconUrl + '?v=' + Date.now();
                    link.parentNode.replaceChild(newLink, link);
                }
            });
        }, 100);
    }

    // 保存设置
    saveSettings() {
        try {
            // 显示加载状态
            const saveBtn = document.getElementById('saveSettingsBtn');
            if (saveBtn) {
                const originalContent = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
                saveBtn.disabled = true;
                
                // 模拟保存延迟，让用户看到加载状态
                setTimeout(() => {
                    try {
                        // 获取表单数据
                        const siteTitle = document.getElementById('siteTitle').value.trim();
                        const siteDescription = document.getElementById('siteDescription').value.trim();
                        const autoSave = document.getElementById('autoSave').checked;
                        const imagePreload = document.getElementById('imagePreload').checked;

                        // 验证数据
                        if (!siteTitle) {
                            throw new Error('网站标题不能为空');
                        }

                        if (!siteDescription) {
                            throw new Error('网站描述不能为空');
                        }

                        if (siteTitle.length > 100) {
                            throw new Error('网站标题不能超过100个字符');
                        }

                        if (siteDescription.length > 500) {
                            throw new Error('网站描述不能超过500个字符');
                        }

                        // 保存数据到localStorage
                        const settings = {
                            siteTitle: siteTitle,
                            siteDescription: siteDescription,
                            autoSave: autoSave,
                            imagePreload: imagePreload,
                            favicon: localStorage.getItem('adminFavicon') || 'favicon.svg',
                            visitCount: JSON.parse(localStorage.getItem('adminSettings') || '{}').visitCount || 0,
                            lastModified: new Date().toISOString()
                        };

                        localStorage.setItem('adminSettings', JSON.stringify(settings));

                        // 恢复按钮状态
                        saveBtn.innerHTML = originalContent;
                        saveBtn.disabled = false;

                        // 显示成功提示
                        this.showAlert('设置保存成功！', 'success');

                        // 更新页面标题（如果当前页面是管理后台）
                        if (document.title.includes('管理后台')) {
                            document.title = `管理后台 - ${siteTitle}`;
                        }

                    } catch (error) {
                        // 恢复按钮状态
                        saveBtn.innerHTML = originalContent;
                        saveBtn.disabled = false;

                        // 显示错误提示
                        this.showAlert(error.message || '保存设置时发生错误', 'error');
                    }
                }, 800); // 800ms延迟，让用户看到保存中状态
            }

        } catch (error) {
            this.showAlert('保存设置失败: ' + error.message, 'error');
        }
    }

    // 显示提示信息
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // 确定插入位置
        let container = document.querySelector('.content');
        
        // 如果在登录页面，使用登录容器
        if (!container) {
            const loginBox = document.querySelector('.login-box');
            if (loginBox) {
                container = loginBox;
            } else {
                container = document.body;
            }
        }
        
        if (container) {
            // 如果是登录页面，插入到登录表单前面
            if (container.classList.contains('login-box')) {
                const loginForm = container.querySelector('.login-form');
                if (loginForm) {
                    container.insertBefore(alert, loginForm);
                } else {
                    container.appendChild(alert);
                }
            } else {
                // 管理后台页面，插入到顶部
                container.insertBefore(alert, container.firstChild);
            }
            
            // 添加淡入动画
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            alert.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                alert.style.opacity = '1';
                alert.style.transform = 'translateY(0)';
            }, 10);
            
            // 3.5秒后自动消失
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.opacity = '0';
                    alert.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (alert.parentNode) {
                            alert.parentNode.removeChild(alert);
                        }
                    }, 300);
                }
            }, 3500);
        }
    }
}

// 初始化系统
let adminSystem;
document.addEventListener('DOMContentLoaded', function() {
    adminSystem = new AdminSystem();
});

// 全局函数，供HTML调用
window.adminSystem = adminSystem;
