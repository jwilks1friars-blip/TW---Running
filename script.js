// Utility function to get the start of a week (Monday)
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get week range string
function getWeekRange(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} - ${formatDate(end)}`;
}

// Get all 7 days of the week
function getWeekDays(date) {
    const start = getWeekStart(date);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map((dayName, index) => {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + index);
        return {
            name: dayName,
            date: dayDate,
            key: formatDate(dayDate)
        };
    });
}

// Generate storage key for a specific date
function getStorageKey(date) {
    return `workout_${formatDate(date)}`;
}

// Default workout data for sub-2:30 marathon training
function getDefaultWorkout(dayName) {
    const defaults = {
        'Monday': {
            distance: '6',
            pace: '7:30',
            notes: 'Easy recovery run. Keep it relaxed.'
        },
        'Tuesday': {
            distance: '8',
            pace: '5:40',
            notes: 'Tempo run: 20 min @ goal pace (5:43/mile), warm up/cool down easy'
        },
        'Wednesday': {
            distance: '10',
            pace: '7:00',
            notes: 'Medium long run. Aerobic effort.'
        },
        'Thursday': {
            distance: '8',
            pace: '5:30',
            notes: 'Track workout: 6x1000m @ 3:25-3:30 with 2 min rest'
        },
        'Friday': {
            distance: '6',
            pace: '8:00',
            notes: 'Easy shakeout. Focus on form and relaxation.'
        },
        'Saturday': {
            distance: '22',
            pace: '6:15',
            notes: 'Long run with 10 miles @ goal marathon pace (5:43/mile)'
        },
        'Sunday': {
            distance: '8',
            pace: '8:00',
            notes: 'Recovery run or rest day. Listen to your body.'
        }
    };
    return defaults[dayName] || { distance: '', pace: '', notes: '' };
}

// Initialize workout data
function initializeWorkoutData(weekDays) {
    weekDays.forEach(day => {
        const storageKey = getStorageKey(day.date);
        if (!localStorage.getItem(storageKey)) {
            const defaultWorkout = getDefaultWorkout(day.name);
            localStorage.setItem(storageKey, JSON.stringify(defaultWorkout));
        }
    });
}

// Load workout data for a specific date
function loadWorkout(date) {
    const storageKey = getStorageKey(date);
    const data = localStorage.getItem(storageKey);
    if (data) {
        return JSON.parse(data);
    }
    return { distance: '', pace: '', notes: '' };
}

// Save workout data for a specific date
function saveWorkout(date, workout) {
    const storageKey = getStorageKey(date);
    localStorage.setItem(storageKey, JSON.stringify(workout));
}

// Check if a workout card is empty
function isEmptyWorkout(workout) {
    return !workout.distance && !workout.pace && !workout.notes;
}

// Render calendar
function renderCalendar(currentDate) {
    const calendar = document.getElementById('calendar');
    const weekDays = getWeekDays(currentDate);
    
    // Initialize data for this week
    initializeWorkoutData(weekDays);
    
    calendar.innerHTML = '';
    
    const isEditMode = document.getElementById('editModeToggle').checked;
    
    weekDays.forEach(day => {
        const workout = loadWorkout(day.date);
        const empty = isEmptyWorkout(workout);
        
        const card = document.createElement('div');
        card.className = `workout-card ${empty ? 'empty' : ''}`;
        card.dataset.date = day.date.getTime();
        
        card.innerHTML = `
            <div class="day-header">${day.name}</div>
            <div class="workout-field">
                <label>Distance (miles)</label>
                <div class="value">${workout.distance || '—'}</div>
                <input type="text" class="distance-input" value="${workout.distance || ''}" placeholder="e.g., 6">
            </div>
            <div class="workout-field">
                <label>Pace (min/mile)</label>
                <div class="value">${workout.pace || '—'}</div>
                <input type="text" class="pace-input" value="${workout.pace || ''}" placeholder="e.g., 7:30">
            </div>
            <div class="workout-field">
                <label>Notes</label>
                <div class="value">${workout.notes || '—'}</div>
                <textarea class="notes-input" placeholder="Workout details...">${workout.notes || ''}</textarea>
            </div>
            <button class="save-btn">Save</button>
        `;
        
        // Add save button handler
        const saveBtn = card.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => {
            const distanceInput = card.querySelector('.distance-input');
            const paceInput = card.querySelector('.pace-input');
            const notesInput = card.querySelector('.notes-input');
            
            const updatedWorkout = {
                distance: distanceInput.value.trim(),
                pace: paceInput.value.trim(),
                notes: notesInput.value.trim()
            };
            
            saveWorkout(day.date, updatedWorkout);
            renderCalendar(currentDate); // Re-render to update display
        });
        
        calendar.appendChild(card);
    });
    
    // Apply edit mode class
    if (isEditMode) {
        calendar.classList.add('edit-mode');
    } else {
        calendar.classList.remove('edit-mode');
    }
}

// Current week date (stored in localStorage)
let currentWeekDate = new Date();
const currentWeekKey = 'currentWeekDate';

// Load current week from localStorage or use today
function loadCurrentWeek() {
    const stored = localStorage.getItem(currentWeekKey);
    if (stored) {
        currentWeekDate = new Date(parseInt(stored));
    }
}

// Save current week to localStorage
function saveCurrentWeek(date) {
    localStorage.setItem(currentWeekKey, date.getTime().toString());
}

// Initialize application
function init() {
    loadCurrentWeek();
    
    // Update week display
    const weekDisplay = document.getElementById('weekDisplay');
    weekDisplay.textContent = `Week of ${getWeekRange(currentWeekDate)}`;
    
    // Render initial calendar
    renderCalendar(currentWeekDate);
    
    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekDate = new Date(currentWeekDate);
        currentWeekDate.setDate(currentWeekDate.getDate() - 7);
        saveCurrentWeek(currentWeekDate);
        weekDisplay.textContent = `Week of ${getWeekRange(currentWeekDate)}`;
        renderCalendar(currentWeekDate);
    });
    
    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekDate = new Date(currentWeekDate);
        currentWeekDate.setDate(currentWeekDate.getDate() + 7);
        saveCurrentWeek(currentWeekDate);
        weekDisplay.textContent = `Week of ${getWeekRange(currentWeekDate)}`;
        renderCalendar(currentWeekDate);
    });
    
    // Edit mode toggle
    document.getElementById('editModeToggle').addEventListener('change', (e) => {
        const calendar = document.getElementById('calendar');
        if (e.target.checked) {
            calendar.classList.add('edit-mode');
        } else {
            calendar.classList.remove('edit-mode');
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

