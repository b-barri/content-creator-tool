# Google Cloud Speech-to-Text Setup

## 🔧 **Setup Instructions**

### **1. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Speech-to-Text API**

### **2. Create Service Account**
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `content-creator-tool`
4. Role: **Cloud Speech-to-Text Client**
5. Create and download the JSON key file

### **3. Set Environment Variables**
Add to your `.env.local` file:

```bash
# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Optional: Fallback to OpenAI if Google fails
OPENAI_API_KEY=your_openai_api_key_here
```

### **4. Pricing Information**
- **Free Tier**: 60 minutes per month
- **Paid**: $0.006 per 15 seconds of audio
- **Much cheaper** than OpenAI for large files

### **5. File Size Limits**
- **Maximum**: 60 minutes of audio (roughly 500MB)
- **Supported formats**: MP3, WAV, FLAC, OGG, WEBM
- **Better accuracy** for long-form content

## 🎯 **Benefits Over OpenAI Whisper**

✅ **20x larger file limit** (500MB vs 25MB)  
✅ **Better pricing** for large files  
✅ **More accurate** for many languages  
✅ **Real-time streaming** support  
✅ **Better punctuation** and formatting  
✅ **Word-level timestamps** available  

## 🚀 **Usage**

The system will automatically use Google Cloud Speech-to-Text by default. You can still fall back to OpenAI Whisper by setting `useGoogle: false` in the API call.
