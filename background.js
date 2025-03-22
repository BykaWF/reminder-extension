chrome.runtime.onInstalled.addListener(function() {
    chrome.alarms.create('checkDueProblems', { 
      periodInMinutes: 60 * 24 // Once a day
    });
    
    
    chrome.alarms.create('updateBadge', { 
      periodInMinutes: 60 
    });
  });
  
  
  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'checkDueProblems') {
      checkForDueProblems(true); 
    } else if (alarm.name === 'updateBadge') {
      checkForDueProblems(false);
    }
  });
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updateBadge") {
      updateBadgeCount(request.count);
      sendResponse({success: true});
    } 
    else if (request.action === "addProblemFromPage") {
      addProblemData(request.data, function(success) {
        sendResponse({success: success});
      });
      return true; 
    }
  });
  
  function addProblemData(problemData, callback) {
    chrome.storage.sync.get({
      problems: [],
      reviewIntervals: [1, 3, 7, 14, 30, 60, 90]
    }, function(data) {
      const problems = data.problems;
      
      // Check if problem already exists
      const existingIndex = problems.findIndex(p => p.url === problemData.url);
      
      if (existingIndex >= 0) {
        // Problem already exists
        callback(false);
        return;
      }
      
    
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      problems.push({
        title: problemData.title,
        url: problemData.url,
        difficulty: problemData.difficulty,
        number: problemData.number || "Unknown",
        tags: problemData.tags || [],
        nextReview: tomorrow.toISOString(),
        reviewStage: 0,
        reviewHistory: [],
        dateAdded: new Date().toISOString()
      });
      
      chrome.storage.sync.set({ problems: problems }, function() {
        
        checkForDueProblems(false);
        callback(true);
      });
    });
  }
  
 
  function checkForDueProblems(shouldNotify) {
    chrome.storage.sync.get({
      problems: [],
      enableNotifications: true,
      showBadgeCount: true
    }, function(data) {
      const problems = data.problems || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
     
      const dueProblems = problems.filter(problem => {
        const reviewDate = new Date(problem.nextReview);
        return reviewDate <= today;
      });
      
     
      if (data.showBadgeCount) {
        updateBadgeCount(dueProblems.length);
      }
      
     
      if (shouldNotify && data.enableNotifications && dueProblems.length > 0) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: 'LeetCode Review Reminder',
          message: `You have ${dueProblems.length} problem${dueProblems.length === 1 ? '' : 's'} due for review today.`,
          priority: 2
        });
      }
    });
  }
  
 
  function updateBadgeCount(count) {
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#E74C3C' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }