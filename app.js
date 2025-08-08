const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
