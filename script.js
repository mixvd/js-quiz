/** 
 * Main Quiz Application
 * This script handles the quiz game logic, including:
 * - Theme selection
 * - Question management
 * - Score tracking
 * - High scores
 * - UI updates
 */

import quizzes from './data/quizManager.js';

$(document).ready(function () {
    // Player state variables
    let playerName = '';
    let selectedQuiz = null;

    /** 
     * Generates theme cards for quiz selection
     * Creates clickable cards for each quiz theme and handles their selection
     */
    function generateThemeCards() {
        const themesHtml = quizzes.map((quiz, index) => `
            <div class="quiz-theme-card" data-quiz-index="${index}">
                <div class="theme-icon">${quiz.icon}</div>
                <div class="theme-name">${quiz.name}</div>
                <div class="theme-description">${quiz.description}</div>
            </div>
        `).join('');

        $('#quiz-themes').html(themesHtml);

        // Click handler for cards
        $('.quiz-theme-card').on('click', function () {
            $('.quiz-theme-card').removeClass('selected');
            $(this).addClass('selected');
            selectedQuiz = quizzes[$(this).data('quiz-index')];
            updateThemeUI(selectedQuiz);
        });
    }

    // Initialize theme cards on page load
    generateThemeCards();

    /** 
     * Handles the start quiz form submission
     * Validates player name and theme selection before starting the quiz
     */
    $('#start-quiz').on('click', function () {
        playerName = $('#player-name').val().trim();
        const selectedQuizCard = $('.quiz-theme-card.selected');

        if (!playerName) {
            showError('name-error');
            return;
        }

        if (selectedQuizCard.length === 0) {
            showError('theme-error');
            return;
        }

        // Hide High Scores button before showing the quiz
        $('.header-actions').hide();
        $('#player-form').hide();
        $('#quiz-container').show();
        initQuiz(selectedQuiz.questions);
    });

    // Quiz state variables
    let currentQuizQuestions = [];
    let shuffledQuestions = [];
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];

    /** 
     * Shuffles array elements using Fisher-Yates algorithm
     */
    function shuffleArray(array) {
        let currentIndex = array.length;
        let temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /** 
     * Updates the UI theme based on selected quiz
     * Changes colors, icons, and gradients according to the quiz theme
     */
    function updateThemeUI(quiz) {
        // Update visual elements based on theme
        const themeColors = {
            'Culture Générale': {
                primary: '#667eea',
                secondary: '#764ba2',
                icon: '🎯'
            },
            'Sciences': {
                primary: '#38b2ac',
                secondary: '#0694a2',
                icon: '🔬'
            },
            'Histoire': {
                primary: '#9f7aea',
                secondary: '#805ad5',
                icon: '📚'
            }
        };

        const theme = themeColors[quiz.name] || themeColors['Culture Générale'];

        // Update theme colors
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);

        // Update quiz interface
        $('.quiz-header .quiz-logo').text(theme.icon);
        $('.quiz-header h1').text(`Quiz ${quiz.name}`);
        $('.quiz-subtitle').text(quiz.description);

        // Update gradients
        $('#gradient-low stop:first-child').css('stop-color', theme.primary);
        $('#gradient-low stop:last-child').css('stop-color', theme.secondary);
        $('#gradient-medium stop:first-child').css('stop-color', theme.primary);
        $('#gradient-medium stop:last-child').css('stop-color', theme.secondary);
        $('#gradient-high stop:first-child').css('stop-color', theme.primary);
        $('#gradient-high stop:last-child').css('stop-color', theme.secondary);
    }

    /** 
     * Initializes the quiz with selected questions
     * Shuffles questions and answers, resets score and progress
     */
    function initQuiz(quizQuestions) {
        currentQuizQuestions = quizQuestions;
        currentQuestion = 0;
        score = 0;
        userAnswers = [];

        // Update interface with selected theme
        updateThemeUI(selectedQuiz);

        // Shuffle questions and create new array with shuffled choices
        shuffledQuestions = currentQuizQuestions.map(q => {
            const choicesWithIndex = q.choices.map((choice, index) => ({
                text: choice,
                originalIndex: index
            }));

            const shuffledChoices = shuffleArray([...choicesWithIndex]);

            const newCorrectAnswerIndex = shuffledChoices.findIndex(
                choice => choice.originalIndex === q.correctAnswer
            );

            return {
                question: q.question,
                choices: shuffledChoices.map(c => c.text),
                correctAnswer: newCorrectAnswerIndex
            };
        });

        shuffledQuestions = shuffleArray(shuffledQuestions);

        // Initialize progress to 0%
        $('#progress').css('width', '0%');
        $('#progress-text').text('0%');
        $('#current-question').text('1');

        showQuestion(currentQuestion);
        $('#quiz').show();
        $('#results').hide();
    }

    /** 
     * Displays the current question and its choices
     * Updates progress indicators and question counter
     */
    function showQuestion(questionIndex) {
        const question = shuffledQuestions[questionIndex];
        $('#question').text(`${question.question}`);

        const choicesHtml = question.choices.map((choice, index) =>
            `<div class="choice" data-index="${index}">${choice}</div>`
        ).join('');

        $('#choices').html(choicesHtml);

        $('.choice').on('click', function () {
            $('.choice').removeClass('selected');
            $(this).addClass('selected');
        });

        // Update all elements displaying the question number
        const currentQuestionNumber = questionIndex + 1;
        $('#progress').css('width', `${(questionIndex / shuffledQuestions.length) * 100}%`);
        $('#progress-text').text(`${Math.round((questionIndex / shuffledQuestions.length) * 100)}%`);
        $('#current-question').text(currentQuestionNumber);
        $('#current-question-number').text(currentQuestionNumber);
    }

    // Handle answer submission
    $('#submit-btn').on('click', function () {
        const selectedChoice = $('.choice.selected');

        if (selectedChoice.length === 0) {
            // Add container for answer error message in quiz HTML
            if (!$('#answer-error').length) {
                $('#choices').after(`
                    <div class="error-message" id="answer-error">
                        <span class="error-icon">⚠️</span>
                        <span class="error-text">Veuillez sélectionner une réponse</span>
                    </div>
                `);
            }
            showError('answer-error');
            return;
        }

        const userAnswer = parseInt(selectedChoice.data('index'));
        const currentQuestionData = shuffledQuestions[currentQuestion];

        userAnswers.push({
            question: currentQuestionData.question,
            userChoice: currentQuestionData.choices[userAnswer],
            correctChoice: currentQuestionData.choices[currentQuestionData.correctAnswer],
            isCorrect: userAnswer === currentQuestionData.correctAnswer
        });

        if (userAnswer === currentQuestionData.correctAnswer) {
            score++;
        }

        currentQuestion++;
        if (currentQuestion < shuffledQuestions.length) {
            showQuestion(currentQuestion);
        } else {
            showResults();
        }
    });

    /** 
     * Displays the final quiz results
     * Shows score, feedback message, and answer review
     * Checks for new high score
     */
    function showResults() {
        $('#quiz').hide();
        $('#results').show();

        const percentage = (score / shuffledQuestions.length) * 100;
        $('#score').text(`${percentage.toFixed(0)}%`);

        // Check for new high score without displaying the table
        const isNewHighScore = window.highScores.checkAndDisplayNewHighScore(
            selectedQuiz.name,
            playerName,
            Math.round(percentage)
        );

        if (isNewHighScore) {
            $('#score-message').text("Nouveau record ! Félicitations !");
            $('.score-circle').addClass('new-high-score');
        } else {
            // Custom message based on score
            let message = '';
            if (percentage >= 90) {
                message = "Excellent ! Vous êtes un expert !";
            } else if (percentage >= 70) {
                message = "Très bien ! Vous avez de solides connaissances !";
            } else if (percentage >= 50) {
                message = "Pas mal ! Continuez à apprendre !";
            } else {
                message = "Continuez vos efforts, la pratique fait la perfection !";
            }
            $('#score-message').text(message);
        }

        // Precise calculation for circle animation
        const circle = document.querySelector('.score-circle-progress');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;

        $('#gradient stop:first-child').css('stop-color', '#667eea');
        $('#gradient stop:last-child').css('stop-color', '#764ba2');

        const reviewHtml = userAnswers.map((answer, index) => `
            <div class="answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <p class="question-text">Question ${index + 1}: ${answer.question}</p>
                <p class="user-answer">Votre réponse: ${answer.userChoice}</p>
                ${!answer.isCorrect ? `<p class="correct-answer">Bonne réponse: ${answer.correctChoice}</p>` : ''}
            </div>
        `).join('');

        $('#answers-review').html(reviewHtml);
    }

    /** 
     * Shows error messages with animation
     */
    function showError(elementId) {
        const errorElement = $(`#${elementId}`);
        errorElement.addClass('show');

        // Add shake effect to the associated element
        if (elementId === 'name-error') {
            $('#player-name').addClass('shake');
        } else if (elementId === 'theme-error') {
            $('#quiz-themes').addClass('shake');
        } else if (elementId === 'answer-error') {
            $('#choices').addClass('shake');
        }

        // Remove shake effect after animation
        setTimeout(() => {
            $('.shake').removeClass('shake');
        }, 500);

        // Hide error message after 3 seconds
        setTimeout(() => {
            errorElement.removeClass('show');
        }, 3000);
    }

    // Error message hide handlers
    $('#player-name').on('input', function () {
        // Hide name error on input
        $('#name-error').removeClass('show');
    });

    // Theme selection error handler
    $(document).on('click', '.quiz-theme-card', function () {
        // Hide theme error on selection
        $('#theme-error').removeClass('show');
    });

    // Answer selection error handler
    $(document).on('click', '.choice', function () {
        // Hide answer error on selection
        $('#answer-error').removeClass('show');
    });

    /** 
     * Handles quiz restart
     * Resets all game state variables and UI elements
     */
    $('#restart-btn').on('click', function () {
        // Reset variables
        score = 0;
        userAnswers = [];
        currentQuestion = 0;
        selectedQuiz = null;

        // Reset interface
        $('#results').hide();
        $('#quiz-container').hide();
        $('#player-name').val('');

        // Show High Scores button
        $('.header-actions').show();

        // Reset header with default values
        $('.quiz-logo').text('👋');
        $('.quiz-header h1').text('Bienvenue au Quiz');
        $('.quiz-subtitle').text('Entrez votre nom et choisissez un thème');

        // Reset theme selection
        $('.quiz-theme-card').removeClass('selected');

        // Reset default colors
        document.documentElement.style.setProperty('--primary-color', '#667eea');

        // Show start form
        $('#player-form').show();
    });

    // High scores modal handlers
    $('#view-highscores').on('click', function () {
        // Show high scores modal
        $('#highscores-modal').addClass('show');
        window.highScores.displayHighScores();
    });

    // Modal close handlers
    $('.modal-close, .modal-overlay').on('click', function (e) {
        // Close modal when clicking close button or overlay
        if (e.target === this) {
            $('#highscores-modal').removeClass('show');
        }
    });

    // Keyboard event handler for modal
    $(document).on('keydown', function (e) {
        // Close modal on Escape key press
        if (e.key === 'Escape') {
            $('#highscores-modal').removeClass('show');
        }
    });
}); 