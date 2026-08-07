const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  console.log('Connected to Clever Cloud MySQL...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','employee') NOT NULL,
      emp_id VARCHAR(20) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      position VARCHAR(100),
      department VARCHAR(100),
      join_date DATE,
      email VARCHAR(100),
      phone VARCHAR(20),
      status ENUM('active','inactive') DEFAULT 'active'
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) NOT NULL,
      date DATE NOT NULL,
      check_in TIME,
      check_out TIME,
      status ENUM('present','absent','late','half-day') DEFAULT 'present',
      FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) NOT NULL,
      leave_type VARCHAR(50),
      start_date DATE,
      end_date DATE,
      reason TEXT,
      status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS payroll (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) NOT NULL,
      month VARCHAR(20),
      year INT,
      basic_salary DECIMAL(10,2),
      deductions DECIMAL(10,2) DEFAULT 0,
      net_salary DECIMAL(10,2),
      status ENUM('Paid','Pending') DEFAULT 'Pending',
      FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
    )`,
    `CREATE TABLE IF NOT EXISTS data_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) NOT NULL,
      file_name VARCHAR(255),
      extracted_text LONGTEXT,
      submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('Pending','Reviewed') DEFAULT 'Pending',
      FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
    )`,
    `INSERT IGNORE INTO employees (emp_id, name, position, department, join_date, email, phone)
     VALUES ('E001', 'Nitharshana K J', 'Junior Developer', 'Engineering', '2025-07-07', 'nitharshana@vendhan.com', '9999999999')`,
    `INSERT IGNORE INTO users (email, password, role, emp_id)
     VALUES ('admin@vendhan.com', 'admin123', 'admin', NULL)`,
    `INSERT IGNORE INTO users (email, password, role, emp_id)
     VALUES ('nitharshana@vendhan.com', 'emp123', 'employee', 'E001')`
  ];

  for (const stmt of statements) {
    await connection.execute(stmt);
    console.log('✓ Executed:', stmt.slice(0, 50).replace(/\s+/g, ' ') + '...');
  }

  console.log('\n✅ All tables created and starter data inserted!');
  await connection.end();
}

setupDatabase().catch(err => {
  console.error('❌ Error:', err.message);
});