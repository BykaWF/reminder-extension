chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getProblemData") {
      try {
        const problemData = extractProblemData();
        sendResponse({success: true, data: problemData});
      } catch (error) {
        sendResponse({success: false, error: error.message});
      }
    }
    return true;
  });
  
  function extractProblemData() {
    const titleElement = document.querySelector('[data-cy="question-title"]');
    if (!titleElement) {
      throw new Error("Could not find problem title");
    }
    
    const difficultyElement = document.querySelector('[diff]');
    const difficulty = difficultyElement ? difficultyElement.textContent : "Medium";
    
    const title = titleElement.textContent.replace(/^\d+\.\s/, '');
    
    const urlMatch = window.location.pathname.match(/\/problems\/([^/]+)\//);
    const titleMatch = titleElement.textContent.match(/^(\d+)\.\s/);
    const problemNumber = titleMatch ? titleMatch[1] : (urlMatch ? urlMatch[1] : "Unknown");
    
    let tags = [];
    const tagsElements = document.querySelectorAll('.topic-tag__1jni');
    if (tagsElements.length > 0) {
      tags = Array.from(tagsElements).map(el => el.textContent.trim());
    }
    
    return {
      title: title,
      url: window.location.href,
      difficulty: difficulty,
      number: problemNumber,
      tags: tags
    };
  }
  
  function addReminderButton() {
    if (!window.location.href.includes('leetcode.com/problems/')) {
      return;
    }
    
    if (document.getElementById('leetcode-reminder-btn')) {
      return;
    }
    
    const targetArea = document.querySelector('.mr-2.flex-1');
    if (!targetArea) {
      return;
    }
    
    const reminderButton = document.createElement('button');
    reminderButton.id = 'leetcode-reminder-btn';
    reminderButton.className = 'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-yellow-600 hover:bg-yellow-700 text-white';
    reminderButton.style.marginLeft = '8px';
    reminderButton.innerHTML = '<span>Add to Review List</span>';
    
    reminderButton.addEventListener('click', function() {
      try {
        const problemData = extractProblemData();
        chrome.runtime.sendMessage({ 
          action: "addProblemFromPage", 
          data: problemData 
        }, function(response) {
          if (response && response.success) {
            reminderButton.className = 'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white';
            reminderButton.innerHTML = '<span>Added to Review List ✓</span>';
            
            setTimeout(function() {
              reminderButton.className = 'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-yellow-600 hover:bg-yellow-700 text-white';
              reminderButton.innerHTML = '<span>Add to Review List</span>';
            }, 3000);
          } else {
            reminderButton.className = 'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white';
            reminderButton.innerHTML = '<span>Error! Try Again</span>';
          }
        });
      } catch (error) {
        console.error("Error adding problem:", error);
      }
    });
    
    targetArea.appendChild(reminderButton);
  }
  
  addReminderButton();
  
  const observer = new MutationObserver(function(mutations) {
    addReminderButton();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });