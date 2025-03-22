# LeetCode Review Reminder

A Chrome extension that helps you practice LeetCode problems using spaced repetition principles.

## Overview

LeetCode Review Reminder tracks which programming problems you've completed on LeetCode and reminds you when to review them again. By using spaced repetition (reviewing at increasing intervals), you'll strengthen your memory of solutions and coding patterns over time.

![LeetCode Review Reminder Demo](preview.gif)

## Features

- **Spaced Repetition System**: Problems are automatically scheduled for review using scientifically-backed intervals
- **Easy Problem Management**: Add any LeetCode problem to your review list with one click
- **Visual Tracking**: Due problems are highlighted in your list and shown as a badge count on the extension icon
- **Desktop Notifications**: Get reminded when you have problems to review
- **Direct Page Integration**: "Add to Review" button appears directly on LeetCode problem pages
- **Customizable**: Adjust review intervals to match your learning style

## Installation

### From Source (Developer Mode)

1. Clone this repository or download and extract the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and active

## Usage

### Adding Problems

There are two ways to add a LeetCode problem to your review list:

1. **From the LeetCode page**:
   - Visit any LeetCode problem
   - Click the "Add to Review List" button that appears on the page

2. **From the extension popup**:
   - Visit any LeetCode problem
   - Click the extension icon in your browser toolbar
   - Click "Add Current Problem to Review List"

### Reviewing Problems

When a problem is due for review:

1. It will appear highlighted in your problem list
2. You'll see a badge count on the extension icon
3. You'll receive a desktop notification (if enabled)

To review a problem:

1. Click the extension icon to open the problem list
2. Click the "Review" button next to the problem
3. When you've successfully solved the problem again, it will be automatically scheduled for its next review at a longer interval

### Customizing Settings

1. Click the extension icon to open the popup
2. Select the "Settings" tab
3. Adjust the review intervals (comma-separated numbers of days)
4. Toggle notification and badge settings as desired
5. Click "Save Settings"

## Review Intervals

The default review intervals follow a spaced repetition schedule:
- 1 day after first completion
- 3 days after first review
- 7 days after second review
- 14 days after third review
- 30 days after fourth review
- 60 days after fifth review
- 90 days after sixth review

These intervals are fully customizable in the settings.

## Why Spaced Repetition?

Spaced repetition is a learning technique that incorporates increasing intervals of time between reviews of previously learned material. It's based on the psychological spacing effect, which shows that we learn more effectively when we space out our learning over time.

For LeetCode problems, this means:
1. You'll remember solution patterns longer
2. You'll build stronger neural connections for coding patterns
3. You'll use your study time more efficiently

## Development

### Project Structure

- `manifest.json` - Extension configuration
- `popup.html` - UI for the extension popup
- `popup.js` - Logic for the popup interface
- `content.js` - Script that runs on LeetCode pages
- `background.js` - Background service worker for notifications and badge updates
- `images/` - Icon files in various sizes

### Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you have ideas for improvements.

## Privacy

This extension stores all data locally on your computer. No data is transmitted to external servers.
