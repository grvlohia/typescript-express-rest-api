import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.KEY);

const app = express();
const port = process.env.PORT || 3100;

app.get('/', (req: Request, res: Response) => {
	res.send('Hurray!!!');
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
