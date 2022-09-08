const mongoose = require('mongoose')
const Schema = mongoose.Schema

const parameterSetSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  hidden: {
    type: Boolean,
    required: true,
    default: false
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  availableOn: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Instrument'
    }
  ],
  defaultParams: {
    type: Array,
    required: true,
    default: [
      { name: 'ns', value: null },
      { name: 'd1', value: null },
      { name: 'ds', value: null },
      { name: 'td1', value: null },
      { name: 'expt', value: null }
    ]
  },
  customParams: [{ name: String, comment: String, value: String }]
})

module.exports = mongoose.model('ParameterSet', parameterSetSchema)
