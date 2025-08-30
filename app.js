// eSports AI Coaching Web Application
// Main Application Class

class eSportsCoachingApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.aiService = new AICoachingService();
    this.authService = new AuthService();
    this.gameManager = new GameManager();
    this.mediaAnalyzer = new MediaAnalyzer();
    this.charts = {};
    this.playerData = { ...mockPlayerData };
    this.isLoggedIn = false;
    this.uploadedFiles = [];
    
    // Initialize the application
    this.init();
  }

  async init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.initializeLocalStorage();
    
    if (this.isLoggedIn) {
      await this.loadPlayerData();
      this.showPage(this.currentPage);
      this.renderDashboard();
      this.renderGoals();
      this.renderSettings();
      this.renderGameSelection();
      this.renderMediaAnalysis();
    } else {
      this.showLoginModal();
    }
    
    console.log('eSports AI Coaching App initialized successfully');
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.closest('.nav-btn').dataset.page;
        this.showPage(page);
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle-btn');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // Match form submission
    const matchForm = document.getElementById('match-form');
    if (matchForm) {
      matchForm.addEventListener('submit', this.handleMatchSubmission.bind(this));
    }

    // Goal form submission
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
      goalForm.addEventListener('submit', this.handleGoalSubmission.bind(this));
    }

    // API form submission
    const apiForm = document.getElementById('api-form');
    if (apiForm) {
      apiForm.addEventListener('submit', this.handleAPISettings.bind(this));
    }

    // Login/Register form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', this.handleRegister.bind(this));
    }

    // Tab switching for login modal
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', this.handleTabSwitch.bind(this));
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.logout.bind(this));
    }

    // Guest button
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) {
      guestBtn.addEventListener('click', this.handleGuestLogin.bind(this));
    }

    // Game selection buttons
    const changeGameBtn = document.getElementById('change-game-btn');
    if (changeGameBtn) {
      changeGameBtn.addEventListener('click', this.showGameSelector.bind(this));
    }

    const confirmGameBtn = document.getElementById('confirm-game-btn');
    if (confirmGameBtn) {
      confirmGameBtn.addEventListener('click', this.confirmGameSelection.bind(this));
    }

    const cancelGameBtn = document.getElementById('cancel-game-btn');
    if (cancelGameBtn) {
      cancelGameBtn.addEventListener('click', this.hideGameSelector.bind(this));
    }

    // Media analysis event listeners
    const fileSelectBtn = document.getElementById('file-select-btn');
    if (fileSelectBtn) {
      fileSelectBtn.addEventListener('click', () => {
        document.getElementById('file-input').click();
      });
    }

    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', this.handleFileSelection.bind(this));
    }

    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
      uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
      uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
      uploadArea.addEventListener('click', () => {
        document.getElementById('file-input').click();
      });
    }

    // Media API settings
    const saveMediaApiBtn = document.getElementById('save-media-api-settings');
    if (saveMediaApiBtn) {
      saveMediaApiBtn.addEventListener('click', this.saveMediaApiSettings.bind(this));
    }

    const testVisionApiBtn = document.getElementById('test-vision-api');
    if (testVisionApiBtn) {
      testVisionApiBtn.addEventListener('click', this.testVisionApi.bind(this));
    }

    const testVideoApiBtn = document.getElementById('test-video-api');
    if (testVideoApiBtn) {
      testVideoApiBtn.addEventListener('click', this.testVideoApi.bind(this));
    }

    // API test button
    const testAPIBtn = document.getElementById('test-api-btn');
    if (testAPIBtn) {
      testAPIBtn.addEventListener('click', this.testAPIConnection.bind(this));
    }

    // Clear API button
    const clearAPIBtn = document.getElementById('clear-api-btn');
    if (clearAPIBtn) {
      clearAPIBtn.addEventListener('click', this.clearAPISettings.bind(this));
    }

    // API key toggle
    const toggleAPIKey = document.getElementById('toggle-api-key');
    if (toggleAPIKey) {
      toggleAPIKey.addEventListener('click', this.toggleAPIKeyVisibility.bind(this));
    }

    // Refresh AI recommendations
    const refreshAIBtn = document.getElementById('refresh-ai-btn');
    if (refreshAIBtn) {
      refreshAIBtn.addEventListener('click', this.refreshAIRecommendations.bind(this));
    }

    // Settings changes
    document.querySelectorAll('#settings input, #settings select').forEach(input => {
      input.addEventListener('change', this.handleSettingsChange.bind(this));
    });
  }

  // Local Storage Management
  initializeLocalStorage() {
    // Initialize player data if not exists
    if (!localStorage.getItem('player-data')) {
      localStorage.setItem('player-data', JSON.stringify(this.playerData));
    }

    // Initialize app settings
    if (!localStorage.getItem('app-settings')) {
      const defaultSettings = {
        theme: 'dark',
        notifications: true,
        autoAnalysis: false,
        dataRetention: 30,
        language: 'ja'
      };
      localStorage.setItem('app-settings', JSON.stringify(defaultSettings));
    }
  }

  async loadPlayerData() {
    try {
      const savedData = localStorage.getItem('player-data');
      if (savedData) {
        this.playerData = JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
      this.showToast('プレイヤーデータの読み込みに失敗しました', 'error');
    }
  }

  savePlayerData() {
    try {
      localStorage.setItem('player-data', JSON.stringify(this.playerData));
    } catch (error) {
      console.error('Failed to save player data:', error);
      this.showToast('プレイヤーデータの保存に失敗しました', 'error');
    }
  }

  // Page Navigation
  showPage(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    this.currentPage = pageId;

    // Render page-specific content
    switch (pageId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'analysis':
        this.renderAnalysis();
        break;
      case 'goals':
        this.renderGoals();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }

  // Dashboard Rendering
  async renderDashboard() {
    // Update game display first
    const currentGame = this.gameManager.getSelectedGame();
    this.updateDashboardForGame(currentGame);
    
    this.updatePlayerProfile();
    this.renderRecentMatches();
    await this.renderPerformanceCharts();
    await this.renderAIRecommendations();
  }

  updatePlayerProfile() {
    const elements = {
      'player-name': this.playerData.username,
      'player-rank': this.playerData.rank,
      'player-game': this.playerData.game,
      'win-rate': `${this.playerData.stats.winRate}%`,
      'avg-kda': this.playerData.stats.avgKDA,
      'cs-per-min': this.playerData.stats.avgCSPerMin,
      'games-played': this.playerData.stats.gamesPlayed
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  renderRecentMatches() {
    const container = document.getElementById('recent-matches');
    if (!container) return;

    const matches = this.playerData.recentMatches.slice(0, 5);
    
    container.innerHTML = matches.map(match => `
      <div class="match-item">
        <div class="match-info">
          <span class="match-result ${match.result.toLowerCase()}">${match.result}</span>
          <span class="match-champion">${match.champion || 'Unknown'}</span>
        </div>
        <div class="match-stats">
          <span>KDA: ${match.kda}</span>
          <span>CS: ${match.cs}</span>
          <span>${match.duration}分</span>
          <span>${match.date}</span>
        </div>
      </div>
    `).join('');
  }

  async renderPerformanceCharts() {
    await this.renderPerformanceTrendChart();
    await this.renderKDADistributionChart();
  }

  async renderPerformanceTrendChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (this.charts.performance) {
      this.charts.performance.destroy();
    }

    this.charts.performance = new Chart(ctx, {
      type: 'line',
      data: mockPerformanceData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#b8c5d6'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#b8c5d6'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  async renderKDADistributionChart() {
    const ctx = document.getElementById('kda-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (this.charts.kda) {
      this.charts.kda.destroy();
    }

    this.charts.kda = new Chart(ctx, {
      type: 'doughnut',
      data: mockKDAData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 20
            }
          }
        }
      }
    });
  }

  async renderAIRecommendations() {
    const container = document.getElementById('ai-recommendations-content');
    if (!container) return;

    this.showLoading(true);

    try {
      const currentGame = this.gameManager.getSelectedGame();
      const analysis = await this.aiService.analyzePerformance(this.playerData, currentGame);
      const recommendations = await this.aiService.generateRecommendations(analysis);
      
      container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-text">${rec.text || rec.description}</div>
          ${rec.actionItems ? `
            <ul class="action-items">
              ${rec.actionItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('');

    } catch (error) {
      console.error('Failed to render AI recommendations:', error);
      container.innerHTML = `
        <div class="recommendation-item">
          <div class="recommendation-title">AI分析を利用できません</div>
          <div class="recommendation-text">API設定を確認するか、モックデータでの分析をお試しください。</div>
        </div>
      `;
    }

    this.showLoading(false);
  }

  async refreshAIRecommendations() {
    const btn = document.getElementById('refresh-ai-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '🔄';
    btn.disabled = true;
    
    await this.renderAIRecommendations();
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1000);
  }

  // Analysis Page
  renderAnalysis() {
    // Analysis page is mainly form-based, rendered in HTML
    // We just need to ensure the form is properly handled
  }

  async handleMatchSubmission(e) {
    e.preventDefault();
    
    this.showLoading(true);
    
    const formData = new FormData(e.target);
    const matchData = {
      result: formData.get('match-result'),
      kills: parseInt(formData.get('kills')),
      deaths: parseInt(formData.get('deaths')),
      assists: parseInt(formData.get('assists')),
      cs: parseInt(formData.get('cs')),
      duration: parseInt(formData.get('match-duration')),
      kda: `${formData.get('kills')}/${formData.get('deaths')}/${formData.get('assists')}`,
      champion: 'Unknown' // Could be added to form later
    };

    // Add match to data
    const newMatch = mockDataHelpers.addMatch(matchData);
    this.playerData.recentMatches.unshift(newMatch);
    
    // Save to user data if logged in
    this.savePlayerData();

    // Perform AI analysis
    try {
      const currentGame = this.gameManager.getSelectedGame();
      const analysis = await this.aiService.analyzePerformance(this.playerData, currentGame);
      this.displayAnalysisResults(analysis);
      this.showToast('分析が完了しました', 'success');
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showToast('分析に失敗しました', 'error');
    }

    // Reset form
    e.target.reset();
    this.showLoading(false);
  }

  displayAnalysisResults(analysis) {
    const container = document.getElementById('analysis-results');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <h3>AI分析結果</h3>
        <div class="analysis-section">
          <h4>全体分析</h4>
          <p>${analysis.analysis}</p>
        </div>
        <div class="analysis-grid">
          <div class="analysis-section">
            <h4>強み</h4>
            <ul>
              ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="analysis-section">
            <h4>弱み</h4>
            <ul>
              ${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
          <div class="analysis-section">
            <h4>改善点</h4>
            <ul>
              ${analysis.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
          <div class="analysis-section">
            <h4>推奨練習</h4>
            <ul>
              ${analysis.training.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="priority-section">
          <h4>最優先課題</h4>
          <p class="priority-text">${analysis.priority}</p>
        </div>
        <div class="improvement-estimate">
          <h4>予想される効果</h4>
          <p>${analysis.estimatedImprovement}</p>
        </div>
      </div>
    `;

    container.classList.remove('hidden');
  }

  // Goals Management
  renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    const goals = mockDataHelpers.getGoals();
    
    container.innerHTML = goals.map(goal => `
      <div class="goal-item">
        <div class="goal-header">
          <div>
            <div class="goal-title">${goal.title}</div>
            <div class="goal-deadline">期限: ${goal.deadline} (残り${goal.daysRemaining}日)</div>
          </div>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${goal.progress}%"></div>
          </div>
          <div class="progress-text">${goal.progress}% 完了</div>
        </div>
        ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
        <div class="goal-actions">
          <button class="btn-secondary" onclick="app.updateGoalProgress(${goal.id}, ${Math.min(100, goal.progress + 10)})">
            +10%
          </button>
          <button class="btn-danger" onclick="app.removeGoal(${goal.id})">削除</button>
        </div>
      </div>
    `).join('');
  }

  async handleGoalSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const goalData = {
      title: formData.get('goal-title'),
      description: formData.get('goal-description'),
      deadline: formData.get('goal-deadline'),
      type: 'custom'
    };

    const newGoal = mockDataHelpers.addGoal(goalData);
    this.playerData.goals.push(newGoal);
    this.savePlayerData();

    this.renderGoals();
    this.showToast('目標が追加されました', 'success');
    e.target.reset();
  }

  updateGoalProgress(goalId, progress) {
    const goal = this.playerData.goals.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.max(0, Math.min(100, progress));
      this.savePlayerData();
      this.renderGoals();
      
      if (progress >= 100) {
        this.showToast('目標が達成されました！🎉', 'success');
      }
    }
  }

  removeGoal(goalId) {
    if (confirm('この目標を削除しますか？')) {
      this.playerData.goals = this.playerData.goals.filter(g => g.id !== goalId);
      this.savePlayerData();
      this.renderGoals();
      this.showToast('目標が削除されました', 'success');
    }
  }

  // Settings Management
  renderSettings() {
    this.updateAPIStatus();
    this.loadAPISettings();
    this.loadAppSettings();
  }

  updateAPIStatus() {
    const statusElement = document.querySelector('.api-status');
    const indicatorElement = document.querySelector('.status-indicator');
    const textElement = document.querySelector('.status-text');
    
    if (!statusElement || !indicatorElement || !textElement) return;

    const config = this.aiService.getConfiguration();
    
    if (config.isConfigured) {
      indicatorElement.className = 'status-indicator online';
      textElement.textContent = 'API設定済み';
      if (config.lastVerified) {
        const lastVerified = new Date(config.lastVerified).toLocaleString('ja-JP');
        textElement.textContent += ` (最終確認: ${lastVerified})`;
      }
    } else {
      indicatorElement.className = 'status-indicator offline';
      textElement.textContent = 'API未設定';
    }
  }

  loadAPISettings() {
    const config = this.aiService.getConfiguration();
    
    const providerSelect = document.getElementById('api-provider');
    const modelSelect = document.getElementById('api-model');
    
    if (providerSelect) {
      providerSelect.value = config.provider;
    }
    
    if (modelSelect) {
      modelSelect.value = config.model;
    }

    // Don't load API key for security reasons
  }

  loadAppSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      
      const settingElements = {
        'notifications': settings.notifications,
        'auto-analysis': settings.autoAnalysis,
        'data-retention': settings.dataRetention
      };

      Object.entries(settingElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });
    } catch (error) {
      console.error('Failed to load app settings:', error);
    }
  }

  async handleAPISettings(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const provider = formData.get('api-provider');
    const apiKey = formData.get('api-key');
    const model = formData.get('api-model');

    if (!apiKey) {
      this.showToast('APIキーを入力してください', 'error');
      return;
    }

    this.showLoading(true, 'API設定を保存中...');

    try {
      const result = this.aiService.saveConfiguration(provider, apiKey, model);
      
      if (result.success) {
        this.showToast(result.message, 'success');
        this.updateAPIStatus();
        
        // Clear the API key field for security
        document.getElementById('api-key').value = '';
      } else {
        this.showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to save API settings:', error);
      this.showToast('API設定の保存に失敗しました', 'error');
    }

    this.showLoading(false);
  }

  async testAPIConnection() {
    const btn = document.getElementById('test-api-btn');
    const originalText = btn.textContent;
    
    btn.textContent = 'テスト中...';
    btn.disabled = true;
    
    try {
      const result = await this.aiService.validateAPIKey();
      
      if (result.valid) {
        this.showToast(result.message, 'success');
        this.updateAPIStatus();
      } else {
        this.showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      this.showToast('API接続テストに失敗しました', 'error');
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
  }

  clearAPISettings() {
    if (confirm('API設定をクリアしますか？')) {
      const result = this.aiService.clearConfiguration();
      
      if (result.success) {
        this.showToast(result.message, 'success');
        this.updateAPIStatus();
        document.getElementById('api-key').value = '';
      } else {
        this.showToast(result.message, 'error');
      }
    }
  }

  toggleAPIKeyVisibility() {
    const input = document.getElementById('api-key');
    const button = document.getElementById('toggle-api-key');
    
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
    } else {
      input.type = 'password';
      button.textContent = '👁️';
    }
  }

  handleSettingsChange(e) {
    try {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      
      switch (e.target.id) {
        case 'notifications':
          settings.notifications = value;
          break;
        case 'auto-analysis':
          settings.autoAnalysis = value;
          break;
        case 'data-retention':
          settings.dataRetention = parseInt(value);
          break;
      }

      localStorage.setItem('app-settings', JSON.stringify(settings));
      this.showToast('設定が保存されました', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('設定の保存に失敗しました', 'error');
    }
  }

  // Theme Management
  toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
    
    // Save theme preference
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    settings.theme = newTheme;
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    this.showToast(`${newTheme === 'dark' ? 'ダーク' : 'ライト'}モードに変更しました`, 'success');
  }

  // Utility Functions
  showLoading(show, message = '読み込み中...') {
    const overlay = document.getElementById('loading');
    if (!overlay) return;

    if (show) {
      overlay.querySelector('p').textContent = message;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new eSportsCoachingApp();
  
  // Make showToast available globally for API service
  window.showToast = (message, type) => window.app.showToast(message, type);
});

// Handle window resize for charts
window.addEventListener('resize', () => {
  if (window.app && window.app.charts) {
    Object.values(window.app.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
});

  // Authentication Methods
  checkAuthStatus() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = !!user;
    if (user) {
      this.updatePlayerProfile(user);
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

  handleTabSwitch(e) {
    e.preventDefault();
    const tabName = e.target.dataset.tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const result = this.authService.login(username, password);
    
    if (result.success) {
      this.isLoggedIn = true;
      this.hideLoginModal();
      this.updatePlayerProfile(result.user);
      this.showToast('ログインしました', 'success');
      
      // Initialize app content
      await this.loadPlayerData();
      this.showPage(this.currentPage);
      this.renderDashboard();
      this.renderGoals();
      this.renderSettings();
      this.renderGameSelection();
      this.renderMediaAnalysis();
    } else {
      this.showToast(result.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;

    if (password !== confirmPassword) {
      this.showToast('パスワードが一致しません', 'error');
      return;
    }

    if (password.length < 6) {
      this.showToast('パスワードは6文字以上で入力してください', 'error');
      return;
    }

    const result = this.authService.register(username, password, email);
    
    if (result.success) {
      this.showToast('アカウントが作成されました。ログインしてください。', 'success');
      
      // Switch to login tab
      document.querySelector('[data-tab="login"]').click();
      
      // Clear register form
      e.target.reset();
    } else {
      this.showToast(result.message, 'error');
    }
  }

  updatePlayerProfile(user) {
    // Update player name in dashboard
    const playerNameElement = document.getElementById('player-name');
    if (playerNameElement) {
      playerNameElement.textContent = user.username;
    }

    // Update header user info
    const headerUserName = document.getElementById('header-user-name');
    if (headerUserName) {
      headerUserName.textContent = user.username;
    }

    const userTypeIndicator = document.getElementById('user-type-indicator');
    if (userTypeIndicator) {
      if (user.isGuest) {
        userTypeIndicator.textContent = 'ゲスト';
        userTypeIndicator.className = 'user-type guest';
      } else {
        userTypeIndicator.textContent = '登録済み';
        userTypeIndicator.className = 'user-type registered';
      }
    }

    // Load user-specific data
    const userData = this.authService.getUserData('playerStats');
    if (userData) {
      this.playerData = { ...this.playerData, ...userData };
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showLoginModal();
    this.showToast('ログアウトしました', 'info');
  }

  async handleGuestLogin(e) {
    e.preventDefault();
    
    try {
      const result = this.authService.loginAsGuest();
      
      if (result.success) {
        this.isLoggedIn = true;
        this.hideLoginModal();
        this.updatePlayerProfile(result.user);
        this.showToast('ゲストモードでログインしました', 'info');
        
        // Initialize app content
        await this.loadPlayerData();
        this.showPage(this.currentPage);
        this.renderDashboard();
        this.renderGoals();
        this.renderSettings();
        this.renderGameSelection();
      }
    } catch (error) {
      console.error('Guest login error:', error);
      this.showToast('ゲストログインに失敗しました', 'error');
    }
  }

  // Game Selection Methods
  renderGameSelection() {
    const currentGame = this.gameManager.getSelectedGame();
    this.updateCurrentGameDisplay(currentGame);
    this.populateGameSelector();
  }

  updateCurrentGameDisplay(game) {
    const gameIcon = document.getElementById('current-game-icon');
    const gameName = document.getElementById('current-game-name');
    const gameCategory = document.getElementById('current-game-category');

    if (gameIcon) gameIcon.textContent = game.icon;
    if (gameName) gameName.textContent = game.name;
    if (gameCategory) {
      const categories = this.gameManager.getGameCategories();
      const category = Object.values(categories).find(cat => 
        cat.games.some(g => g.id === game.id)
      );
      gameCategory.textContent = category ? category.name : 'その他';
    }
  }

  populateGameSelector() {
    const container = document.getElementById('game-categories');
    if (!container) return;

    const categories = this.gameManager.getGameCategories();
    
    container.innerHTML = Object.entries(categories).map(([categoryId, category]) => `
      <div class="game-category-section">
        <h4 class="category-title">${category.name}</h4>
        <div class="games-grid">
          ${category.games.map(game => `
            <div class="game-option" data-game-id="${game.id}">
              <span class="game-option-icon">${game.icon}</span>
              <span class="game-option-name">${game.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add click handlers for game options
    container.querySelectorAll('.game-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const gameId = e.currentTarget.dataset.gameId;
        this.selectGameOption(gameId);
      });
    });
  }

  selectGameOption(gameId) {
    // Remove previous selection
    document.querySelectorAll('.game-option').forEach(option => {
      option.classList.remove('selected');
    });

    // Add selection to clicked option
    const selectedOption = document.querySelector(`[data-game-id="${gameId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }

    this.tempSelectedGameId = gameId;
  }

  showGameSelector() {
    const selector = document.getElementById('game-selector');
    if (selector) {
      selector.classList.remove('hidden');
      
      // Pre-select current game
      const currentGame = this.gameManager.getSelectedGame();
      if (currentGame) {
        this.selectGameOption(currentGame.id);
      }
    }
  }

  hideGameSelector() {
    const selector = document.getElementById('game-selector');
    if (selector) {
      selector.classList.add('hidden');
    }
    this.tempSelectedGameId = null;
  }

  confirmGameSelection() {
    if (this.tempSelectedGameId) {
      const selectedGame = this.gameManager.selectGame(this.tempSelectedGameId);
      if (selectedGame) {
        this.updateCurrentGameDisplay(selectedGame);
        this.hideGameSelector();
        this.showToast(`${selectedGame.name}に変更しました`, 'success');
        
        // Update dashboard to reflect game change
        this.updateDashboardForGame(selectedGame);
      }
    } else {
      this.showToast('ゲームを選択してください', 'warning');
    }
  }

  updateDashboardForGame(game) {
    // Update player game display
    const playerGame = document.getElementById('player-game');
    if (playerGame) {
      playerGame.textContent = game.name;
    }

    // Get game-specific prompts and update UI accordingly
    const gamePrompt = this.gameManager.getGameSpecificPrompt(game.id);
    if (gamePrompt) {
      // Could update form fields, stats display, etc. based on game
      console.log('Game-specific settings:', gamePrompt);
    }
  }

  // Media Analysis Methods
  renderMediaAnalysis() {
    this.loadMediaApiSettings();
  }

  loadMediaApiSettings() {
    const visionApiInput = document.getElementById('vision-api-key');
    const videoApiInput = document.getElementById('video-api-key');

    if (visionApiInput) {
      visionApiInput.value = this.mediaAnalyzer.visionApiKey;
    }
    if (videoApiInput) {
      videoApiInput.value = this.mediaAnalyzer.videoApiKey;
    }
  }

  saveMediaApiSettings() {
    const visionApiKey = document.getElementById('vision-api-key').value;
    const videoApiKey = document.getElementById('video-api-key').value;

    this.mediaAnalyzer.setVisionApiKey(visionApiKey);
    this.mediaAnalyzer.setVideoApiKey(videoApiKey);

    this.showToast('API設定を保存しました', 'success');
  }

  async testVisionApi() {
    const result = await this.mediaAnalyzer.testVisionApi();
    this.showToast(result.message, result.success ? 'success' : 'error');
  }

  async testVideoApi() {
    this.showToast('Video API テスト機能は準備中です', 'info');
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  }

  handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelection(e) {
    const files = Array.from(e.target.files);
    this.processFiles(files);
  }

  processFiles(files) {
    files.forEach(file => {
      if (this.validateFile(file)) {
        this.addFileToPreview(file);
      }
    });
  }

  validateFile(file) {
    // ファイルサイズチェック (10MB制限)
    if (!this.mediaAnalyzer.checkFileSize(file, 10)) {
      this.showToast(`${file.name}: ファイルサイズが大きすぎます (最大10MB)`, 'error');
      return false;
    }

    // ファイル形式チェック
    const isImage = this.mediaAnalyzer.validateFile(file, 'image');
    const isVideo = this.mediaAnalyzer.validateFile(file, 'video');

    if (!isImage && !isVideo) {
      this.showToast(`${file.name}: サポートされていないファイル形式です`, 'error');
      return false;
    }

    return true;
  }

  addFileToPreview(file) {
    this.uploadedFiles.push(file);
    this.updateFilePreview();
  }

  updateFilePreview() {
    const preview = document.getElementById('file-preview');
    if (!preview) return;

    if (this.uploadedFiles.length === 0) {
      preview.classList.add('hidden');
      return;
    }

    preview.classList.remove('hidden');
    preview.innerHTML = this.uploadedFiles.map((file, index) => {
      const fileInfo = this.mediaAnalyzer.getFileInfo(file);
      const isImage = file.type.startsWith('image/');
      
      return `
        <div class="file-item" data-index="${index}">
          <div class="file-info">
            <div class="file-icon">${isImage ? '🖼️' : '🎥'}</div>
            <div class="file-details">
              <h4>${fileInfo.name}</h4>
              <p>${fileInfo.size} - ${fileInfo.lastModified}</p>
            </div>
          </div>
          <div class="file-actions">
            <button class="btn-analyze" onclick="app.analyzeFile(${index})">分析</button>
            <button class="btn-remove" onclick="app.removeFile(${index})">削除</button>
          </div>
        </div>
      `;
    }).join('');
  }

  removeFile(index) {
    this.uploadedFiles.splice(index, 1);
    this.updateFilePreview();
  }

  async analyzeFile(index) {
    const file = this.uploadedFiles[index];
    if (!file) return;

    this.showLoading(true);
    
    try {
      let result;
      if (file.type.startsWith('image/')) {
        result = await this.mediaAnalyzer.analyzeScreenshot(file);
      } else if (file.type.startsWith('video/')) {
        result = await this.mediaAnalyzer.analyzeVideo(file);
      }

      this.displayAnalysisResults(result, file);
      this.showToast('分析が完了しました', 'success');
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showToast('分析に失敗しました', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  displayAnalysisResults(result, file) {
    const container = document.getElementById('media-analysis-results');
    if (!container) return;

    container.classList.remove('hidden');

    const isVideo = file.type.startsWith('video/');
    const analysisHtml = isVideo ? this.generateVideoAnalysisHtml(result) : this.generateImageAnalysisHtml(result);

    container.innerHTML = analysisHtml;
  }

  generateImageAnalysisHtml(result) {
    return `
      <div class="analysis-card">
        <div class="analysis-header">
          <span class="analysis-game">${result.game}</span>
          <span class="analysis-confidence">信頼度: ${Math.round(result.confidence * 100)}%</span>
        </div>

        <div class="analysis-stats">
          <div class="stat-box">
            <div class="stat-label">結果</div>
            <div class="stat-value">${result.result}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">スコア</div>
            <div class="stat-value">${result.score}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">K/D/A</div>
            <div class="stat-value">${result.kda.kills}/${result.kda.deaths}/${result.kda.assists}</div>
          </div>
          ${Object.entries(result.stats || {}).map(([key, value]) => `
            <div class="stat-box">
              <div class="stat-label">${key}</div>
              <div class="stat-value">${value}</div>
            </div>
          `).join('')}
        </div>

        <div class="analysis-section">
          <h4>強み</h4>
          <ul class="analysis-list strengths">
            ${result.analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>

        <div class="analysis-section">
          <h4>改善点</h4>
          <ul class="analysis-list weaknesses">
            ${result.analysis.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
          </ul>
        </div>

        <div class="analysis-section">
          <h4>提案</h4>
          <ul class="analysis-list suggestions">
            ${result.analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  generateVideoAnalysisHtml(result) {
    return `
      <div class="analysis-card">
        <div class="analysis-header">
          <span class="analysis-game">${result.game}</span>
          <span class="analysis-confidence">動画時間: ${result.duration}</span>
        </div>

        <div class="analysis-section">
          <h4>ハイライト</h4>
          <div class="video-highlights">
            ${result.highlights.map(highlight => `
              <div class="highlight-item">
                <span class="highlight-time">${highlight.time}</span>
                <span class="highlight-event">${highlight.event}</span>
                <span class="highlight-analysis">${highlight.analysis}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="analysis-section">
          <h4>総合評価</h4>
          <div class="analysis-stats">
            ${Object.entries(result.overall).map(([key, value]) => `
              <div class="stat-box">
                <div class="stat-label">${key}</div>
                <div class="stat-value">${value}/10</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="analysis-section">
          <h4>推奨事項</h4>
          <ul class="analysis-list suggestions">
            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  savePlayerData() {
    if (this.isLoggedIn) {
      this.authService.saveUserData('playerStats', this.playerData);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = eSportsCoachingApp;
}