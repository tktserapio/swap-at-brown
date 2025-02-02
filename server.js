const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // This is important for parsing JSON bodies!

const uri = "mongodb+srv://tyroneserapio:FzRsWzkjVaODdWoW@cluster0.kt37d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Test the database connection
async function testConnection() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
testConnection();

// Your existing classes endpoint
app.get('/api/classes/:classCode', async (req, res) => {
    try {
        const database = client.db("LeSwapDatabase");
        const classes = database.collection("courses");
        
        const classData = await classes.findOne({ 
            classCode: req.params.classCode.toUpperCase() 
        });
        
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        
        res.json({ sections: classData.sections });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Swaps endpoint with added logging
app.post('/api/swaps', async (req, res) => {
    console.log('Received swap request:', req.body); // Add this logging

    try {
        const database = client.db("LeSwapDatabase");
        const swaps = database.collection("postings");
        
        const swapRequest = {
            leftClass: req.body.leftClass,
            rightClass: req.body.rightClass,
            desiredSection: req.body.desiredSection,
            currentSection: req.body.currentSection
        };
        
        console.log('Attempting to insert:', swapRequest); // Add this logging
        
        const result = await swaps.insertOne(swapRequest);
        console.log('Insert result:', result); // Add this logging
        
        if (result.acknowledged) {
            res.status(201).json({ message: 'Swap request created successfully' });
        } else {
            throw new Error('Failed to create swap request');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to create swap request' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});