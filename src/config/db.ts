import mongoose from 'mongoose';
import CONFIG from './config';

// Connecting to the database
export default (async () => {
  try {
    await mongoose.connect(CONFIG.DB_HOST, {
      user: CONFIG.DB_USER,
      pass: CONFIG.DB_PASSWORD,
    });
    // listen for requests
    console.log('The Connection is Ok');
  } catch (err) {
    console.log(`${err} Could not Connect to the Database. Exiting Now...`);
    process.exit();
  }
})();
