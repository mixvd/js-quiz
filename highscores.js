/**
 * High Scores Management Module
 * Handles the storage, display and management of quiz high scores
 * Uses localStorage for persistent storage
 */
$(document).ready(function () {
    // Constants for high scores management
    const HIGH_SCORES_KEY = 'quizHighScores';
    const MAX_HIGH_SCORES = 5; // Maximum number of scores to keep per theme

    /**
     * Data structure in localStorage:
     * {
     *     "Culture Générale": [{ name: "John", score: 95, date: "2024-03-20" }],
     *     "Sciences": [{ name: "Jane", score: 90, date: "2024-03-20" }],
     *     "Histoire": [{ name: "Bob", score: 85, date: "2024-03-20" }]
     * }
     */

    /**
     * Retrieves high scores from localStorage
     */
    function getHighScores() {
        return JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
    }

    /**
     * Saves high scores to localStorage
     */
    function saveHighScores(scores) {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    }

    /**
     * Adds a new score to the high scores list
     */
    function addScore(quizName, playerName, score) {
        const scores = getHighScores();
        // Initialize array for quiz if it doesn't exist
        if (!scores[quizName]) {
            scores[quizName] = [];
        }

        // Add new score with current date
        scores[quizName].push({
            name: playerName,
            score: score,
            date: new Date().toISOString().split('T')[0]
        });

        // Sort scores in descending order
        scores[quizName].sort((a, b) => b.score - a.score);

        // Keep only the top scores
        scores[quizName] = scores[quizName].slice(0, MAX_HIGH_SCORES);

        saveHighScores(scores);
        return isHighScore(quizName, score);
    }

    /**
     * Checks if a score qualifies as a high score
     */
    function isHighScore(quizName, score) {
        const scores = getHighScores();
        const quizScores = scores[quizName] || [];
        
        // Score is high score if less than MAX_HIGH_SCORES exist
        if (quizScores.length < MAX_HIGH_SCORES) return true;
        // Or if it's higher than the lowest current high score
        return score > quizScores[quizScores.length - 1].score;
    }

    /**
     * Displays the high scores in the modal
     * Creates tabs for each quiz theme and their respective score tables
     */
    function displayHighScores() {
        const scores = getHighScores();
        let html = '';

        // Generate tabs for each theme
        let tabsHtml = '<div class="score-tabs">';
        Object.keys(scores).forEach((theme, index) => {
            tabsHtml += `
                <button class="score-tab ${index === 0 ? 'active' : ''}" 
                        data-theme="${theme}">
                    ${theme}
                </button>
            `;
        });
        tabsHtml += '</div>';

        // Generate score tables for each theme
        Object.entries(scores).forEach(([theme, themeScores], index) => {
            html += `
                <div class="score-table ${index === 0 ? 'active' : ''}" 
                     data-theme="${theme}">
                    <h3>${theme}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${themeScores.map((score, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${score.name}</td>
                                    <td>${score.score}%</td>
                                    <td>${score.date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        // Insert HTML into modal container
        $('#modal-highscores-container').html(tabsHtml + html);

        // Setup tab click handlers
        $('.score-tab').on('click', function() {
            const theme = $(this).data('theme');
            const container = $(this).closest('.highscores-container');
            container.find('.score-tab').removeClass('active');
            $(this).addClass('active');
            container.find('.score-table').removeClass('active');
            container.find(`.score-table[data-theme="${theme}"]`).addClass('active');
        });
    }

    /**
     * Checks if a score is a high score and adds it if it is
     */
    function checkAndDisplayNewHighScore(quizName, playerName, score) {
        if (isHighScore(quizName, score)) {
            addScore(quizName, playerName, score);
            return true;
        }
        return false;
    }

    // Export functions to global scope for use in script.js
    window.highScores = {
        addScore,
        isHighScore,
        displayHighScores,
        checkAndDisplayNewHighScore
    };
}); 