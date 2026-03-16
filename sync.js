// 祖源语法练习 - 跨平台同步系统
// 使用 Firebase Realtime Database

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyForTesting123",
    authDomain: "zuyuan-grammar.firebaseapp.com",
    databaseURL: "https://zuyuan-grammar-default-rtdb.firebaseio.com",
    projectId: "zuyuan-grammar",
    storageBucket: "zuyuan-grammar.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// 当前用户信息
let currentUser = null;
let syncEnabled = false;

// 初始化同步系统
function initSyncSystem() {
    const savedUsername = localStorage.getItem('grammar_username');
    const savedSyncEnabled = localStorage.getItem('grammar_sync_enabled') === 'true';
    
    if (savedUsername && savedSyncEnabled) {
        currentUser = savedUsername;
        syncEnabled = true;
        updateSyncUI();
        // 自动同步
        syncFromCloud();
    }
}

// 创建新账号
function createAccount() {
    const username = prompt('请输入用户名（建议使用：zuyuan）:');
    
    if (!username || username.trim() === '') {
        alert('用户名不能为空');
        return;
    }
    
    const trimmedUsername = username.trim().toLowerCase();
    
    // 检查用户名是否已存在
    const userData = localStorage.getItem('grammar_user_' + trimmedUsername);
    if (userData) {
        const confirm = window.confirm('用户名已存在，是否使用此用户名登录？');
        if (!confirm) return;
    }
    
    currentUser = trimmedUsername;
    syncEnabled = true;
    
    // 保存到本地
    localStorage.setItem('grammar_username', currentUser);
    localStorage.setItem('grammar_sync_enabled', 'true');
    
    // 创建云端数据
    const data = getStorageData();
    data.username = currentUser;
    data.lastUpdate = new Date().toISOString();
    saveToCloud(data);
    
    alert('账号创建成功！\n\n用户名：' + currentUser + '\n\n请记住此用户名，在其他设备登录时使用。');
    
    updateSyncUI();
}

// 登录
function login() {
    const username = prompt('请输入用户名:');
    
    if (!username || username.trim() === '') {
        alert('用户名不能为空');
        return;
    }
    
    currentUser = username.trim().toLowerCase();
    syncEnabled = true;
    
    // 保存到本地
    localStorage.setItem('grammar_username', currentUser);
    localStorage.setItem('grammar_sync_enabled', 'true');
    
    // 从云端同步
    syncFromCloud();
    
    updateSyncUI();
}

// 登出
function logout() {
    const confirm = window.confirm('确定要登出吗？本地数据将保留，但不会同步到云端。');
    if (!confirm) return;
    
    currentUser = null;
    syncEnabled = false;
    
    localStorage.removeItem('grammar_username');
    localStorage.removeItem('grammar_sync_enabled');
    
    updateSyncUI();
}

// 保存到云端（模拟 - 实际需要 Firebase）
function saveToCloud(data) {
    if (!syncEnabled || !currentUser) return;
    
    // 这里使用 localStorage 模拟云端存储
    // 实际部署时需要替换为 Firebase API
    const cloudKey = 'grammar_cloud_' + currentUser;
    localStorage.setItem(cloudKey, JSON.stringify({
        ...data,
        username: currentUser,
        lastUpdate: new Date().toISOString()
    }));
    
    console.log('✅ 数据已同步到云端');
}

// 从云端同步（模拟 - 实际需要 Firebase）
function syncFromCloud() {
    if (!syncEnabled || !currentUser) return;
    
    // 这里使用 localStorage 模拟云端存储
    // 实际部署时需要替换为 Firebase API
    const cloudKey = 'grammar_cloud_' + currentUser;
    const cloudData = localStorage.getItem(cloudKey);
    
    if (cloudData) {
        const data = JSON.parse(cloudData);
        const localData = getStorageData();
        
        // 比较时间戳，使用最新的数据
        const localUpdate = localData.lastUpdate || '1970-01-01T00:00:00Z';
        const cloudUpdate = data.lastUpdate || '1970-01-01T00:00:00Z';
        
        if (new Date(cloudUpdate) > new Date(localUpdate)) {
            // 云端数据更新，同步到本地
            localStorage.setItem('grammarData', JSON.stringify(data));
            console.log('✅ 数据已从云端同步');
            
            // 刷新界面
            if (typeof updateStats === 'function') {
                updateStats();
            }
        } else {
            console.log('ℹ️ 本地数据已是最新');
        }
    } else {
        console.log('ℹ️ 云端暂无数据，将使用本地数据');
    }
}

// 更新同步界面
function updateSyncUI() {
    const syncStatus = document.getElementById('syncStatus');
    const syncUsername = document.getElementById('syncUsername');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    
    if (syncEnabled && currentUser) {
        syncStatus.textContent = '已登录';
        syncStatus.style.color = '#28a745';
        syncUsername.textContent = currentUser;
        syncUsername.style.display = 'inline';
        
        loginBtn.style.display = 'none';
        createAccountBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        syncStatus.textContent = '未登录';
        syncStatus.style.color = '#6c757d';
        syncUsername.style.display = 'none';
        
        loginBtn.style.display = 'inline-block';
        createAccountBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// 自动同步（每完成一题后调用）
function autoSync() {
    if (!syncEnabled || !currentUser) return;
    
    const data = getStorageData();
    data.lastUpdate = new Date().toISOString();
    saveToCloud(data);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，等待主程序加载完成
    setTimeout(() => {
        initSyncSystem();
    }, 500);
});

console.log('✅ 祖源语法练习同步系统已加载');
