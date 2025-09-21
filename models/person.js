const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        if (!v || v.length < 8) {
          return false
        }
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number! Must be at least 8 characters and in the form XX-XXXXXXX or XXX-XXXXXXX`
    }
  }
})


personSchema.set('toJSON', {
    transform: (document, ret) => {
        ret.id = ret._id.toString(),
        delete ret._id,
        delete ret.__v
    }
});

module.exports = mongoose.model('Person', personSchema);