const express=require('express')
const morgan=require('morgan')
morgan.token('body', req=>JSON.stringify(req.body))

const app=express()
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: (req)=>req.method=='GET'
}))


persons=
[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response)=>{
    response.json(persons)
})
app.get('/api/persons/:id', (request, response)=>{
    const id=request.params.id
    const person=persons.find((person)=>{
        return person.id===id
    })
    if (!person){
        return response.status(404).end()
    }

    response.json(person)
})

app.get('/api/info', (request, response)=>{
    response.send(`<p>Phonebook has ${persons.length} persons</p><p>${Date()}</p>`)
})

app.delete('/api/persons/:id', (request, response)=>{
    const id=request.params.id
    const person=persons.find(person=>person.id===id)
    if (!person){
        response.status(404).end()
    }
    persons=persons.filter(person=>person.id!==id)
    response.status(204).end();
})

const generateId=()=>{
    return Math.floor(Math.random()*1000)
}

app.post('/api/persons', (request, response)=>{
    const body=request.body
    if (!body.name || !body.number) {
        return response.status(400).json({ error: "name or number are missing from the request" });
}

    if (persons.find(person=>{
        return person.name===body.name
    })){
        return response.status(400).json({"error": "name must be unique"})
    }

    const Person=
    {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons=persons.concat(Person)
    response.json(Person)
})



app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const body = request.body

  const personIndex = persons.findIndex(person => person.id === id)
  if (personIndex === -1) {
    return response.status(404).json({ error: 'person not found' })
  }

  const updatedPerson = {
    ...persons[personIndex],
    name: body.name,
    number: body.number
  }

  persons[personIndex] = updatedPerson
  response.json(updatedPerson)
})



const PORT=3001 || process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Listening for incoming connections on port ${PORT}`)
})