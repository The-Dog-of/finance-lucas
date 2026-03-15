const htmlDoc = document.documentElement;
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const appPassword = document.getElementById('app-password');

const displayUser1 = document.getElementById('display-user1');
const displayUser2 = document.getElementById('display-user2');
const tabUser1 = document.getElementById('tab-user1');
const tabUser2 = document.getElementById('tab-user2');
const currentViewTitle = document.getElementById('current-view-title');

const viewCasal = document.getElementById('view-casal');
const viewIndividual = document.getElementById('view-individual');

const formFinance = document.getElementById('finance-form');
const valueInput = document.getElementById('value');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const methodSelect = document.getElementById('method');
const categorySelect = document.getElementById('category');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const tableBody = document.querySelector('#finance-table tbody');

const geralIncomeEl = document.getElementById('geral-income');
const geralExpenseEl = document.getElementById('geral-expense');
const geralBalanceEl = document.getElementById('geral-balance');

const indivIncomeEl = document.getElementById('indiv-income');
const indivExpenseEl = document.getElementById('indiv-expense');
const indivBalanceEl = document.getElementById('indiv-balance');

const formNewGoal = document.getElementById('form-new-goal');
const formContribute = document.getElementById('form-contribute-goal');
const btnShowGoalForm = document.getElementById('btn-show-goal-form');
const btnCancelGoal = document.getElementById('btn-cancel-goal');
const btnCancelContribute = document.getElementById('btn-cancel-contribute');
const goalsContainer = document.getElementById('goals-container');
const goalNameInput = document.getElementById('goal-name');
const goalTargetInput = document.getElementById('goal-target');
const contributeGoalId = document.getElementById('contribute-goal-id');
const contributePerson = document.getElementById('contribute-person');
const contributeValue = document.getElementById('contribute-value');

const btnSaveJson = document.getElementById('btn-save-json');
const inputLoadJson = document.getElementById('input-load-json');
const btnLogout = document.getElementById('btn-logout');
const monthSelect = document.getElementById('month-select');
const tabButtons = document.querySelectorAll('.tab-btn');
const themeBtn = document.getElementById('theme-toggle');
const quickChips = document.querySelectorAll('.quick-chip');
const toastContainer = document.getElementById('toast-container');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

const ctxFinanceGeral = document.getElementById('financeChartGeral').getContext('2d');
const ctxCategoryGeral = document.getElementById('categoryChartGeral').getContext('2d');

let transactions = [];
let goals = [];
let user1Name = 'Lucas';
let user2Name = 'Júlia';
let financeChartGeral;
let categoryChartGeral;
let currentTab = 'Geral';
let currentMonth = '';
let editingId = null;
let isDarkMode = false;

function toggleMenu() {
    sidebar.classList.toggle('open');
    mobileOverlay.classList.toggle('active');
}

mobileMenuBtn.addEventListener('click', toggleMenu);
closeSidebarBtn.addEventListener('click', toggleMenu);
mobileOverlay.addEventListener('click', toggleMenu);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2);
}

function applyMoneyMask(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
        e.target.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    e.target.value = "R$ " + value;
}

valueInput.addEventListener('input', applyMoneyMask);
goalTargetInput.addEventListener('input', applyMoneyMask);
contributeValue.addEventListener('input', applyMoneyMask);

function parseMoney(str) {
    if (!str) return 0;
    let val = str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(val);
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function initTheme() {
    const savedTheme = localStorage.getItem('financesTheme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        htmlDoc.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️';
    } else {
        isDarkMode = false;
        htmlDoc.setAttribute('data-theme', 'light');
        themeBtn.textContent = '🌙';
    }
}

themeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        htmlDoc.setAttribute('data-theme', 'dark');
        localStorage.setItem('financesTheme', 'dark');
        themeBtn.textContent = '☀️';
    } else {
        htmlDoc.setAttribute('data-theme', 'light');
        localStorage.setItem('financesTheme', 'light');
        themeBtn.textContent = '🌙';
    }
    if (currentTab === 'Geral') updateCasalView();
});

categorySelect.addEventListener('change', (e) => {
    if (e.target.value === 'Salário/Renda') {
        typeSelect.value = 'Entrada';
    } else {
        typeSelect.value = 'Saida';
    }
});

quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const action = chip.dataset.quick;
        typeSelect.value = 'Saida';
        
        if (action === 'ifood') {
            categorySelect.value = 'Alimentação';
            descriptionInput.value = 'Ifood/Lanche';
        } else if (action === 'mercado') {
            categorySelect.value = 'Alimentação';
            descriptionInput.value = 'Mercado';
        } else if (action === 'transporte') {
            categorySelect.value = 'Transporte';
            descriptionInput.value = 'Combustível/Uber';
        } else if (action === 'salario') {
            typeSelect.value = 'Entrada';
            categorySelect.value = 'Salário/Renda';
            descriptionInput.value = 'Salário';
        }
        valueInput.focus();
    });
});

function initAuth() {
    initTheme();
    const authData = localStorage.getItem('financesAuthToken');
    if (authData === 'true') {
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        initApp();
    }
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = appPassword.value;
    
    if (!pass) {
        showToast('Preencha a senha!', 'error');
        return;
    }

    const authSubmitBtn = authForm.querySelector('button[type="submit"]');
    authSubmitBtn.textContent = 'Verificando...';
    authSubmitBtn.disabled = true;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('financesAuthToken', 'true');
            authScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
            initApp();
            showToast('Acesso liberado!');
        } else {
            showToast(data.message || 'Senha incorreta!', 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar com o servidor.', 'error');
    } finally {
        authSubmitBtn.textContent = 'Entrar no Sistema';
        authSubmitBtn.disabled = false;
    }
});

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('financesAuthToken');
    location.reload();
});

async function loadCloudData() {
    try {
        const res = await fetch('/api/data');
        if (res.ok) {
            const data = await res.json();
            transactions = data.transactions || [];
            goals = data.goals || [];
            updateUI();
        } else {
            showToast('Erro ao ler a nuvem.', 'error');
        }
    } catch (e) {
        showToast('Falha na conexão com a nuvem.', 'error');
    }
}

async function saveData() {
    try {
        const payload = { transactions, goals };
        await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        showToast('Erro ao salvar na nuvem!', 'error');
    }
}

function initApp() {
    displayUser1.textContent = user1Name;
    displayUser2.textContent = user2Name;
    tabUser1.textContent = user1Name;
    tabUser2.textContent = user2Name;

    contributePerson.innerHTML = `
        <option value="${user1Name}">${user1Name}</option>
        <option value="${user2Name}">${user2Name}</option>
    `;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    currentMonth = `${year}-${month}`;
    monthSelect.value = currentMonth;

    loadCloudData();
}

function getChartColors() {
    const isDark = htmlDoc.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#f8fafc' : '#1e293b',
        empty: isDark ? '#334155' : '#e2e8f0',
        catColors: isDark ? 
            ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'] : 
            ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#94a3b8']
    };
}

function renderCasalCharts(income, expense, monthTransactions) {
    if (financeChartGeral) financeChartGeral.destroy();
    if (categoryChartGeral) categoryChartGeral.destroy();
    
    const colors = getChartColors();
    const hasMainData = income > 0 || expense > 0;

    financeChartGeral = new Chart(ctxFinanceGeral, {
        type: 'doughnut',
        data: {
            labels: ['Entradas Totais', 'Saídas Totais'],
            datasets: [{
                data: hasMainData ? [income, expense] : [1],
                backgroundColor: hasMainData ? ['#10b981', '#ef4444'] : [colors.empty],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', display: hasMainData, labels: { color: colors.text, font: { family: 'Inter', size: 12, weight: '500' } } },
                tooltip: { enabled: hasMainData }
            }
        }
    });

    const expenses = monthTransactions.filter(t => t.type === 'Saida');
    const catMap = {};
    expenses.forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.value;
    });
    
    const catLabels = Object.keys(catMap);
    const catData = Object.values(catMap);
    const hasCatData = catData.length > 0;

    categoryChartGeral = new Chart(ctxCategoryGeral, {
        type: 'doughnut',
        data: {
            labels: hasCatData ? catLabels : ['Sem Gastos'],
            datasets: [{
                data: hasCatData ? catData : [1],
                backgroundColor: hasCatData ? colors.catColors : [colors.empty],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', display: hasCatData, labels: { color: colors.text, font: { family: 'Inter', size: 12, weight: '500' } } },
                tooltip: { enabled: hasCatData }
            }
        }
    });
}

function renderGoals() {
    goalsContainer.innerHTML = '';
    if (goals.length === 0) {
        goalsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; grid-column: 1 / -1;">Nenhuma meta criada ainda. Comecem a sonhar juntos!</p>';
        return;
    }

    goals.forEach(goal => {
        const percent = Math.min((goal.current / goal.target) * 100, 100).toFixed(1);
        
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-card-header">
                <h4>${goal.name}</h4>
                <span class="goal-progress-text">${percent}% Concluído</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <div class="goal-values">
                <span>Atual: ${formatCurrency(goal.current)}</span>
                <span>Alvo: ${formatCurrency(goal.target)}</span>
            </div>
            <div class="goal-actions">
                <button class="edit-btn" onclick="openContributeForm('${goal.id}')">Adicionar R$</button>
                <button class="delete-btn" onclick="deleteGoal('${goal.id}')">Excluir</button>
            </div>
        `;
        goalsContainer.appendChild(card);
    });
}

function updateCasalView() {
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const income = monthTransactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.value, 0);
    const expense = monthTransactions.filter(t => t.type === 'Saida').reduce((acc, t) => acc + t.value, 0);
    const balance = income - expense;

    geralIncomeEl.textContent = formatCurrency(income);
    geralExpenseEl.textContent = formatCurrency(expense);
    geralBalanceEl.textContent = formatCurrency(balance);

    renderCasalCharts(income, expense, monthTransactions);
    renderGoals();
}

function updateIndividualView(activeName) {
    const userTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.person === activeName);
    
    const income = userTransactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.value, 0);
    const expense = userTransactions.filter(t => t.type === 'Saida').reduce((acc, t) => acc + t.value, 0);
    const balance = income - expense;

    indivIncomeEl.textContent = formatCurrency(income);
    indivExpenseEl.textContent = formatCurrency(expense);
    indivBalanceEl.textContent = formatCurrency(balance);

    tableBody.innerHTML = '';
    const sortedData = [...userTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedData.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td style="color: ${transaction.type === 'Entrada' ? '#10b981' : '#ef4444'}; font-weight: 600;">${transaction.type}</td>
            <td>${transaction.method}</td>
            <td>${transaction.category}</td>
            <td style="color: var(--text-muted);">${transaction.description || '-'}</td>
            <td style="font-weight: 700;">${formatCurrency(transaction.value)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editTransaction('${transaction.id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">Excluir</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateUI() {
    if (currentTab === 'Geral') {
        currentViewTitle.textContent = 'Visão Geral do Casal';
        viewCasal.classList.remove('hidden');
        viewIndividual.classList.add('hidden');
        updateCasalView();
    } else {
        const activeName = currentTab === 'User1' ? user1Name : user2Name;
        currentViewTitle.textContent = `Painel de ${activeName}`;
        viewCasal.classList.add('hidden');
        viewIndividual.classList.remove('hidden');
        updateIndividualView(activeName);
    }
}

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        
        if (editingId) resetForm();
        updateUI();
        
        if (window.innerWidth <= 1024) toggleMenu();
    });
});

monthSelect.addEventListener('change', (e) => {
    currentMonth = e.target.value;
    updateUI();
});

window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
    showToast('Lançamento excluído!', 'error');
};

window.editTransaction = function(id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;

    editingId = id;
    dateInput.value = t.date;
    typeSelect.value = t.type;
    methodSelect.value = t.method;
    categorySelect.value = t.category;
    descriptionInput.value = t.description;
    
    let valStr = (t.value).toFixed(2).replace('.', ',');
    valStr = valStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    valueInput.value = "R$ " + valStr;

    submitBtn.textContent = 'Salvar Alteração';
    submitBtn.classList.add('edit-mode');
    cancelEditBtn.classList.remove('hidden');
    
    valueInput.focus();
};

function resetForm() {
    const lastDate = dateInput.value;
    formFinance.reset();
    editingId = null;
    dateInput.value = lastDate;
    submitBtn.textContent = 'Lançar';
    submitBtn.classList.remove('edit-mode');
    cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', () => {
    resetForm();
    showToast('Edição cancelada', 'info');
});

formFinance.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const numericValue = parseMoney(valueInput.value);
    if (numericValue <= 0) {
        showToast('Digite um valor válido!', 'error');
        return;
    }

    const activeName = currentTab === 'User1' ? user1Name : user2Name;

    const transactionData = {
        date: dateInput.value,
        person: activeName,
        type: typeSelect.value,
        method: methodSelect.value,
        category: categorySelect.value,
        description: descriptionInput.value,
        value: numericValue
    };

    if (editingId) {
        const index = transactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            transactions[index] = { ...transactionData, id: editingId };
            showToast('Lançamento atualizado!');
        }
    } else {
        transactions.push({ ...transactionData, id: generateId() });
        showToast('Lançamento salvo com sucesso!');
    }
    
    const transactionMonth = transactionData.date.substring(0, 7);
    if (transactionMonth !== currentMonth) {
        currentMonth = transactionMonth;
        monthSelect.value = currentMonth;
    }

    saveData();
    resetForm();
    updateUI();
});

btnShowGoalForm.addEventListener('click', () => {
    formNewGoal.classList.remove('hidden');
    formContribute.classList.add('hidden');
    btnShowGoalForm.classList.add('hidden');
    goalNameInput.focus();
});

btnCancelGoal.addEventListener('click', () => {
    formNewGoal.classList.add('hidden');
    btnShowGoalForm.classList.remove('hidden');
    formNewGoal.reset();
});

formNewGoal.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = goalNameInput.value.trim();
    const target = parseMoney(goalTargetInput.value);

    if (target <= 0) {
        showToast('Valor alvo inválido!', 'error');
        return;
    }

    goals.push({ id: generateId(), name, target, current: 0 });
    saveData();
    formNewGoal.reset();
    formNewGoal.classList.add('hidden');
    btnShowGoalForm.classList.remove('hidden');
    updateUI();
    showToast('Nova meta criada!');
});

window.deleteGoal = function(id) {
    goals = goals.filter(g => g.id !== id);
    saveData();
    updateUI();
    showToast('Meta excluída!', 'error');
}

window.openContributeForm = function(id) {
    formContribute.classList.remove('hidden');
    formNewGoal.classList.add('hidden');
    btnShowGoalForm.classList.add('hidden');
    contributeGoalId.value = id;
    contributeValue.focus();
}

btnCancelContribute.addEventListener('click', () => {
    formContribute.classList.add('hidden');
    btnShowGoalForm.classList.remove('hidden');
    formContribute.reset();
});

formContribute.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = contributeGoalId.value;
    const person = contributePerson.value;
    const amount = parseMoney(contributeValue.value);

    if (amount <= 0) {
        showToast('Valor inválido!', 'error');
        return;
    }

    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    goal.current += amount;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    transactions.push({
        id: generateId(),
        date: `${year}-${month}-${day}`,
        person: person,
        type: 'Saida',
        method: 'Pix',
        category: 'Investimento',
        description: `Contribuição: ${goal.name}`,
        value: amount
    });

    saveData();
    formContribute.reset();
    formContribute.classList.add('hidden');
    btnShowGoalForm.classList.remove('hidden');
    updateUI();
    showToast(`R$ adicionado e debitado de ${person}!`);
});

btnSaveJson.addEventListener('click', function() {
    const payload = { transactions, goals };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financas_${user1Name}_${user2Name}.json`.toLowerCase().replace(/\s+/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup gerado com sucesso!');
});

inputLoadJson.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            if (Array.isArray(parsedData)) {
                transactions = parsedData;
                goals = [];
            } else {
                transactions = parsedData.transactions || [];
                goals = parsedData.goals || [];
            }
            saveData();
            updateUI();
            showToast('Backup restaurado com sucesso!');
        } catch (error) {
            showToast('Erro ao ler o arquivo JSON.', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

initAuth();