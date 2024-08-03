const express = require('express');
const path = require('path');
const helmet = require('helmet');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

// استخدام Helmet لتحسين الأمان
app.use(helmet());

// استخدام Rate Limiter لتقييد عدد الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // الحد الأقصى للطلبات في هذه الفترة الزمنية
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// استخدام cookie-parser قبل csurf
app.use(cookieParser());

// تعيين مجلد القوالب
app.set('views', path.join(__dirname, 'views'));

// تعيين ejs كمحرك العرض
app.set('view engine', 'ejs');

// تعيين CSRF Protection
app.use(csurf({ cookie: true }));

// توجيه الطلبات
app.get('/', (req, res) => {
    res.render('Home', { csrfToken: req.csrfToken() }); // تمرير csrfToken إلى القالب
});

app.get('/Download', (req, res) => {
    const file = path.join(__dirname, 'PyFast.exe'); // تحديد المسار للملف الذي تريد تنزيله
    res.download(file, 'PyFast.exe', (err) => {
        if (err) {
            console.error('Error while downloading file:', err);
            res.status(500).send('Error while downloading file.');
        }
    });
});

app.get('/learnmore', (req, res) => {
    res.render('learnmore', { csrfToken: req.csrfToken() }); // تمرير csrfToken إلى القالب
});

app.get('/about-me', (req, res) => {
    res.render('aboueme', { csrfToken: req.csrfToken() }); // تمرير csrfToken إلى القالب
});

// معالجة الأخطاء الخاصة بـ CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Form has expired or invalid CSRF token.');
    } else {
        next(err);
    }
});

// تقديم صفحة 404
app.use((req, res) => {
    res.status(404).render('404');
});

// بدء الاستماع على المنفذ
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
