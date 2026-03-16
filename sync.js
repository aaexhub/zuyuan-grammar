// 祖源语法练习 - GitHub Gist 跨平台同步系统
// 简化版：使用GitHub Gist存储进度

let currentGistId = null;
let syncEnabled = false;

// 初始化同步系统
function initSyncSystem() {
    const savedGistId = localStorage.getItem('grammar_gist_id');
    const savedSyncEnabled = localStorage.getItem('grammar_sync_enabled') === 'true';
    
    if (savedGistId && savedSyncEnabled) {
        currentGistId = savedGistId;
        syncEnabled = true;
        updateSyncUI();
        // 自动同步
        syncFromGist();
    } else {
        updateSyncUI();
    }
}

// 创建新账号（创建新Gist）
async function createAccount() {
    const username = prompt('请输入用户名（建议使用：zuyuan）:');
    
    if (!username || username.trim() === '') {
        alert('用户名不能为空');
        return;
    }
    
    const trimmedUsername = username.trim().toLowerCase();
    
    // 保存用户名
    localStorage.setItem('grammar_username', trimmedUsername);
    
    // 提示用户创建Gist
    alert(`即将创建GitHub Gist来存储您的进度。\n\n请按以下步骤操作：\n\n1. 点击"确定"后会打开GitHub Gist页面\n2. 在Gist中输入以下内容：\n\n{\n  "username": "${trimmedUsername}",\n  "progress": {},\n  "lastUpdate": "${new Date().toISOString()}"\n}\n\n3. 点击"Create secret gist"\n4. 复制Gist URL中的ID（类似：abc123def456）\n5. 回到此页面，点击"登录"输入Gist ID`);
    
    // 打开GitHub Gist创建页面
    window.open('https://gist.github.com/', '_blank');
}

// 登录（输入Gist ID）
async function login() {
    const gistId = prompt('请输入GitHub Gist ID:\n\n（类似：abc123def456）');
    
    if (!gistId || gistId.trim() === '') {
        alert('Gist ID不能为空');
        return;
    }
    
    currentGistId = gistId.trim();
    syncEnabled = true;
    
    // 保存到本地
    localStorage.setItem('grammar_gist_id', currentGistId);
    localStorage.setItem('grammar_sync_enabled', 'true');
    
    // 从Gist同步
    await syncFromGist();
    
    updateSyncUI();
}

// 登出
function logout() {
    const confirm = window.confirm('确定要登出吗？本地数据将保留，但不会同步到云端。');
    if (!confirm) return;
    
    currentGistId = null;
    syncEnabled = false;
    
    localStorage.removeItem('grammar_gist_id');
    localStorage.removeItem('grammar_sync_enabled');
    
    updateSyncUI();
}

// 从Gist同步（模拟 - 实际需要GitHub API或手动导出/导入）
async function syncFromGist() {
    if (!syncEnabled || !currentGistId) return;
    
    // 由于浏览器CORS限制，无法直接访问GitHub API
    // 这里提供手动同步方案
    
    const choice = window.confirm(`检测到您已登录Gist ID: ${currentGistId}\n\n是否从云端同步数据？\n\n点击"确定"：手动粘贴云端数据\n点击"取消"：使用本地数据`);
    
    if (choice) {
        const cloudData = prompt('请打开您的GitHub Gist，复制JSON数据并粘贴到此处：');
        
        if (cloudData) {
            try {
                const data = JSON.parse(cloudData);
                localStorage.setItem('grammarData', JSON.stringify(data));
                alert('✅ 数据同步成功！');
                
                // 刷新界面
                if (typeof updateStats === 'function') {
                    updateStats();
                }
            } catch (e) {
                alert('❌ 数据格式错误，请检查JSON格式');
            }
        }
    }
}

// 保存到Gist（导出数据供用户复制）
function saveToGist() {
    if (!syncEnabled || !currentGistId) return;
    
    const data = getStorageData();
    data.lastUpdate = new Date().toISOString();
    
    const jsonData = JSON.stringify(data, null, 2);
    
    const choice = window.confirm(`数据已准备好同步！\n\n点击"确定"：复制数据到剪贴板\n点击"取消"：取消操作`);
    
    if (choice) {
        // 复制到剪贴板
        navigator.clipboard.writeText(jsonData).then(() => {
            alert(`✅ 数据已复制到剪贴板！\n\n请按以下步骤更新Gist：\n\n1. 打开您的GitHub Gist\n2. 粘贴数据并保存\n3. 同步完成！\n\nGist地址：https://gist.github.com/${currentGistId}`);
        }).catch(() => {
            // 降级方案：显示数据供手动复制
            prompt('请复制以下数据并保存到您的GitHub Gist：', jsonData);
        });
    }
}

// 自动同步（每完成一题后调用）
function autoSync() {
    if (!syncEnabled || !currentGistId) return;
    
    // 提示用户手动同步
    const choice = window.confirm('题目已完成！是否同步到云端？\n\n点击"确定"：同步数据\n点击"取消"：稍后同步');
    
    if (choice) {
        saveToGist();
    }
}

// 更新同步界面
function updateSyncUI() {
    const syncStatus = document.getElementById('syncStatus');
    const syncUsername = document.getElementById('syncUsername');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const syncNowBtn = document.getElementById('syncNowBtn');
    
    if (syncEnabled && currentGistId) {
        const username = localStorage.getItem('grammar_username') || 'user';
        syncStatus.textContent = '已登录';
        syncStatus.style.color = '#28a745';
        syncUsername.textContent = `(${username})`;
        syncUsername.style.display = 'inline';
        
        loginBtn.style.display = 'none';
        createAccountBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        if (syncNowBtn) syncNowBtn.style.display = 'inline-block';
    } else {
        syncStatus.textContent = '未登录';
        syncStatus.style.color = '#6c757d';
        syncUsername.style.display = 'none';
        
        loginBtn.style.display = 'inline-block';
        createAccountBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        if (syncNowBtn) syncNowBtn.style.display = 'none';
    }
}

// 立即同步
function syncNow() {
    if (!syncEnabled || !currentGistId) {
        alert('请先登录');
        return;
    }
    
    const choice = window.confirm('请选择操作：\n\n点击"确定"：上传数据到云端\n点击"取消"：从云端下载数据');
    
    if (choice) {
        saveToGist();
    } else {
        syncFromGist();
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，等待主程序加载完成
    setTimeout(() => {
        initSyncSystem();
    }, 500);
});

console.log('✅ 祖源语法练习GitHub Gist同步系统已加载');
