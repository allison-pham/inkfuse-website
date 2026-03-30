const authenticate = require('./middleware/authenticate');
app.get('/protected', authenticate, (req, res) => {
    res.send(`Hello, ${req.user.name}. This is a protected route.`);
});
const cookieParser = require('cookie-parser');
app.use(cookieParser());
