(function () {
  'use strict';

  const isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // ===== ERROR HANDLING =====
  window.addEventListener('error', (e) => {
    if (isDev) console.error('Error loading resource:', e.filename || e.target?.src, e.message);
  }, { passive: true });

  // ===== THEME TOGGLE =====
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const theme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }

  // ===== PARTICLES.JS (disabled on small screens) =====
  try {
    if (window.matchMedia && !window.matchMedia('(max-width: 767px)').matches) {
      if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: '#d4af37' },
            shape: { type: 'circle' },
            opacity: { value: 0.45, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 140, color: '#d4af37', opacity: 0.35, width: 1 },
            move: { enable: true, speed: 2, random: true, out_mode: 'out' }
          },
          interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true }, modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } } },
          retina_detect: true
        });
      } else if (isDev) {
        console.warn('Particles.js not loaded.');
      }
    }
  } catch (error) {
    if (isDev) console.error('Particles.js initialization failed:', error);
  }

  // ===== CACHED SELECTORS & STATE =====
  const navBar = document.querySelector('.nav-bar');
  const navBurger = document.getElementById('navBurger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('.section, .hero'));
  const heroContent = document.querySelector('.hero-content');

  // Quiz elements
  const quizData = [
    { question: "What's your age range?", options: ["25-28", "28-31", "31-34", "34+"], weights: [0.5, 1, 1, 0.7] },
    { question: "What's your educational background?", options: ["Undergraduate", "Master's", "PhD/Professional", "Other"], weights: [0.8, 1, 1, 0.6] },
    { question: "What's most important in a relationship?", options: ["Family values", "Career balance", "Personal growth", "Adventure & fun"], weights: [1, 0.9, 0.8, 0.7] },
    { question: "Your lifestyle preferences?", options: ["Vegetarian/Non-smoking", "Flexible diet", "Social drinker", "Party lifestyle"], weights: [1, 0.7, 0.5, 0.3] },
    { question: "How do you feel about living in the USA?", options: ["Love it, settled here", "Comfortable, occasional India visits", "Prefer India long-term", "Undecided"], weights: [1, 1, 0.6, 0.5] },
    { question: "Your career aspirations?", options: ["Established career", "Growing career", "Entrepreneurial", "Career break/transition"], weights: [1, 0.9, 1, 0.7] },
    { question: "Hobbies and interests?", options: ["Sports & outdoors", "Cooking & food", "Reading & learning", "Travel & culture"], weights: [1, 1, 0.9, 0.9] },
    { question: "Family dynamics preference?", options: ["Close-knit family", "Independent but connected", "Nuclear family focus", "Extended family"], weights: [1, 0.9, 0.8, 0.9] }
  ];

  let currentQuestion = 0;
  let answers = [];

  const quizModal = document.getElementById('quizModal');
  const startQuizBtn = document.getElementById('startQuiz');
  const closeQuizBtn = document.getElementById('closeQuiz');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const quizQuestions = document.getElementById('quizQuestions');
  const quizResult = document.getElementById('quizResult');

  // ===== SCROLL HANDLING (rAF + passive) =====
  let lastScrollY = 0;
  let ticking = false;
  let sectionPositions = [];

  function computeSectionPositions() {
    sectionPositions = sections.map(s => ({ id: s.id, top: s.offsetTop, height: s.clientHeight }));
  }

  function handleScroll(scrollY) {
    if (navBar) {
      if (scrollY > 100) navBar.classList.add('scrolled'); else navBar.classList.remove('scrolled');
    }

    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
    }

    updateActiveNavLink(scrollY);
  }

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', debounce(() => computeSectionPositions(), 150), { passive: true });

  // Initial compute
  computeSectionPositions();

  function updateActiveNavLink(scrollY = window.scrollY) {
    let current = '';
    for (const sec of sectionPositions) {
      if (scrollY >= sec.top - 200) current = sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  // ===== MOBILE MENU & A11Y =====
  if (navBurger && navMenu) {
    navBurger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('active');
      navBurger.setAttribute('aria-expanded', String(open));
    });
  }

  navLinks.forEach(link => link.addEventListener('click', () => { if (navMenu) { navMenu.classList.remove('active'); navBurger?.setAttribute('aria-expanded', 'false'); } }));

  // ===== TYPING EFFECT =====
  const typingText = document.querySelector('.typing-text');
  const phrases = ['Automotive Systems Engineer', 'Seeking a Life Partner', 'Entrepreneur & Innovator', 'Family-Oriented Individual', 'Adventure Enthusiast'];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;

  function typeEffect() {
    if (!typingText) return;
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) { typingText.textContent = currentPhrase.substring(0, charIndex - 1); charIndex--; }
    else { typingText.textContent = currentPhrase.substring(0, charIndex + 1); charIndex++; }

    if (!isDeleting && charIndex === currentPhrase.length) { isDeleting = true; setTimeout(typeEffect, 2000); }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; setTimeout(typeEffect, 500); }
    else setTimeout(typeEffect, isDeleting ? 50 : 100);
  }
  setTimeout(typeEffect, 1000);

  // ===== VANILLA TILT =====
  try {
    if (typeof VanillaTilt !== 'undefined') {
      const tiltElements = document.querySelectorAll('[data-tilt]');
      if (tiltElements.length) VanillaTilt.init(tiltElements, { max: 15, speed: 400, glare: true, 'max-glare': 0.3 });
    } else if (isDev) console.warn('VanillaTilt not loaded.');
  } catch (err) { if (isDev) console.error('VanillaTilt failed:', err); }

  // ===== INTERSECTION OBSERVER FOR AOS =====
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        if (entry.target.classList.contains('value-item')) animateProgressCircle(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  function animateProgressCircle(valueItem) {
    const circle = valueItem.querySelector('.circle-progress');
    if (circle && !circle.classList.contains('animated')) {
      const progress = Number(circle.getAttribute('data-progress') || 0);
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (progress / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      circle.classList.add('animated');
    }
  }

  // ===== SMOOTH SCROLL for anchors =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.offsetTop - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }, { passive: false });
  });

  // ===== QUIZ LOGIC =====
  if (startQuizBtn) startQuizBtn.addEventListener('click', () => { quizModal?.classList.add('active'); resetQuiz(); showQuestion(); });
  if (closeQuizBtn && quizModal) closeQuizBtn.addEventListener('click', () => quizModal.classList.remove('active'));
  if (quizModal) quizModal.addEventListener('click', (e) => { if (e.target === quizModal) quizModal.classList.remove('active'); });

  if (prevBtn) prevBtn.addEventListener('click', () => { if (currentQuestion > 0) { currentQuestion--; showQuestion(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const selected = document.querySelector('.quiz-option.selected');
    if (selected) {
      answers[currentQuestion] = parseInt(selected.dataset.index, 10);
      if (currentQuestion < quizData.length - 1) { currentQuestion++; showQuestion(); } else showResult();
    } else alert('Please select an option');
  });

  function resetQuiz() { currentQuestion = 0; answers = []; if (quizQuestions) quizQuestions.style.display = 'block'; if (quizResult) quizResult.style.display = 'none'; if (nextBtn) nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>'; }

  function showQuestion() {
    const question = quizData[currentQuestion];
    if (quizQuestions) {
      quizQuestions.innerHTML = `\n      <div class="quiz-question">\n        <h3>Question ${currentQuestion + 1} of ${quizData.length}</h3>\n        <p style="font-size: 1.2rem; margin: 1rem 0 2rem;">${question.question}</p>\n        <div class="quiz-options">\n          ${question.options.map((option, index) => `\n            <div class="quiz-option ${answers[currentQuestion] === index ? 'selected' : ''}" data-index="${index}">${option}</div>\n          `).join('')}\n        </div>\n      </div>\n      `;
      document.querySelectorAll('.quiz-option').forEach(option => option.addEventListener('click', () => { document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected')); option.classList.add('selected'); }));
    }
    if (prevBtn) prevBtn.style.display = currentQuestion === 0 ? 'none' : 'flex';
    if (nextBtn) nextBtn.innerHTML = currentQuestion === quizData.length - 1 ? 'See Results <i class="fas fa-check"></i>' : 'Next <i class="fas fa-arrow-right"></i>';
  }

  function showResult() {
    let totalScore = 0;
    answers.forEach((answerIndex, questionIndex) => { totalScore += quizData[questionIndex].weights[answerIndex] || 0; });
    const maxScore = quizData.reduce((sum, q) => sum + Math.max(...q.weights), 0);
    const percentage = Math.round((totalScore / (maxScore || 1)) * 100);

    let resultMessage, resultEmoji, resultDescription;
    if (percentage >= 85) { resultEmoji = '🎉'; resultMessage = 'Excellent Match!'; resultDescription = "Our values, lifestyle, and goals align wonderfully! I'd love to connect and explore this potential further. Let's have a conversation!"; }
    else if (percentage >= 70) { resultEmoji = '😊'; resultMessage = 'Great Compatibility!'; resultDescription = "We share many important values and preferences. Let's chat and see where it goes!"; }
    else if (percentage >= 55) { resultEmoji = '🤔'; resultMessage = 'Good Potential!'; resultDescription = "We have some good alignment with room to learn more about each other. Worth exploring further through conversation!"; }
    else { resultEmoji = '💭'; resultMessage = 'Different Paths'; resultDescription = "While we might have different preferences, compatibility is complex. If you feel there's a connection, I'm open to conversation!"; }

    if (quizQuestions) quizQuestions.style.display = 'none';
    if (quizResult) {
      quizResult.style.display = 'block';
      quizResult.innerHTML = `\n        <div style="font-size: 5rem; margin-bottom: 1rem;">${resultEmoji}</div>\n        <h3>${resultMessage}</h3>\n        <div class="result-score">${percentage}%</div>\n        <p style="font-size: 1.1rem; color: var(--text-light); margin: 2rem 0;">${resultDescription}</p>\n        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">\n          <a href="#contact" class="quiz-btn quiz-btn-primary" onclick="document.getElementById('quizModal').classList.remove('active')">Get in Touch <i class=\"fas fa-envelope\"></i></a>\n          <button type=\"button\" class=\"quiz-btn\" onclick=\"location.reload()\">Retake Quiz <i class=\"fas fa-redo\"></i></button>\n        </div>\n      `;
    }
  }

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const message = document.getElementById('message')?.value || '';
      const subject = encodeURIComponent(`Matrimonial Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`);
      window.location.href = `mailto:malavdalal@yahoo.com?subject=${subject}&body=${body}`;
      alert('Thank you for reaching out! Your default email client will open to send the message.');
      contactForm.reset();
    });
  }

  // ===== IMAGE LAZY OBSERVER (for data-src patterns, preserved) =====
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const img = entry.target; if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); imageObserver.unobserve(img); } } }); });
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }

  // ===== EASTER EGG: Konami Code =====
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  document.addEventListener('keydown', (e) => { if (e.key === konamiCode[konamiIndex]) { konamiIndex++; if (konamiIndex === konamiCode.length) { activateEasterEgg(); konamiIndex = 0; } } else konamiIndex = 0; });
  function activateEasterEgg() { document.body.style.animation = 'rainbow 2s linear infinite'; setTimeout(() => { document.body.style.animation = ''; alert('🎮 You found the secret! Thanks for being playful! 😄'); }, 2000); }

  // Add rainbow animation style
  const styleEl = document.createElement('style');
  styleEl.textContent = `@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
  document.head.appendChild(styleEl);

  if (isDev) {
    console.log('%c👋 Welcome to my profile!', 'font-size: 20px; color: #d4af37; font-weight: bold;');
    console.log('%cLooking for your perfect match? Let\'s connect!', 'font-size: 14px; color: #666;');
  }

  // ===== Utilities =====
  function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); }; }

})();
