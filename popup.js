document.addEventListener('DOMContentLoaded', function() {
    
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        
        this.classList.add('active');
        const tabName = this.dataset.tab;
        document.getElementById(tabName).classList.add('active');
      });
    });
    
    
    loadProblems();
    
   
    loadSettings();
    
    
    document.getElementById('addProblemUrl').addEventListener('click', function() {
      const urlInput = document.getElementById('problemUrl');
      const url = urlInput.value.trim();
      
      if (!url) {
        showUrlStatus('Please enter a LeetCode problem URL', false);
        return;
      }
      
      
      if (!url.match(/https?:\/\/leetcode\.com\/problems\/[^\/]+\/?/)) {
        showUrlStatus('Please enter a valid LeetCode problem URL', false);
        return;
      }
      
      
      fetchProblemDataFromUrl(url);
    });
    
   
    
    
    document.getElementById('reviewDueProblems').addEventListener('click', function() {
      chrome.storage.sync.get('problems', function(data) {
        const problems = data.problems || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueProblems = problems.filter(problem => {
          const reviewDate = new Date(problem.nextReview);
          return reviewDate <= today;
        });
        
        if (dueProblems.length === 0) {
          alert('No problems due for review today!');
          return;
        }
        
        chrome.tabs.create({ url: dueProblems[0].url });
        markAsReviewed(dueProblems[0].url);
      });
    });
    
    
    document.getElementById('saveSettings').addEventListener('click', function() {
      const intervals = document.getElementById('reviewIntervals').value
        .split(',')
        .map(interval => parseInt(interval.trim()))
        .filter(interval => !isNaN(interval));
      
      const enableNotifications = document.getElementById('enableNotifications').checked;
      const showBadgeCount = document.getElementById('showBadgeCount').checked;
      
      chrome.storage.sync.set({
        reviewIntervals: intervals,
        enableNotifications: enableNotifications,
        showBadgeCount: showBadgeCount
      }, function() {
        alert('Settings saved!');
      });
    });
  });
  
  
  function fetchProblemDataFromUrl(url) {
    const statusEl = document.getElementById('urlStatus');
    statusEl.textContent = 'Loading problem data...';
    statusEl.className = 'status-message';
    statusEl.style.display = 'block';

    const match = url.match(/problems\/([^\/]+)\/?/);
    if (!match) {
      showUrlStatus('Invalid LeetCode URL format', false);
      return;
    }
    
    const problemSlug = match[1];
    
   
    const problemData = {
      title: "Problem #" + problemSlug.replace(/-/g, ' '),
      url: url.replace(/\/$/, ''), 
      difficulty: "Medium" 
    };
    
   
    fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              title
              difficulty
              topicTags {
                name
              }
            }
          }
        `,
        variables: {
          titleSlug: problemSlug
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.question) {
        const question = data.data.question;
        problemData.title = question.title;
        problemData.difficulty = question.difficulty;
        problemData.tags = question.topicTags.map(tag => tag.name);
      }
      
      
      addProblem(problemData);
    })
    .catch(error => {
      console.error('Error fetching problem data:', error);
      addProblem(problemData);
    });
  }
  
  function showUrlStatus(message, isSuccess) {
    const statusEl = document.getElementById('urlStatus');
    statusEl.textContent = message;
    statusEl.className = isSuccess ? 'status-message status-success' : 'status-message status-error';
    statusEl.style.display = 'block';
    
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
  
  function loadProblems() {
    chrome.storage.sync.get('problems', function(data) {
      const problems = data.problems || [];
      const problemList = document.getElementById('problemList');
      
      if (problems.length === 0) {
        problemList.innerHTML = '<div class="empty-message">No problems saved for review yet. Add a problem URL above.</div>';
        return;
      }
      
      
      problems.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
      
     
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueProblems = problems.filter(problem => {
        const reviewDate = new Date(problem.nextReview);
        return reviewDate <= today;
      });
      
      
      updateDueBadge(dueProblems.length);
      
     
      problemList.innerHTML = '';
      problems.forEach(problem => {
        const reviewDate = new Date(problem.nextReview);
        const isDue = reviewDate <= today;
        
        const item = document.createElement('div');
        item.className = `problem-item${isDue ? ' due-today' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'problem-title';
        titleSpan.textContent = problem.title;
        
        const difficultySpan = document.createElement('span');
        difficultySpan.className = `problem-difficulty ${problem.difficulty.toLowerCase()}`;
        difficultySpan.textContent = problem.difficulty;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'review-date';
        dateSpan.textContent = `Review: ${reviewDate.toLocaleDateString()}`;
        
        const reviewButton = document.createElement('button');
        reviewButton.className = 'review-button';
        reviewButton.textContent = 'Review';
        reviewButton.addEventListener('click', function() {
          chrome.tabs.create({ url: problem.url });
          markAsReviewed(problem.url);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
          deleteProblem(problem.url);
        });
        
        item.appendChild(titleSpan);
        item.appendChild(difficultySpan);
        item.appendChild(dateSpan);
        item.appendChild(reviewButton);
        item.appendChild(deleteButton);
        
        problemList.appendChild(item);
      });
    });
  }
  
  function updateDueBadge(count) {
    const badge = document.getElementById('dueBadge');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
    chrome.runtime.sendMessage({ action: "updateBadge", count: count });
  }
  
  function loadSettings() {
    chrome.storage.sync.get({
      reviewIntervals: [1, 3, 7, 14, 30, 60, 90],
      enableNotifications: true,
      showBadgeCount: true
    }, function(items) {
      document.getElementById('reviewIntervals').value = items.reviewIntervals.join(', ');
      document.getElementById('enableNotifications').checked = items.enableNotifications;
      document.getElementById('showBadgeCount').checked = items.showBadgeCount;
    });
  }
  
  function addProblem(problemData) {
    chrome.storage.sync.get({
      problems: [],
      reviewIntervals: [1, 3, 7, 14, 30, 60, 90]
    }, function(data) {
      const problems = data.problems;
      
      // Check if problem already exists
      const existingIndex = problems.findIndex(p => p.url === problemData.url);
      
      if (existingIndex >= 0) {
        showUrlStatus('This problem is already in your review list.', false);
        return;
      }
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      problems.push({
        title: problemData.title,
        url: problemData.url,
        difficulty: problemData.difficulty || "Medium",
        tags: problemData.tags || [],
        nextReview: tomorrow.toISOString(),
        reviewStage: 0,
        reviewHistory: [],
        dateAdded: new Date().toISOString()
      });
      
      chrome.storage.sync.set({ problems: problems }, function() {
        document.getElementById('problemUrl').value = '';
        
        showUrlStatus('Problem added to review list!', true);
        
        loadProblems();
      });
    });
  }
  
  function markAsReviewed(url) {
    chrome.storage.sync.get({
      problems: [],
      reviewIntervals: [1, 3, 7, 14, 30, 60, 90]
    }, function(data) {
      const problems = data.problems;
      const intervals = data.reviewIntervals;
      
      const index = problems.findIndex(p => p.url === url);
      if (index >= 0) {
        const problem = problems[index];
        
        const now = new Date();
        problem.reviewHistory.push(now.toISOString());
        
        problem.reviewStage = Math.min(problem.reviewStage + 1, intervals.length - 1);
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + intervals[problem.reviewStage]);
        nextReview.setHours(0, 0, 0, 0);
        problem.nextReview = nextReview.toISOString();
        
        problems[index] = problem;
        
        chrome.storage.sync.set({ problems: problems }, function() {
          loadProblems();
        });
      }
    });
  }
  
  function deleteProblem(url) {
    if (confirm('Are you sure you want to remove this problem from your review list?')) {
      chrome.storage.sync.get('problems', function(data) {
        const problems = data.problems || [];
        const updatedProblems = problems.filter(p => p.url !== url);
        
        chrome.storage.sync.set({ problems: updatedProblems }, function() {
          loadProblems();
        });
      });
    }
  }