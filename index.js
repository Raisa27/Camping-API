// Importeren van de express module in node_modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./classes/database.js');

// Aanmaken van een express app
const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8080', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Middleware om JSON-requests te parsen
app.use(bodyParser.json());

// Serve images from the  folder
app.use('/img', express.static('assets/img'));


// Home endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/campingspots', (req, res) => {
  const db = new Database();
  const query = `
    SELECT 
      cs.CampingSpotId, cs.Name, cs.Description, cs.MaxCapacity, 
      cs.PricePerNight, cs.AmenitiesId, cs.LocationId, 
      l.CityVillage, l.Coordinates, l.Country, 
      cs.HostId
    FROM 
      CampingSpot cs
    LEFT JOIN 
      Location l ON cs.LocationId = l.LocationId
  `;
  db.getQuery(query)
    .then(spots => res.send(spots))
    .catch(error => res.status(500).send({ error: 'Failed to fetch spots', details: error }));
});



app.post('/api/campingspots', (req, res) => {
  const { name, locationId, description, maxCapacity, pricePerNight, amenitiesId, hostId } = req.body;  // Accept hostId
  const db = new Database();
  const query = `INSERT INTO CampingSpot (Name, LocationId, Description, MaxCapacity, PricePerNight, AmenitiesId, HostId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.getQuery(query, [name, locationId, description, maxCapacity, pricePerNight, amenitiesId, hostId])
    .then(() => res.status(201).send({ message: 'Camping spot added successfully' }))
    .catch((error) => res.status(500).send({ error: 'Failed to add camping spot', details: error }));
});


app.get('/api/campingspots/:id', (req, res) => {
  const db = new Database();
  const query = `
    SELECT 
      cs.CampingSpotId, cs.Name, cs.Description, cs.MaxCapacity, 
      cs.PricePerNight, cs.AmenitiesId, cs.LocationId, 
      l.CityVillage, l.Coordinates, l.Country, 
      cs.HostId
    FROM 
      CampingSpot cs
    LEFT JOIN 
      Location l ON cs.LocationId = l.LocationId
    WHERE 
      cs.CampingSpotId = ?
  `;
  
  db.getQuery(query, [req.params.id])
    .then(spots => {
      if (spots.length === 0) {
        res.status(404).send({ error: 'Camping spot not found' });
      } else {
        res.send(spots[0]); // Send the first (and should be only) result
      }
    })
    .catch(error => res.status(500).send({ error: 'Failed to fetch spot details', details: error }));
});

app.get('/api/users/:userId/campingspots', (req, res) => {
  const db = new Database();
  const query = `
    SELECT 
      cs.CampingSpotId, cs.Name, cs.Description, cs.MaxCapacity, 
      cs.PricePerNight, cs.AmenitiesId, cs.LocationId, 
      l.CityVillage, l.Coordinates, l.Country
    FROM 
      CampingSpot cs
    LEFT JOIN 
      Location l ON cs.LocationId = l.LocationId
    WHERE 
      cs.HostId = ?
  `;
  
  db.getQuery(query, [req.params.userId])
    .then(spots => res.send(spots))
    .catch(error => res.status(500).send({ error: 'Failed to fetch spots', details: error }));
});


// User Endpoints
app.get('/api/users', (req, res) => {
    const db = new Database();
    db.getQuery('SELECT * FROM User')
      .then((users) => res.send(users))
      .catch((error) => res.status(500).send({ error: 'Failed to fetch users', details: error }));
});

app.post('/api/users', (req, res) => {
    const { firstname, name, email, password, phoneNumber, userTypeId, birthdate, gender } = req.body;
    const db = new Database();
    const query = `INSERT INTO User (Firstname, Name, Email, Password, PhoneNumber, UserTypeId, Birthdate, Gender) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.getQuery(query, [firstname, name, email, password, phoneNumber, userTypeId, birthdate, gender])
      .then(() => res.status(201).send({ message: 'User added successfully' }))
      .catch((error) => res.status(500).send({ error: 'Failed to add user', details: error }));
});

// Reservation Endpoints
app.get('/api/reservations', (req, res) => {
    const db = new Database();
    db.getQuery('SELECT * FROM Reservation')
      .then((reservations) => res.send(reservations))
      .catch((error) => res.status(500).send({ error: 'Failed to fetch reservations', details: error }));
});

app.post('/api/reservations', (req, res) => {
    const { userId, campingSpotId, startingDate, endDate, totalPrice } = req.body;
    const db = new Database();
    const query = `INSERT INTO Reservation (UserId, CampingSpotId, StartingDate, EndDate, TotalPrice) 
                   VALUES (?, ?, ?, ?, ?)`;
    db.getQuery(query, [userId, campingSpotId, startingDate, endDate, totalPrice])
      .then(() => res.status(201).send({ message: 'Reservation created successfully' }))
      .catch((error) => res.status(500).send({ error: 'Failed to create reservation', details: error }));
});

// Reviews Endpoints
app.get('/api/reviews', (req, res) => {
    const db = new Database();
    db.getQuery('SELECT * FROM Reviews')
      .then((reviews) => res.send(reviews))
      .catch((error) => res.status(500).send({ error: 'Failed to fetch reviews', details: error }));
});

app.post('/api/reviews', (req, res) => {
    const { userId, campingSpotId, rating, comment, dateOfReview } = req.body;
    const db = new Database();
    const query = `INSERT INTO Reviews (UserId, CampingSpotId, Rating, Comment, DateOfReview) 
                   VALUES (?, ?, ?, ?, ?)`;
    db.getQuery(query, [userId, campingSpotId, rating, comment, dateOfReview])
      .then(() => res.status(201).send({ message: 'Review added successfully' }))
      .catch((error) => res.status(500).send({ error: 'Failed to add review', details: error }));
});

// Amenities Endpoint
app.get('/api/amenities', (req, res) => {
    const db = new Database();
    db.getQuery('SELECT * FROM Amenities')
      .then((amenities) => res.send(amenities))
      .catch((error) => res.status(500).send({ error: 'Failed to fetch amenities', details: error }));
});

// POST endpoint to add a new amenity
app.post('/api/amenities', (req, res) => {
  const { amenities } = req.body;
  const db = new Database();
  const query = `INSERT INTO Amenities (Amenities) VALUES (?)`;
  db.getQuery(query, [amenities])
    .then(() => res.status(201).send({ message: 'Amenity added successfully' }))
    .catch((error) => res.status(500).send({ error: 'Failed to add amenity', details: error }));
});

app.get('/api/users/:userId/bookings', (req, res) => {
  const db = new Database();
  const query = `
    SELECT 
      r.ReservationId,
      r.StartingDate,
      r.EndDate,
      r.TotalPrice,
      cs.Name as spotName,
      cs.CampingSpotId
    FROM Reservation r
    JOIN CampingSpot cs ON r.CampingSpotId = cs.CampingSpotId
    WHERE r.UserId = ?
    ORDER BY r.StartingDate DESC
  `;
  
  db.getQuery(query, [req.params.userId])
    .then(bookings => res.send(bookings))
    .catch(error => res.status(500).send({ error: 'Failed to fetch bookings', details: error }));
});


// Starten van de server en op welke port de server moet luisteren
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



