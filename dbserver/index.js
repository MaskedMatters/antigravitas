import express from 'express';
import fs from 'node:fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/getMap', (req, res) => {
    try {
        const data = fs.readFileSync('./db.json', 'utf8');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
});

app.get('/getData', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`Database Server is running on port ${PORT}`);
});