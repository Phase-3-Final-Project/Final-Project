import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string|| 'mongodb://localhost:27017/rasantara';
const client = new MongoClient(uri);
export const database = client.db('rasantara');

export default client; 