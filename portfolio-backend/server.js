const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { RateLimiterMemory } = require('rate-limiter-flexible');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiter
const rateLimiter = new RateLimiterMemory({
    points: 5, // 5 requests
    duration: 1, // per 1 second by IP
});

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);

// Routes
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('All fields are required');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL,
        subject: `New message from ${name}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email sent: ' + info.response);
    });
});
// Add this script to your existing <script> tag
// Get the modal and its content
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeBtn = document.getElementsByClassName('close')[0];

// Get all project items
const projectItems = document.querySelectorAll('.project-item');

// Add click event listener to each project item
projectItems.forEach(item => {
  item.addEventListener('click', () => {
    modalTitle.textContent = item.querySelector('h3').textContent;
    modalDescription.textContent = item.dataset.description;
    modal.style.display = 'block';
  });
});

// Add click event listener to close button
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Add click event listener to close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
