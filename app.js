// LearnIt - Educational Game Application
class LearnItApp {
    constructor() {
        this.currentTopic = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.customQuestions = this.loadCustomQuestions();
        this.builtInQuestions = this.generateBuiltInQuestions();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displaySavedQuestions();
    }

    setupEventListeners() {
        // Mode toggle
        document.getElementById('studentModeBtn').addEventListener('click', () => this.switchMode('student'));
        document.getElementById('teacherModeBtn').addEventListener('click', () => this.switchMode('teacher'));

        // Topic selection
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topic = e.currentTarget.dataset.topic;
                this.startTopic(topic);
            });
        });

        // Answer submission
        document.getElementById('submitBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });

        // Hint button
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());

        // Next question
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());

        // Back to topics
        document.getElementById('backToTopicsBtn').addEventListener('click', () => this.backToTopics());

        // Teacher mode - save question
        document.getElementById('saveQuestionBtn').addEventListener('click', () => this.saveQuestion());
    }

    switchMode(mode) {
        const studentMode = document.getElementById('studentMode');
        const teacherMode = document.getElementById('teacherMode');
        const studentBtn = document.getElementById('studentModeBtn');
        const teacherBtn = document.getElementById('teacherModeBtn');

        if (mode === 'student') {
            studentMode.classList.add('active');
            teacherMode.classList.remove('active');
            studentBtn.classList.add('active');
            teacherBtn.classList.remove('active');
            this.backToTopics();
        } else {
            studentMode.classList.remove('active');
            teacherMode.classList.add('active');
            studentBtn.classList.remove('active');
            teacherBtn.classList.add('active');
        }
    }

    startTopic(topic) {
        this.currentTopic = topic;
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;

        // Get questions for this topic
        if (topic === 'custom') {
            this.questions = this.customQuestions;
        } else {
            this.questions = this.builtInQuestions.filter(q => q.topic === topic);
        }

        // Shuffle questions for variety
        this.questions = this.shuffleArray([...this.questions]);

        if (this.questions.length === 0) {
            alert('No questions available for this topic yet! Teachers can add questions in Teacher Mode.');
            return;
        }

        // Show question screen
        document.getElementById('welcomeScreen').classList.remove('active');
        document.getElementById('questionScreen').classList.add('active');

        this.displayQuestion();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showCompletion();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        // Update header
        document.getElementById('currentTopic').textContent = this.formatTopic(this.currentTopic);
        document.getElementById('questionCount').textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;

        // Display question
        document.getElementById('questionText').innerHTML = question.question;

        // Display visual aid
        this.displayVisualAid(question);

        // Reset answer input
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').focus();

        // Hide feedback and explanation
        document.getElementById('feedback').classList.remove('show', 'correct', 'incorrect');
        document.getElementById('explanation').classList.remove('show');
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-block';
    }

    displayVisualAid(question) {
        const visualAid = document.getElementById('visualAid');
        visualAid.innerHTML = '';

        if (question.visual) {
            if (question.topic === 'fractions') {
                this.createFractionVisual(visualAid, question.visual);
            } else if (['addition', 'subtraction', 'multiplication', 'division'].includes(question.topic)) {
                this.createMathVisual(visualAid, question.visual);
            }
        }
    }

    createFractionVisual(container, visual) {
        const { numerator, denominator } = visual;
        const wrapper = document.createElement('div');
        wrapper.className = 'fraction-visual';
        
        for (let i = 0; i < denominator; i++) {
            const slice = document.createElement('div');
            slice.className = 'pizza-slice';
            if (i < numerator) {
                slice.classList.add('filled');
            }
            wrapper.appendChild(slice);
        }
        
        container.appendChild(wrapper);
    }

    createMathVisual(container, visual) {
        const wrapper = document.createElement('div');
        wrapper.className = 'number-visual';

        if (Array.isArray(visual.numbers)) {
            visual.numbers.forEach(num => {
                for (let i = 0; i < Math.min(num, 10); i++) {
                    const block = document.createElement('div');
                    block.className = 'number-block';
                    block.textContent = '●';
                    wrapper.appendChild(block);
                }
                if (visual.numbers.indexOf(num) < visual.numbers.length - 1) {
                    const operator = document.createElement('div');
                    operator.style.fontSize = '2em';
                    operator.style.fontWeight = 'bold';
                    operator.style.color = '#667eea';
                    operator.textContent = visual.operator || '+';
                    wrapper.appendChild(operator);
                }
            });
        }

        container.appendChild(wrapper);
    }

    checkAnswer() {
        const userAnswer = document.getElementById('answerInput').value.trim();
        const question = this.questions[this.currentQuestionIndex];
        const feedback = document.getElementById('feedback');
        const explanation = document.getElementById('explanation');

        if (!userAnswer) {
            alert('Please enter an answer!');
            return;
        }

        const isCorrect = this.compareAnswers(userAnswer, question.answer);

        feedback.classList.add('show');
        explanation.classList.add('show');

        if (isCorrect) {
            this.correctAnswers++;
            feedback.classList.add('correct');
            feedback.innerHTML = this.getPositiveFeedback();
            explanation.innerHTML = `<strong>✅ Great job!</strong> ${question.explanation}`;
        } else {
            feedback.classList.add('incorrect');
            feedback.innerHTML = `Not quite right. The answer is <strong>${question.answer}</strong>. Let's learn why!`;
            explanation.innerHTML = `<strong>📚 Let's understand:</strong> ${question.explanation}`;
        }

        document.getElementById('submitBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'inline-block';
    }

    compareAnswers(userAnswer, correctAnswer) {
        // Normalize answers for comparison
        const normalize = (str) => str.toString().toLowerCase().trim().replace(/\s+/g, '');
        return normalize(userAnswer) === normalize(correctAnswer);
    }

    getPositiveFeedback() {
        const messages = [
            '🎉 Awesome! You got it!',
            '⭐ Excellent work!',
            '🌟 You are a star!',
            '👏 Outstanding!',
            '🎊 Perfect answer!',
            '💪 You are doing great!',
            '🚀 Amazing job!',
            '🏆 Fantastic!',
            '✨ Brilliant!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showHint() {
        const question = this.questions[this.currentQuestionIndex];
        if (question.hint) {
            alert(`💡 Hint: ${question.hint}`);
        } else {
            alert('💡 Hint: Take your time and think about it step by step!');
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
    }

    showCompletion() {
        const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);
        let message = `🎉 Great job! You completed all questions!\n\n`;
        message += `You got ${this.correctAnswers} out of ${this.questions.length} correct (${percentage}%).\n\n`;
        
        if (percentage === 100) {
            message += '🏆 Perfect score! You are amazing!';
        } else if (percentage >= 80) {
            message += '⭐ Excellent work! Keep it up!';
        } else if (percentage >= 60) {
            message += '👍 Good job! Practice makes perfect!';
        } else {
            message += '💪 Keep learning! You are getting better!';
        }

        alert(message);
        this.backToTopics();
    }

    backToTopics() {
        document.getElementById('questionScreen').classList.remove('active');
        document.getElementById('welcomeScreen').classList.add('active');
        this.currentTopic = null;
    }

    formatTopic(topic) {
        return topic.charAt(0).toUpperCase() + topic.slice(1);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Generate built-in questions
    generateBuiltInQuestions() {
        return [
            // Fractions
            {
                topic: 'fractions',
                question: 'If you have a pizza cut into 4 equal slices and you eat 1 slice, what fraction of the pizza did you eat?',
                answer: '1/4',
                hint: 'Think about the slice you ate (1) out of the total slices (4).',
                explanation: 'When you eat 1 slice out of 4 equal slices, you ate 1/4 (one-fourth) of the pizza. The top number (numerator) is what you ate, and the bottom number (denominator) is the total pieces.',
                visual: { numerator: 1, denominator: 4 }
            },
            {
                topic: 'fractions',
                question: 'What is 1/2 + 1/2?',
                answer: '1',
                hint: 'When you add two halves, you get a whole!',
                explanation: 'When you add 1/2 and 1/2 together, you get 2/2, which equals 1 whole. Think of it as having two halves of a pizza - that makes one complete pizza!',
                visual: { numerator: 2, denominator: 2 }
            },
            {
                topic: 'fractions',
                question: 'If a chocolate bar has 8 pieces and you eat 3 pieces, what fraction did you eat?',
                answer: '3/8',
                hint: 'Count the pieces you ate over the total pieces.',
                explanation: 'You ate 3 pieces out of 8 total pieces, which is written as 3/8. The numerator (3) represents the pieces you ate, and the denominator (8) represents the total pieces.',
                visual: { numerator: 3, denominator: 8 }
            },

            // Addition
            {
                topic: 'addition',
                question: 'What is 5 + 3?',
                answer: '8',
                hint: 'Count all the dots together!',
                explanation: 'When you have 5 things and add 3 more things, you have 8 things in total. 5 + 3 = 8',
                visual: { numbers: [5, 3], operator: '+' }
            },
            {
                topic: 'addition',
                question: 'What is 7 + 6?',
                answer: '13',
                hint: 'Try counting on your fingers, or break it into 7 + 3 + 3',
                explanation: 'When you add 7 and 6, you get 13. One way to think about it: 7 + 3 = 10, and then 10 + 3 = 13!',
                visual: { numbers: [7, 6], operator: '+' }
            },
            {
                topic: 'addition',
                question: 'If you have 4 apples and your friend gives you 5 more, how many apples do you have?',
                answer: '9',
                hint: 'Start with 4 and count up 5 more.',
                explanation: 'You start with 4 apples, and when you add 5 more apples, you have 9 apples total. 4 + 5 = 9',
                visual: { numbers: [4, 5], operator: '+' }
            },

            // Subtraction
            {
                topic: 'subtraction',
                question: 'What is 10 - 4?',
                answer: '6',
                hint: 'Start with 10 and take away 4.',
                explanation: 'When you start with 10 and take away 4, you are left with 6. 10 - 4 = 6',
                visual: { numbers: [10], operator: '-' }
            },
            {
                topic: 'subtraction',
                question: 'If you have 8 cookies and eat 3, how many cookies are left?',
                answer: '5',
                hint: 'Take 3 away from 8.',
                explanation: 'You started with 8 cookies. After eating 3 cookies, you have 5 cookies left. 8 - 3 = 5',
                visual: { numbers: [8], operator: '-' }
            },
            {
                topic: 'subtraction',
                question: 'What is 15 - 7?',
                answer: '8',
                hint: 'Think: 15 - 5 = 10, then 10 - 2 = 8',
                explanation: 'When you subtract 7 from 15, you get 8. You can break it down: 15 - 5 = 10, then 10 - 2 = 8.',
                visual: { numbers: [15], operator: '-' }
            },

            // Multiplication
            {
                topic: 'multiplication',
                question: 'What is 3 × 4?',
                answer: '12',
                hint: 'Think of 3 groups of 4, or 4 + 4 + 4',
                explanation: 'Multiplication is repeated addition. 3 × 4 means you have 3 groups of 4, which equals 4 + 4 + 4 = 12',
                visual: { numbers: [3, 4], operator: '×' }
            },
            {
                topic: 'multiplication',
                question: 'What is 5 × 2?',
                answer: '10',
                hint: 'Think of 5 groups of 2, or 2 + 2 + 2 + 2 + 2',
                explanation: '5 × 2 means 5 groups of 2. That is the same as 2 + 2 + 2 + 2 + 2 = 10',
                visual: { numbers: [5, 2], operator: '×' }
            },
            {
                topic: 'multiplication',
                question: 'If each box has 6 crayons and you have 3 boxes, how many crayons do you have?',
                answer: '18',
                hint: 'Think 6 + 6 + 6, or 3 × 6',
                explanation: 'Each box has 6 crayons, and you have 3 boxes. So you have 3 × 6 = 18 crayons total.',
                visual: { numbers: [3, 6], operator: '×' }
            },

            // Division
            {
                topic: 'division',
                question: 'If you have 12 cookies and share them equally among 3 friends, how many cookies does each friend get?',
                answer: '4',
                hint: 'Divide 12 into 3 equal groups.',
                explanation: 'When you divide 12 cookies among 3 friends equally, each friend gets 4 cookies. 12 ÷ 3 = 4',
                visual: { numbers: [12, 3], operator: '÷' }
            },
            {
                topic: 'division',
                question: 'What is 20 ÷ 4?',
                answer: '5',
                hint: 'How many groups of 4 can you make from 20?',
                explanation: 'Division asks: how many groups of 4 are in 20? The answer is 5, because 4 × 5 = 20.',
                visual: { numbers: [20, 4], operator: '÷' }
            },
            {
                topic: 'division',
                question: 'If you have 15 pencils and want to put them in 5 equal groups, how many pencils in each group?',
                answer: '3',
                hint: 'Divide 15 by 5.',
                explanation: 'When you divide 15 pencils into 5 equal groups, each group has 3 pencils. 15 ÷ 5 = 3',
                visual: { numbers: [15, 5], operator: '÷' }
            }
        ];
    }

    // Teacher Mode - Save Question
    saveQuestion() {
        const topic = document.getElementById('questionTopic').value;
        const tags = document.getElementById('questionTag').value;
        const questionText = document.getElementById('questionPrompt').value.trim();
        const answer = document.getElementById('questionAnswer').value.trim();
        const hint = document.getElementById('questionHint').value.trim();
        const explanation = document.getElementById('questionExplanation').value.trim();

        if (!questionText || !answer || !explanation) {
            alert('Please fill in the question, answer, and explanation fields!');
            return;
        }

        const newQuestion = {
            topic: topic,
            tags: tags,
            question: questionText,
            answer: answer,
            hint: hint || 'Take your time and think it through!',
            explanation: explanation,
            id: Date.now()
        };

        this.customQuestions.push(newQuestion);
        this.saveCustomQuestions();
        this.displaySavedQuestions();

        // Clear form
        document.getElementById('questionPrompt').value = '';
        document.getElementById('questionAnswer').value = '';
        document.getElementById('questionHint').value = '';
        document.getElementById('questionExplanation').value = '';
        document.getElementById('questionTag').value = '';

        alert('✅ Question saved successfully!');
    }

    displaySavedQuestions() {
        const list = document.getElementById('questionList');
        list.innerHTML = '';

        if (this.customQuestions.length === 0) {
            list.innerHTML = '<p style="color: #999; text-align: center;">No custom questions yet. Create your first question above!</p>';
            return;
        }

        this.customQuestions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <div class="question-item-header">
                    <span class="question-topic-tag">${this.formatTopic(q.topic)}</span>
                    <button class="delete-btn" data-id="${q.id}">Delete</button>
                </div>
                <div class="question-item-text">${q.question}</div>
                <div class="question-item-answer">Answer: ${q.answer}</div>
                ${q.tags ? `<div class="question-item-tags">Tags: ${q.tags}</div>` : ''}
            `;
            list.appendChild(item);
        });

        // Add delete button listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteQuestion(id);
            });
        });
    }

    deleteQuestion(id) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.customQuestions = this.customQuestions.filter(q => q.id !== id);
            this.saveCustomQuestions();
            this.displaySavedQuestions();
        }
    }

    saveCustomQuestions() {
        localStorage.setItem('learnit_custom_questions', JSON.stringify(this.customQuestions));
    }

    loadCustomQuestions() {
        const saved = localStorage.getItem('learnit_custom_questions');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LearnItApp();
});
