// --- Theme Logic ---
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');
const html = document.documentElement;

// Check local storage or system preference
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
} else {
    html.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    if (html.classList.contains('dark')) {
        localStorage.theme = 'dark';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        updateChartColors(true);
    } else {
        localStorage.theme = 'light';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        updateChartColors(false);
    }
});

// --- Chart Instances ---
let charts = {};

function updateChartColors(isDark) {
    const textColor = isDark ? '#9CA3AF' : '#4B5563';
    const gridColor = isDark ? '#374151' : '#E5E7EB';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    Object.values(charts).forEach(chart => {
        if (chart.options.scales.x) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
        }
        if (chart.options.scales.y) {
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
        }
        chart.update();
    });
}

function updateCharts(data) {
    // Destroy existing charts if they exist
    if (charts.status) charts.status.destroy();
    if (charts.cities) charts.cities.destroy();
    if (charts.gender) charts.gender.destroy();
    if (charts.age) charts.age.destroy();
    if (charts.deaths) charts.deaths.destroy();

    const isDark = html.classList.contains('dark');
    const textColor = isDark ? '#9CA3AF' : '#4B5563';

    // 1. Status
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        charts.status = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.cases_by_status),
                datasets: [{
                    data: Object.values(data.cases_by_status),
                    backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: textColor } }
                }
            }
        });
    }

    // 2. Cities
    const citiesCtx = document.getElementById('citiesChart');
    if (citiesCtx) {
        charts.cities = new Chart(citiesCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(data.top_cities),
                datasets: [{
                    label: 'Casos',
                    data: Object.values(data.top_cities),
                    backgroundColor: '#3B82F6',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // 3. Gender
    const genderCtx = document.getElementById('genderChart');
    if (genderCtx) {
        charts.gender = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(data.gender_distribution),
                datasets: [{
                    data: Object.values(data.gender_distribution),
                    backgroundColor: ['#EC4899', '#3B82F6', '#9CA3AF'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
            }
        });
    }

    // 4. Age
    const ageCtx = document.getElementById('ageChart');
    if (ageCtx) {
        charts.age = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(data.age_distribution),
                datasets: [{
                    label: 'Casos',
                    data: Object.values(data.age_distribution),
                    backgroundColor: '#10B981',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // 5. Deaths
    const deathsCtx = document.getElementById('deathsChart');
    if (deathsCtx) {
        charts.deaths = new Chart(deathsCtx, {
            type: 'line',
            data: {
                labels: Object.keys(data.deaths_over_time),
                datasets: [{
                    label: 'Fallecidos',
                    data: Object.values(data.deaths_over_time),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { ticks: { maxTicksLimit: 10 } } },
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function fetchData() {
    const applyButton = document.getElementById('applyFilters');
    const originalText = applyButton ? applyButton.innerText : 'Aplicar Filtros';

    if (applyButton) {
        applyButton.innerText = 'Cargando...';
        applyButton.disabled = true;
    }

    try {
        const gender = document.getElementById('genderFilter').value;
        const department = document.getElementById('departmentFilter').value;

        const params = new URLSearchParams();
        if (gender) params.append('gender', gender);
        if (department) params.append('department', department);

        const response = await fetch(`/api/data?${params.toString()}`);
        const data = await response.json();

        // Populate Departments if empty
        const deptSelect = document.getElementById('departmentFilter');
        if (deptSelect.options.length === 1 && data.available_departments) {
            data.available_departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                deptSelect.appendChild(option);
            });
        }

        document.getElementById('total-cases').innerText = data.total_cases.toLocaleString();
        document.getElementById('total-deaths').innerText = data.total_deaths.toLocaleString();

        updateCharts(data);

    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        if (applyButton) {
            applyButton.innerText = originalText;
            applyButton.disabled = false;
        }
    }
}

document.getElementById('applyFilters').addEventListener('click', fetchData);
document.addEventListener('DOMContentLoaded', fetchData);
