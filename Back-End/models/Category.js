
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Images', 'Videos', 'Music', 'Pdf', 'Word', 'Other','Movies','Excel','PPTs','E-Books','Databases','Text-Files'], // Restrict values to these categories
        required: true
    },
    description: {
        type: String,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }]
});


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;


