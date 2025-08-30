// app.js - 完全修復版
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.isGuest = false;
        this.currentUser = null;
        
        // サービスの初期化
        this.initializeServices();
        
        // DOMContentLoadedで初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    initializeServices() {
        // APIサービスが存在する場合のみ初期化
        if (typeof AICoachingService !== 'undefined') {
            this.aiService = new AICoachingService();
        }
        
        // 認証サービス
        if (typeof AuthService !== 'undefined') {
            this.authService = new AuthService();
        }
        
        // ゲームマネージャー
        if (typeof GameManager !== 'undefined') {
            this.gameManager = new GameManager();
        }
    }
    
    init() {
        console.log('App initializing...');
        
        // テーマの初期化
        this.initTheme();
        
        // ログインチェック
        this.checkAuthentication();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // ナビゲーションの初期化
        this.initNavigation();
        
        // 初期ページの表示
        this.showPage(this.currentPage);
        
        // チャートの初期化
        this.initCharts();
        
        // データのロード
        this.loadUserData();
        
        console.log('App initialized successfully');
    }
    
    // テーマ管理
    initTheme() {
        this.applyTheme(this.currentTheme);
        
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(this.currentTheme);
                localStorage.setItem('theme', this.currentTheme);
            });
        }
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        const themeBtn = document.getElementById('theme-toggle-btn');
        
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            if (themeBtn) themeBtn.textContent = '☀️';
            
            // ライトモードのスタイル
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f5f5f5');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--border-color', '#e0e0e0');
            root.style.setProperty('--accent-primary', '#0066cc');
            root.style.setProperty('--accent-secondary', '#0052a3');
        } else {
            root.setAttribute('data-theme', 'dark');
            if (themeBtn) themeBtn.textContent = '🌙';
            
            // ダークモードのスタイル
            root.style.setProperty('--bg-primary', '#1a1a2e');
            root.style.setProperty('--bg-secondary', '#16213e');
            root.style.setProperty('--bg-card', '#0f1924');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--border-color', '#2a3f5f');
            root.style.setProperty('--accent-primary', '#e94560');
            root.style.setProperty('--accent-secondary', '#c13651');
        }
    }
    
    // 認証チェック
    checkAuthentication() {
        const storedUser = sessionStorage.getItem('currentUser');
        const isGuest = sessionStorage.getItem('isGuest');
        
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateUserDisplay(this.currentUser.username);
        } else if (isGuest === 'true') {
            this.isGuest = true;
            this.updateUserDisplay('ゲストユーザー', true);
        } else {
            // ログインモーダルを表示
            this.showLoginModal();
        }
    }
    
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    updateUserDisplay(username, isGuest = false) {
        const headerUserName = document.getElementById('header-user-name');
        const userTypeIndicator = document.getElementById('user-type-indicator');
        
        if (headerUserName) {
            headerUserName.textContent = username;
        }
        
        if (userTypeIndicator) {
            userTypeIndicator.textContent = isGuest ? 'ゲスト' : 'ユーザー';
            userTypeIndicator.className = isGuest ? 'user-type guest' : 'user-type registered';
        }
    }
    
    // ナビゲーション
    initNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = btn.dataset.page;
                if (page) {
                    this.showPage(page);
                    
                    // アクティブクラスの更新
                    navBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }
    
    showPage(pageId) {
        console.log('Showing page:', pageId);
        
        // すべてのページを非表示
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // 指定されたページを表示
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // ページ固有の初期化
            this.initPageContent(pageId);
        }
    }
    
    initPageContent(pageId) {
        switch(pageId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'analysis':
                this.loadAnalysis();
                break;
            case 'goals':
                this.loadGoals();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    // イベントリスナー設定
    setupEventListeners() {
        // ログイン/登録タブ切り替え
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // ログインフォーム
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // 登録フォーム
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // ゲストボタン
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                this.handleGuestAccess();
            });
        }
        
        // ログアウトボタン
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // 試合データフォーム
        const matchForm = document.getElementById('match-form');
        if (matchForm) {
            matchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMatchSubmit();
            });
        }
        
        // 目標フォーム
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGoalSubmit();
            });
        }
        
        // API設定フォーム
        const apiForm = document.getElementById('api-form');
        if (apiForm) {
            apiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleApiSave();
            });
        }
        
        // APIキー表示トグル
        const toggleApiKey = document.getElementById('toggle-api-key');
        if (toggleApiKey) {
            toggleApiKey.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('api-key');
                if (apiKeyInput) {
                    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
                    toggleApiKey.textContent = apiKeyInput.type === 'password' ? '👁️' : '👁️‍🗨️';
                }
            });
        }
        
        // APIテストボタン
        const testApiBtn = document.getElementById('test-api-btn');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => {
                this.testApiConnection();
            });
        }
        
        // APIクリアボタン
        const clearApiBtn = document.getElementById('clear-api-btn');
        if (clearApiBtn) {
            clearApiBtn.addEventListener('click', () => {
                this.clearApiSettings();
            });
        }
        
        // AI更新ボタン
        const refreshAiBtn = document.getElementById('refresh-ai-btn');
        if (refreshAiBtn) {
            refreshAiBtn.addEventListener('click', () => {
                this.refreshAiRecommendations();
            });
        }
        
        // ゲーム変更ボタン
        const changeGameBtn = document.getElementById('change-game-btn');
        if (changeGameBtn) {
            changeGameBtn.addEventListener('click', () => {
                this.showGameSelector();
            });
        }
        
        // ゲーム選択確定ボタン
        const confirmGameBtn = document.getElementById('confirm-game-btn');
        if (confirmGameBtn) {
            confirmGameBtn.addEventListener('click', () => {
                this.confirmGameSelection();
            });
        }
        
        // ゲーム選択キャンセルボタン
        const cancelGameBtn = document.getElementById('cancel-game-btn');
        if (cancelGameBtn) {
            cancelGameBtn.addEventListener('click', () => {
                this.hideGameSelector();
            });
        }
    }
    
    // タブ切り替え
    switchTab(tabName) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    // ログイン処理
    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (this.authService) {
            const result = this.authService.login(username, password);
            if (result.success) {
                this.currentUser = result.user;
                this.updateUserDisplay(username);
                this.hideLoginModal();
                this.loadUserData();
                this.showToast('ログインしました', 'success');
            } else {
                this.showToast(result.message, 'error');
            }
        } else {
            // モックログイン
            this.currentUser = { username: username };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUserDisplay(username);
            this.hideLoginModal();
            this.showToast('ログインしました', 'success');
        }
    }
    
    // 登録処理
    handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (password !== passwordConfirm) {
            this.showToast('パスワードが一致しません', 'error');
            return;
        }
        
        if (this.authService) {
            const result = this.authService.register(username, password, email);
            if (result.success) {
                this.showToast('登録が完了しました。ログインしてください。', 'success');
                this.switchTab('login');
            } else {
                this.showToast(result.message, 'error');
            }
        } else {
            // モック登録
            this.showToast('登録が完了しました', 'success');
            this.switchTab('login');
        }
    }
    
    // ゲストアクセス
    handleGuestAccess() {
        this.isGuest = true;
        sessionStorage.setItem('isGuest', 'true');
        this.updateUserDisplay('ゲストユーザー', true);
        this.hideLoginModal();
        this.showToast('ゲストとしてログインしました', 'info');
    }
    
    // ログアウト
    handleLogout() {
        this.currentUser = null;
        this.isGuest = false;
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isGuest');
        this.showLoginModal();
        this.showToast('ログアウトしました', 'info');
    }
    
    // 試合データ送信
    handleMatchSubmit() {
        const matchData = {
            result: document.getElementById('match-result').value,
            kills: parseInt(document.getElementById('kills').value),
            deaths: parseInt(document.getElementById('deaths').value),
            assists: parseInt(document.getElementById('assists').value),
            cs: parseInt(document.getElementById('cs').value),
            duration: parseInt(document.getElementById('match-duration').value)
        };
        
        this.analyzeMatch(matchData);
        document.getElementById('match-form').reset();
        this.showToast('分析を実行しています...', 'info');
    }
    
    // 目標追加
    handleGoalSubmit() {
        const goalData = {
            title: document.getElementById('goal-title').value,
            deadline: document.getElementById('goal-deadline').value,
            description: document.getElementById('goal-description').value,
            id: Date.now(),
            progress: 0
        };
        
        this.addGoal(goalData);
        document.getElementById('goal-form').reset();
        this.showToast('目標を追加しました', 'success');
    }
    
    // API設定保存
    handleApiSave() {
        const provider = document.getElementById('api-provider').value;
        const apiKey = document.getElementById('api-key').value;
        const model = document.getElementById('api-model').value;
        
        if (this.aiService) {
            this.aiService.saveConfiguration(provider, apiKey, model);
        } else {
            localStorage.setItem('ai_provider', provider);
            localStorage.setItem('ai_api_key', apiKey);
            localStorage.setItem('ai_model', model);
        }
        
        this.updateApiStatus(true);
        this.showToast('API設定を保存しました', 'success');
    }
    
    // API接続テスト
    async testApiConnection() {
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            if (Math.random() > 0.5) {
                this.showToast('API接続成功', 'success');
            } else {
                this.showToast('API接続失敗: キーを確認してください', 'error');
            }
        }, 1000);
    }
    
    // API設定クリア
    clearApiSettings() {
        if (this.aiService) {
            this.aiService.clearConfiguration();
        } else {
            localStorage.removeItem('ai_provider');
            localStorage.removeItem('ai_api_key');
            localStorage.removeItem('ai_model');
        }
        
        document.getElementById('api-key').value = '';
        this.updateApiStatus(false);
        this.showToast('API設定をクリアしました', 'info');
    }
    
    // API状態更新
    updateApiStatus(isConfigured) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            if (isConfigured) {
                statusIndicator.classList.remove('offline');
                statusIndicator.classList.add('online');
                statusText.textContent = 'API設定済み';
            } else {
                statusIndicator.classList.remove('online');
                statusIndicator.classList.add('offline');
                statusText.textContent = 'API未設定';
            }
        }
    }
    
    // チャート初期化
    initCharts() {
        // パフォーマンスチャート
        const perfCanvas = document.getElementById('performance-chart');
        if (perfCanvas && typeof Chart !== 'undefined') {
            const ctx = perfCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1週間前', '6日前', '5日前', '4日前', '3日前', '2日前', '昨日', '今日'],
                    datasets: [{
                        label: '勝率',
                        data: [55, 58, 52, 60, 58, 62, 59, 58.5],
                        borderColor: '#e94560',
                        backgroundColor: 'rgba(233, 69, 96, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 40,
                            max: 70
                        }
                    }
                }
            });
        }
        
        // KDAチャート
        const kdaCanvas = document.getElementById('kda-chart');
        if (kdaCanvas && typeof Chart !== 'undefined') {
            const ctx = kdaCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['キル', 'デス', 'アシスト'],
                    datasets: [{
                        label: '平均',
                        data: [8.2, 5.3, 10.5],
                        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    // トースト表示
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // ローディング表示
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
    
    // 各ページのロード処理
    loadDashboard() {
        this.loadRecentMatches();
        this.loadAiRecommendations();
    }
    
    loadAnalysis() {
        // 分析ページの初期化
    }
    
    loadGoals() {
        this.loadGoalsList();
    }
    
    loadSettings() {
        this.loadGameCategories();
        this.loadApiSettings();
    }
    
    // データロード処理
    loadUserData() {
        // ユーザーデータのロード
        if (!this.isGuest && this.currentUser) {
            // 保存されたデータをロード
        }
    }
    
    loadRecentMatches() {
        const container = document.getElementById('recent-matches');
        if (!container) return;
        
        const matches = [
            { result: 'WIN', kda: '8/2/11', cs: 285 },
            { result: 'LOSS', kda: '5/6/8', cs: 243 },
            { result: 'WIN', kda: '12/3/7', cs: 312 }
        ];
        
        container.innerHTML = matches.map(match => `
            <div class="match-item ${match.result.toLowerCase()}">
                <span class="match-result">${match.result}</span>
                <span class="match-kda">KDA: ${match.kda}</span>
                <span class="match-cs">CS: ${match.cs}</span>
            </div>
        `).join('');
    }
    
    loadAiRecommendations() {
        const container = document.getElementById('ai-recommendations-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="recommendation-item">
                <h4>🎯 CS精度の向上</h4>
                <p>10分時点でのCS目標を80に設定し、カスタムゲームで練習しましょう。</p>
            </div>
            <div class="recommendation-item">
                <h4>📍 マップコントロール</h4>
                <p>ワードの配置位置を最適化し、視界確保を改善しましょう。</p>
            </div>
            <div class="recommendation-item">
                <h4>⚔️ チームファイト</h4>
                <p>ポジショニングを意識し、エンゲージのタイミングを改善しましょう。</p>
            </div>
        `;
    }
    
    refreshAiRecommendations() {
        this.showLoading();
        setTimeout(() => {
            this.loadAiRecommendations();
            this.hideLoading();
            this.showToast('推奨事項を更新しました', 'success');
        }, 1000);
    }
    
    loadGoalsList() {
        const container = document.getElementById('goals-list');
        if (!container) return;
        
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        if (goals.length === 0) {
            container.innerHTML = '<p class="no-data">目標がまだ設定されていません</p>';
            return;
        }
        
        container.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="goal-deadline">${goal.deadline}</span>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <span class="progress-text">${goal.progress}%</span>
                </div>
            </div>
        `).join('');
    }
    
    addGoal(goalData) {
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        goals.push(goalData);
        localStorage.setItem('goals', JSON.stringify(goals));
        this.loadGoalsList();
    }
    
    analyzeMatch(matchData) {
        const kda = ((matchData.kills + matchData.assists) / Math.max(matchData.deaths, 1)).toFixed(2);
        const csPerMin = (matchData.cs / matchData.duration).toFixed(1);
        
        const resultsContainer = document.getElementById('analysis-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="card">
                    <h3>分析結果</h3>
                    <div class="analysis-stats">
                        <div class="stat-box">
                            <span class="stat-label">KDA</span>
                            <span class="stat-value">${kda}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">CS/分</span>
                            <span class="stat-value">${csPerMin}</span>
                        </div>
                    </div>
                    <div class="analysis-feedback">
                        <h4>パフォーマンス評価</h4>
                        <p>${kda >= 3 ? '優れたKDAです！' : 'KDAの改善余地があります。'}</p>
                        <p>${csPerMin >= 7 ? 'CS精度は良好です。' : 'CSの精度を向上させましょう。'}</p>
                    </div>
                </div>
            `;
            resultsContainer.classList.remove('hidden');
        }
    }
    
    loadGameCategories() {
        const container = document.getElementById('game-categories');
        if (!container || typeof ESPORTS_GAMES === 'undefined') return;
        
        let html = '';
        for (const [categoryKey, category] of Object.entries(ESPORTS_GAMES)) {
            html += `<div class="category-section">
                <h4>${category.name}</h4>
                <div class="games-grid">`;
            
            category.games.forEach(game => {
                html += `
                    <div class="game-card" data-game-id="${game.id}">
                        <span class="game-icon">${game.icon}</span>
                        <span class="game-name">${game.name}</span>
                    </div>`;
            });
            
            html += '</div></div>';
        }
        
        container.innerHTML = html;
        
        // ゲームカードのクリックイベント
        container.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                container.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    }
    
    showGameSelector() {
        const selector = document.getElementById('game-selector');
        if (selector) {
            selector.classList.remove('hidden');
        }
    }
    
    hideGameSelector() {
        const selector = document.getElementById('game-selector');
        if (selector) {
            selector.classList.add('hidden');
        }
    }
    
    confirmGameSelection() {
        const selected = document.querySelector('.game-card.selected');
        if (selected) {
            const gameId = selected.dataset.gameId;
            const gameName = selected.querySelector('.game-name').textContent;
            const gameIcon = selected.querySelector('.game-icon').textContent;
            
            const currentGameName = document.getElementById('current-game-name');
            const currentGameIcon = document.getElementById('current-game-icon');
            const playerGame = document.getElementById('player-game');
            
            if (currentGameName) currentGameName.textContent = gameName;
            if (currentGameIcon) currentGameIcon.textContent = gameIcon;
            if (playerGame) playerGame.textContent = gameName;
            
            localStorage.setItem('selectedGame', gameId);
            this.hideGameSelector();
            this.showToast(`ゲームを${gameName}に変更しました`, 'success');
        }
    }
    
    loadApiSettings() {
        const provider = localStorage.getItem('ai_provider');
        const model = localStorage.getItem('ai_model');
        const hasKey = localStorage.getItem('ai_api_key');
        
        if (provider) {
            const providerSelect = document.getElementById('api-provider');
            if (providerSelect) providerSelect.value = provider;
        }
        if (model) {
            const modelSelect = document.getElementById('api-model');
            if (modelSelect) modelSelect.value = model;
        }
        
        this.updateApiStatus(!!hasKey);
    }
}

// アプリの起動
const app = new App();

// Export for global access
window.app = app;