# Bonsai SAT Assistant - Browser Extension

This browser extension enables the Bonsai AI Agent to work in parallel with the official College Board Bluebook SAT testing application, providing real-time AI assistance during test sessions.

## 🌿 Features

- **Real-time Question Analysis**: Uses AI to analyze SAT questions as they appear
- **Intelligent Hints**: Provides strategic hints without giving away answers
- **Adaptive Learning**: Generates practice questions based on detected weaknesses  
- **Test Integrity**: Maintains academic integrity while providing educational support
- **Seamless Integration**: Works alongside the official Bluebook interface

## 📁 Extension Structure

```
browser-extension/
├── manifest.json          # Extension configuration and permissions
├── content.js             # Content script for Bluebook page monitoring
├── inject.js              # Injected script with main AI agent logic
├── background.js          # Service worker for extension lifecycle
├── popup.html             # Extension popup interface
├── styles.css             # Styles for the AI assistant overlay
├── icons/                 # Extension icons (see requirements below)
│   ├── icon16.png
│   ├── icon32.png  
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## 🔧 Installation

### For Development:

1. **Install Icons**: Create the required icon files in the `icons/` directory:
   - `icon16.png` (16x16px) - Toolbar icon
   - `icon32.png` (32x32px) - Windows taskbar 
   - `icon48.png` (48x48px) - Extension management page
   - `icon128.png` (128x128px) - Chrome Web Store

   **Icon Requirements:**
   - Use the Bonsai logo (🌿 or stylized bonsai tree)
   - Colors: Green (#10b981) and Blue (#3b82f6) gradient
   - Clean, professional design
   - Clear visibility at all sizes

2. **Load Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select this directory
   - The Bonsai extension should appear in your extensions list

3. **Test Installation**:
   - Navigate to a Bluebook page (bluebook.collegeboard.org)
   - The extension should automatically activate
   - Click the Bonsai icon to open the control popup

### For Production:

1. Package the extension using Chrome's extension packaging tools
2. Submit to Chrome Web Store following their review process
3. Include proper privacy policy and permissions documentation

## 🚀 Usage

### Automatic Activation
- The extension automatically detects when you visit Bluebook pages
- The AI assistant activates and begins monitoring for questions
- A floating overlay appears with AI assistance

### Manual Control
- Click the Bonsai extension icon to open the control popup
- Toggle the assistant on/off
- Adjust tutor mode (subtle, moderate, direct)
- Access quick actions (practice questions, help, whiteboard)

### AI Assistance Features
- **Question Analysis**: Real-time analysis of SAT questions
- **Strategic Hints**: Helpful hints that guide thinking without giving answers
- **Concept Explanations**: Educational explanations of underlying concepts
- **Practice Questions**: AI-generated similar questions for additional practice
- **Progress Tracking**: Statistics on questions analyzed and hints provided

## ⚙️ Configuration

### Settings (via popup):
- **Assistant Status**: Enable/disable AI assistance
- **Tutor Mode**: 
  - Subtle: Minimal hints, encourages independent thinking
  - Moderate: Balanced hints and explanations
  - Direct: More detailed guidance for struggling students
  - Emergency: Crisis intervention for extreme difficulties

### Advanced Settings:
- **API Key**: OpenAI API key for enhanced AI features
- **Student ID**: Link to Bonsai account for personalized learning
- **Notifications**: Control extension notifications
- **Auto-start**: Automatically activate on Bluebook pages

## 🔒 Privacy & Security

### Data Handling:
- **Local Processing**: Most analysis happens locally in the browser
- **Minimal Data Collection**: Only collects usage statistics and performance metrics
- **No Test Answers**: Never stores or transmits actual test answers
- **Secure Communication**: All API calls use HTTPS encryption

### Permissions Explained:
- **activeTab**: Monitor current Bluebook tab for questions
- **storage**: Save user settings and preferences
- **background**: Run background processes for real-time assistance
- **tabs**: Detect navigation to Bluebook pages
- **scripting**: Inject AI assistant into Bluebook pages
- **webNavigation**: Track page changes for test monitoring

### Academic Integrity:
- Provides educational support without compromising test integrity
- Encourages learning and understanding rather than giving direct answers
- Complies with College Board guidelines for assistive technology
- Maintains separation between test content and assistance features

## 🛠️ Development

### Code Architecture:

**Content Script (`content.js`)**:
- Runs on Bluebook pages
- Detects test questions and page changes
- Coordinates with injected script and background

**Injected Script (`inject.js`)**:
- Contains main BonsaiPageAgent class
- Performs AI analysis and generates assistance
- Creates and manages the assistance overlay

**Background Script (`background.js`)**:
- Manages extension lifecycle and settings
- Handles cross-tab communication
- Coordinates with main Bonsai web application

**Popup Interface (`popup.html`)**:
- Provides user control interface
- Displays session statistics
- Offers quick access to features

### API Integration:

The extension integrates with:
- **OpenAI API**: For question analysis and hint generation
- **Bonsai Backend**: For user profiles and learning analytics
- **Supabase**: For data persistence and real-time features

### Testing:

1. **Unit Testing**: Test individual components in isolation
2. **Integration Testing**: Test extension workflow on actual Bluebook pages
3. **User Testing**: Validate educational effectiveness with real students
4. **Performance Testing**: Ensure minimal impact on test performance

## 🐛 Troubleshooting

### Common Issues:

**Extension not activating on Bluebook:**
- Check that you're on an official Bluebook domain
- Ensure the extension is enabled in Chrome
- Try refreshing the page
- Check browser console for error messages

**AI assistance not working:**
- Verify OpenAI API key is configured
- Check internet connection
- Ensure pop-up blockers aren't interfering
- Try toggling the assistant off and on

**Overlay not visible:**
- Check if overlay is minimized (click Bonsai icon)
- Ensure page has loaded completely
- Try different screen resolution or zoom level
- Check for conflicts with other extensions

### Debug Mode:

Enable debug logging by opening browser console and running:
```javascript
localStorage.setItem('bonsai-debug', 'true')
```

This will provide detailed logging for troubleshooting.

## 📞 Support

- **Documentation**: https://docs.bonsai-ai.com
- **Support**: https://support.bonsai-ai.com
- **Feedback**: https://feedback.bonsai-ai.com
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This extension is part of the Bonsai SAT Assistant platform.
© 2024 Bonsai AI. All rights reserved.

---

**Note**: This extension is designed to enhance learning and should be used in accordance with your educational institution's policies and the College Board's guidelines for assistive technology.