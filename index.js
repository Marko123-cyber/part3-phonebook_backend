require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

// Connect to MongoDB
const url = process.env.MONGO_DB_URI

if (!url) {
  console.error('Error: MONGO_DB_URI is not defined in .env file')
  process.exit(1)
}

console.log('Connecting to MongoDB...')
mongoose.set('strictQuery', false)

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    })
    console.log('Successfully connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    console.error('Connection URL used:', url.replace(/:([^:]+)@/, ':***@')) // Hide password in logs
    process.exit(1)
  }
}

connectToMongoDB()

const app = express()

// --- Custom middleware: logging ---
morgan.token('body', req => JSON.stringify(req.body))
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: req => req.method === 'GET'
}))


// --- Routes ---

// Get all persons
app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => res.json(persons))
        .catch(error => next(error))
})

// Get one person by ID
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (!person) return res.status(404).json({ error: 'person not found' })
            res.json(person)
        })
        .catch(error => next(error))
})

// Info endpoint
app.get('/api/info', (req, res, next) => {
    Person.countDocuments({})
        .then(count => {
            res.send(`<p>Phonebook has ${count} persons</p><p>${Date()}</p>`)
        })
        .catch(error => next(error))
})

// Delete a person
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(deletedPerson => {
            if (!deletedPerson) return res.status(404).json({ error: 'person not found' })
            res.status(204).end()
        })
        .catch(error => next(error))
})

// Create a new person
app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body
    if (!name || !number) {
        return res.status(400).json({ error: 'name or number is missing' })
    }

    Person.findOne({ name: name })
        .then(foundPerson => {
            if (foundPerson) {
                return res.status(400).json({ error: 'person already exists in database' })
            }

            const newPerson = new Person({ name, number })
            return newPerson.save()
        })
        .then(savedPerson => {
            if (savedPerson) res.json(savedPerson)
        })
        .catch(error => next(error))
})


// Update a person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findById(req.params.id)
        .then(person => {
            if (!person) return res.status(404).json({ error: 'person not found' })
            person.name = name
            person.number = number
            return person.save()
        })
        .then(updatedPerson => res.json(updatedPerson))
        .catch(error => next(error))
})


// --- Error-handling middleware ---
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'internal server error' })
}
// Unknown endpoint middleware
const unknownEndpoint = (request, response) => { response.status(404).send({ error: 'unknown endpoint' }) } 

app.use(unknownEndpoint)
app.use(errorHandler)

// --- Start server ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
