const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// تقديم ملفات واجهة المستخدم من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// مسار الـ API لاصطياد رسائل الدردشة
app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: 'الرجاء إرسال رسالة' });
    }

    // تشغيل opencode-ai وإرسال رسالة المستخدم له كمعامل argument
    const aiProcess = spawn('opencode-ai', [userMessage]);
    
    let result = '';
    let errorMessage = '';

    // جمع المخرجات
    aiProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    // جمع الأخطاء إن وجدت
    aiProcess.stderr.on('data', (data) => {
        errorMessage += data.toString();
    });

    // عند انتهاء الأمر، نرسل الرد للمتصفح
    aiProcess.on('close', (code) => {
        if (code !== 0 && !result) {
            console.error('Error Output:', errorMessage);
            return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الرد من الذكاء الاصطناعي' });
        }
        res.json({ reply: result.trim() });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
