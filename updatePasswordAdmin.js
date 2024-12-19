const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass',
  database: 'topinfo',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to the database.');

  // Fetch users where role is 'AGENT' and isSuperAgent is false
  const fetchQuery = "SELECT id, phone FROM User WHERE role = 'ADMIN' OR isSuperAgent = 1";

  db.query(fetchQuery, (err, users) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      db.end();
      return;
    }

    if (users.length === 0) {
      console.log('No users found matching the criteria.');
      db.end();
      return;
    }

    console.log(`Found ${users.length} users to update.`);

    // Iterate over users and update passwords
    users.forEach((user) => {
      const hashedPassword = bcrypt.hashSync(user.phone, 10); // Hash the phone number
      const updateQuery = "UPDATE User SET password = ? WHERE id = ?";

      db.query(updateQuery, [hashedPassword, user.id], (err) => {
        if (err) {
          console.error(`Error updating password for user ID ${user.id}:`, err.message);
        } else {
          console.log(`Password updated successfully for user ID ${user.id}`);
        }
      });
    });

    // Close the database connection after updates
    setTimeout(() => {
      db.end(() => {
        console.log('Database connection closed.');
      });
    }, 2000); // Delay to ensure all queries finish
  });
});
