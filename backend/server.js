const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();


const authMiddleware = require('./middleware/auth.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const customerAuthRoutes =
  require("./routes/customerAuth.routes");

const authRoutes = require('./routes/auth.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const specialityRoutes = require('./routes/speciality.routes');
const serviceRoutes = require('./routes/service.routes');
const doctorRoutes = require('./routes/doctor.routes');
const healthLibraryRoutes = require('./routes/healthLibrary.routes');
const storyRoutes = require('./routes/story.routes');
const blogRoutes = require('./routes/blog.routes');
const editorialRoutes = require('./routes/editorial.routes');
const faqRoutes = require('./routes/faq.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Hospital admin API is running' });
});

app.use('/api/auth', authRoutes);
app.use(
  "/api/customer-auth",
  customerAuthRoutes
);

app.use('/api/doctors', doctorRoutes);
app.use('/api/specialities', specialityRoutes);
// app.use('/api/our-stories', storyRoutes);
app.get(
  '/api/public/our-stories',
  require('./controllers/story.controller').list
);

app.get('/api/public/editorial/:kind', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').list(req,res,next); });
app.get('/api/public/editorial/:kind/:id', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').getOne(req,res,next); });
app.use('/api/faqs', faqRoutes);

app.use('/api', authMiddleware);
app.use('/api/hospitals', hospitalRoutes);

// app.use('/api/specialities', specialityRoutes);
app.use('/api/services', serviceRoutes);
// app.use('/api/doctors', doctorRoutes);
app.use('/api/health-library', healthLibraryRoutes);
app.use('/api/our-stories', storyRoutes);

app.use('/api/blogs', blogRoutes);
app.use('/api/editorial', editorialRoutes);

// app.use('/api/faqs', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorMiddleware);

const initDatabase = require('./config/initDb');

const PORT = process.env.PORT || 5000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Hospital admin API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
