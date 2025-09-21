const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: String
});

personSchema.set('toJSON', {
    transform: (document, ret) => {
        ret.id = ret._id.toString(),
        delete ret._id,
        delete ret.__v
    }
});

module.exports = mongoose.model('Person', personSchema);