Payroll-System API – Express.js

This is a backend Payroll system built with Node.js, Express.js, and PostgreSQL. It includes essential payroll features such as:

  ▪️JWT-based Authentication
  
  ▪️Attendance (Clock In / Clock Out)
  
  ▪️Overtime Management
  
  ▪️Reimbursement Submission
  
  ▪️Payroll & Payslip Generation
  
  ▪️Period Management

🚀 Getting Started

1. Clone the Repository

  git clone https://github.com/crazycentury/Payroll-System.git
  cd your-repo-name

2. Install Dependencies

  npm install

3. Configure Environment Variables

  Create a .env file in the root directory and add the following:
  
  PORT=3000
  
  # PostgreSQL Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=[your_db_user]
  DB_PASSWORD=[your_db_password]
  DB_NAME=payroll_db
  
  # JWT
  JWT_SECRET=[your_jwt_secret]
  
  For testing environment, use .env.test.
  *make sure your DB_NAME is correct
  
4. Setup Database

  Ensure PostgreSQL is running, then create your database:
  
  CREATE DATABASE payroll_db;
  
  Run migrations and seeds using Knex:
  
  npx knex migrate:latest
  npx knex seed:run

5. Start the Server

  For development:
  
  npm run dev
  
  Or to start the app:
  
  node server.js

  Server runs at: http://localhost:3000

📁 Project Structure

PAYSILP/
├── controllers/            # Request handler logic (auth, users)
├── db/                     # Knex setup, migrations, seeds
│   ├── migrations/
│   ├── seeds/
│   └── knex.js
├── middleware/             # Custom middlewares (e.g. auth)
│   └── authMiddleware.js
├── routes/                 # All API route definitions
│   ├── attendanceRoutes.js
│   ├── authRoutes.js
│   ├── overtimeRoutes.js
│   ├── payrollPeriodRoutes.js
│   ├── payrollRoutes.js
│   ├── payslipsRoutes.js
│   ├── reimbursementRoutes.js
│   └── users.js
├── test/                   # Unit & integration tests
│   ├── attendance.test.js
│   ├── payrollPeriods.test.js
│   └── utils.js
├── .env                    # Main environment config
├── .env.test               # Testing environment config
├── app.js                  # App entrypoint (used in tests)
├── server.js               # Production server entrypoint
├── knexfile.js             # Knex configuration
├── package.json
└── package-lock.json

📌 Available API Endpoints

*Method

*Endpoint

*Description


POST

/api/login

Login and get JWT token


POST

/api/payroll-periods

Insert payroll periods (admin only)


POST

/api/attendace/clock-in?test=true

Clock in


POST

/api/attendace/clock-out?test=true

Clock out


POST

/api/overtimes

Submit overtime


POST

/api/reimbursement

Submit reimbursement


POST

/api/payroll/run

Generate payroll (admin only)


GET

/api/payslips?payroll_period_id=payroll_period_id

Get payslip for user

GET

/api/payslips/summary?payroll_period_id=payroll_period_id

Get all payslip (admin only)

You can explore other routes inside the routes/ folder.

🧪 Running Tests

To run the test suite:

npm test

🛠 Built With

Node.js

Express.js

PostgreSQL

Knex.js (SQL query builder)

JWT Authentication


📄 License

This project is open-source and available for educational or development purposes.
