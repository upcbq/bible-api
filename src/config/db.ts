import mongoose from 'mongoose';
import CONFIG from './config';

mongoose.set('useCreateIndex', true);

// Connecting to the database
export default (async () => {
  try {
    await mongoose.connect(CONFIG.DB_HOST, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      user: CONFIG.DB_USER,
      pass: CONFIG.DB_PASSWORD,
    });
    // listen for requests
    console.log('The Conection is Ok');
  } catch (err) {
    console.log(`${err} Could not Connect to the Database. Exiting Now...`);
    process.exit();
  }
})();
