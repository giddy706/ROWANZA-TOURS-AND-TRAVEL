const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const INQUIRIES_FILE = path.join(__dirname, 'inquiries.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Email Transporter Configuration
// NOTE: Use an App Password for Gmail (https://myaccount.google.com/apppasswords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nderitugideon73@gmail.com',
        pass: 'YOUR_APP_PASSWORD_HERE' // User must update this
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Database Helpers
async function readDB() {
    try {
        const data = await fs.readJson(DB_FILE);
        if (!data.locations) data.locations = []; // Ensure locations array exists
        return data;
    } catch (err) {
        console.error('Error reading database:', err);
        return { tours: [], testimonials: [], gallery: [], locations: [], siteConfig: {} };
    }
}

async function writeDB(data) {
    try {
        await fs.writeJson(DB_FILE, data, { spaces: 2 });
    } catch (err) {
        console.error('Error writing to database:', err);
    }
}

async function readBookings() {
    try {
        if (!await fs.exists(BOOKINGS_FILE)) {
            await fs.writeJson(BOOKINGS_FILE, []);
            return [];
        }
        const data = await fs.readJson(BOOKINGS_FILE);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Error reading bookings:', err);
        return [];
    }
}

async function writeBookings(data) {
    try {
        await fs.writeJson(BOOKINGS_FILE, data, { spaces: 2 });
    } catch (err) {
        console.error('Error writing to bookings:', err);
    }
}

async function readInquiries() {
    try {
        if (!await fs.exists(INQUIRIES_FILE)) {
            await fs.writeJson(INQUIRIES_FILE, []);
            return [];
        }
        const data = await fs.readJson(INQUIRIES_FILE);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Error reading inquiries:', err);
        return [];
    }
}

async function writeInquiries(data) {
    try {
        await fs.writeJson(INQUIRIES_FILE, data, { spaces: 2 });
    } catch (err) {
        console.error('Error writing to inquiries:', err);
    }
}

async function readReviews() {
    try {
        if (!await fs.exists(REVIEWS_FILE)) {
            await fs.writeJson(REVIEWS_FILE, []);
            return [];
        }
        const data = await fs.readJson(REVIEWS_FILE);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Error reading reviews:', err);
        return [];
    }
}

async function writeReviews(data) {
    try {
        await fs.writeJson(REVIEWS_FILE, data, { spaces: 2 });
    } catch (err) {
        console.error('Error writing to reviews:', err);
    }
}

// --- API Endpoints ---

// Get all data
app.delete('/api/inquiries/:id', async (req, res) => {
    try {
        const inquiries = await readInquiries();
        const id = req.params.id;
        console.log('Deleting inquiry with ID:', id, '| Total inquiries:', inquiries.length);
        const updatedInquiries = inquiries.filter(i => String(i.id) !== String(id));
        console.log('Inquiries after filter:', updatedInquiries.length);
        await writeInquiries(updatedInquiries);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/data', async (req, res) => {
    const data = await readDB();
    res.json(data);
});

// Update Site Config
app.put('/api/config', async (req, res) => {
    const data = await readDB();
    data.siteConfig = req.body;
    await writeDB(data);
    res.json({ success: true, config: data.siteConfig });
});

// --- Tours ---
app.post('/api/tours', upload.single('image'), async (req, res) => {
    const data = await readDB();
    const newTour = JSON.parse(req.body.tour);
    newTour.id = Date.now().toString();
    if (req.file) {
        newTour.image = `uploads/${req.file.filename}`;
    }
    data.tours.push(newTour);
    await writeDB(data);
    res.json(newTour);
});

app.put('/api/tours/:id', upload.single('image'), async (req, res) => {
    const data = await readDB();
    const index = data.tours.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        const updatedTour = JSON.parse(req.body.tour);
        if (req.file) {
            updatedTour.image = `uploads/${req.file.filename}`;
        } else {
            updatedTour.image = data.tours[index].image;
        }
        data.tours[index] = { ...data.tours[index], ...updatedTour };
        await writeDB(data);
        res.json(data.tours[index]);
    } else {
        res.status(404).json({ error: 'Tour not found' });
    }
});

app.delete('/api/tours/:id', async (req, res) => {
    const data = await readDB();
    data.tours = data.tours.filter(t => t.id !== req.params.id);
    await writeDB(data);
    res.json({ success: true });
});

// --- Testimonials ---
app.post('/api/testimonials', async (req, res) => {
    const data = await readDB();
    const newTestimonial = req.body;
    newTestimonial.id = Date.now().toString();
    data.testimonials.push(newTestimonial);
    await writeDB(data);
    res.json(newTestimonial);
});

app.delete('/api/testimonials/:id', async (req, res) => {
    const data = await readDB();
    data.testimonials = data.testimonials.filter(t => t.id !== req.params.id);
    await writeDB(data);
    res.json({ success: true });
});

// --- Reviews ---
app.post('/api/reviews', upload.single('photo'), async (req, res) => {
    try {
        const data = await readDB();
        const review = JSON.parse(req.body.review);
        review.id = Date.now().toString();
        review.createdAt = new Date().toISOString();

        if (req.file) {
            review.photo = `uploads/${req.file.filename}`;
        }

        if (!data.reviews) data.reviews = [];
        data.reviews.push(review);

        // Increment review count for the tour
        const tourIndex = data.tours.findIndex(t => String(t.id) === String(review.tourId));
        if (tourIndex !== -1) {
            data.tours[tourIndex].reviews = (data.tours[tourIndex].reviews || 0) + 1;
        }

        await writeDB(data);
        res.json({ success: true, review });
    } catch (err) {
        console.error('Error saving review:', err);
        res.status(500).json({ error: 'Failed to save review' });
    }
});

// --- Locations ---
app.post('/api/locations', upload.array('images', 10), async (req, res) => {
    const data = await readDB();
    const newLocation = JSON.parse(req.body.location);
    newLocation.id = 'loc_' + Date.now().toString();

    newLocation.images = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            newLocation.images.push(`uploads/${file.filename}`);
        });
    }

    data.locations.push(newLocation);
    await writeDB(data);
    res.json(newLocation);
});

app.put('/api/locations/:id', upload.array('images', 10), async (req, res) => {
    const data = await readDB();
    const index = data.locations.findIndex(l => l.id === req.params.id);
    if (index !== -1) {
        const updatedLocation = JSON.parse(req.body.location);

        // Handle new image uploads (if any)
        if (req.files && req.files.length > 0) {
            updatedLocation.images = updatedLocation.images || [];
            req.files.forEach(file => {
                updatedLocation.images.push(`uploads/${file.filename}`);
            });
        }

        // Handle image deletions
        if (req.body.imagesToDelete) {
            const imagesToDelete = JSON.parse(req.body.imagesToDelete);
            if (updatedLocation.images && updatedLocation.images.length > 0) {
                updatedLocation.images = updatedLocation.images.filter(img => !imagesToDelete.includes(img));
            }
        }

        data.locations[index] = { ...data.locations[index], ...updatedLocation };
        await writeDB(data);
        res.json(data.locations[index]);
    } else {
        res.status(404).json({ error: 'Location not found' });
    }
});

app.delete('/api/locations/:id', async (req, res) => {
    const data = await readDB();
    data.locations = data.locations.filter(l => l.id !== req.params.id);
    await writeDB(data);
    res.json({ success: true });
});

// --- Gallery ---
app.post('/api/gallery', upload.single('image'), async (req, res) => {
    const data = await readDB();
    const newEntry = {
        id: Date.now().toString(),
        caption: req.body.caption || ''
    };
    if (req.file) {
        newEntry.image = `uploads/${req.file.filename}`;
        data.gallery.push(newEntry);
        await writeDB(data);
        res.json(newEntry);
    } else {
        res.status(400).json({ error: 'Image is required' });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    const data = await readDB();
    data.gallery = data.gallery.filter(g => g.id !== req.params.id);
    await writeDB(data);
    res.json({ success: true });
});

// --- Checkout / Bookings ---
app.post('/api/checkout', async (req, res) => {
    try {
        const bookings = await readBookings();
        const bookingData = req.body;
        const newBooking = {
            id: Date.now().toString(),
            ...bookingData,
            createdAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        await writeBookings(bookings);

        // Send confirmation email
        sendBookingEmail(newBooking);

        res.json({ success: true, bookingId: newBooking.id });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Failed to process checkout' });
    }
});

async function sendBookingEmail(booking) {
    const tourTitles = booking.items ? booking.items.map(i => i.title).join(', ') : 'Tour Package';
    const totalFormatted = booking.formattedTotal || `KSh ${booking.total}`;

    // Calculate dates if available in the first item or use placeholders
    const checkIn = booking.items && booking.items[0] && booking.items[0].checkIn ? booking.items[0].checkIn : 'TBD';
    const checkOut = booking.items && booking.items[0] && booking.items[0].checkOut ? booking.items[0].checkOut : 'TBD';

    const mailOptions = {
        from: '"Rowanza Tours" <nderitugideon73@gmail.com>',
        to: booking.emailAddress,
        subject: `Booking Confirmation: ${tourTitles}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #11A191; color: white; padding: 20px; text-align: center;">
                    <h1>Booking Confirmed!</h1>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hello <strong>${booking.firstName}</strong>,</p>
                    <p>Thank you for booking with Rowanza Tours. Your adventure is officially scheduled!</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #11A191;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 5px 0; color: #666;">Tour:</td>
                                <td style="padding: 5px 0; font-bold;">${tourTitles}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #666;">Check-in:</td>
                                <td style="padding: 5px 0;">${checkIn}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #666;">Check-out:</td>
                                <td style="padding: 5px 0;">${checkOut}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #666; font-bold; border-top: 1px solid #ddd;">Total Price:</td>
                                <td style="padding: 5px 0; font-bold; border-top: 1px solid #ddd;">${totalFormatted}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #11A191; font-bold;">Paid:</td>
                                <td style="padding: 5px 0; color: #11A191; font-bold;">${booking.formattedAmountPaid || 'KSh 0.00'}</td>
                            </tr>
                            ${booking.remainingBalance > 0 ? `
                            <tr>
                                <td style="padding: 5px 0; color: #ff0000; font-bold;">Remaining Balance:</td>
                                <td style="padding: 5px 0; color: #ff0000; font-bold;">${booking.formattedRemainingBalance || 'KSh ' + booking.remainingBalance}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>

                    <p><strong>Tracking Your Booking:</strong></p>
                    <p>You can view your booking status and pay any remaining balance at any time by visiting the link below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5000/booking-status.html?id=${booking.id}" style="background-color: #11A191; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking Status</a>
                    </div>

                    <p>If you have any questions, please reply to this email or contact us via WhatsApp.</p>
                    <p>Safe travels,<br>The Rowanza Tours Team</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} Rowanza Tours. All rights reserved.
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', booking.emailAddress);
    } catch (err) {
        console.error('Email error:', err);
    }
}

app.get('/api/bookings', async (req, res) => {
    const bookings = await readBookings();
    res.json(bookings);
});

app.get('/api/bookings/:id', async (req, res) => {
    try {
        const bookings = await readBookings();
        const booking = bookings.find(b => b.id === req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Ensure balance fields exist for calculated display
        const total = parseFloat(booking.total) || 0;
        const amountPaid = parseFloat(booking.amountPaid) || 0;
        if (booking.remainingBalance === undefined) {
            booking.remainingBalance = total - amountPaid;
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings/:id/pay-balance', async (req, res) => {
    try {
        const bookings = await readBookings();
        const index = bookings.findIndex(b => b.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Booking not found' });

        const { amount, mpesaPhone } = req.body;
        const booking = bookings[index];

        // Update payment info
        const total = parseFloat(booking.total) || 0;
        const oldPaid = parseFloat(booking.amountPaid) || 0;
        const newPaid = oldPaid + parseFloat(amount);

        booking.amountPaid = newPaid;
        booking.remainingBalance = Math.max(0, total - newPaid);
        booking.mpesaPhone = mpesaPhone || booking.mpesaPhone;
        booking.updatedAt = new Date().toISOString();

        if (booking.remainingBalance === 0) {
            booking.paymentStatus = 'Paid';
        }

        bookings[index] = booking;
        await writeBookings(bookings);
        res.json({ success: true, booking });
    } catch (err) {
        console.error('Balance payment error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const bookings = await readBookings();
        const id = req.params.id;
        console.log('Deleting booking with ID:', id, '| Total bookings:', bookings.length);
        const updatedBookings = bookings.filter(b => String(b.id) !== String(id));
        console.log('Bookings after filter:', updatedBookings.length);
        await writeBookings(updatedBookings);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inquiries', async (req, res) => {
    const inquiries = await readInquiries();
    res.json(inquiries);
});

app.post('/api/inquiries', async (req, res) => {
    console.log('Received inquiry request:', req.body);
    try {
        const inquiries = await readInquiries();
        const newInquiry = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        inquiries.push(newInquiry);
        await writeInquiries(inquiries);
        res.json({ success: true, inquiry: newInquiry });
    } catch (err) {
        console.error('Inquiry error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Reviews Endpoints
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await readReviews();
        // If tourId is provided, filter reviews
        if (req.query.tourId) {
            return res.json(reviews.filter(r => r.tourId === req.query.tourId));
        }
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const reviews = await readReviews();
        const review = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        reviews.push(review);
        await writeReviews(reviews);
        res.json({ success: true, review });
    } catch (err) {
        console.error('Review Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
