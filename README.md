# Monthly Expense Tracker

A full-stack expense tracking web application built with HTML, CSS, JavaScript, Java Spring Boot, Spring Data JPA, and an H2 database.

## Features
- Add and delete expenses
- Set a monthly budget
- Dashboard cards for budget, spending, and remaining balance
- Filter expenses by month
- Category-wise spending summary
- Budget usage percentage and budget warning
- Server-side validation and friendly error messages
- Persistent file-based H2 database (data stays between restarts)

## Technology
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Java 17+, Spring Boot 3.5.6, Spring Web
- Persistence: Spring Data JPA + H2
- Build: Maven

## Project structure
```text
Monthly-Expense-Tracker/
├── .gitignore
├── README.md
└── backend/
    ├── pom.xml
    ├── data/
    │   └── .gitkeep
    └── src/
        └── main/
            ├── java/com/expensetracker/
            │   ├── ExpenseTrackerApplication.java
            │   ├── controller/
            │   │   └── ExpenseController.java
            │   ├── dto/
            │   │   ├── BudgetRequest.java
            │   │   ├── ExpenseRequest.java
            │   │   └── MonthlySummary.java
            │   ├── exception/
            │   │   └── ApiExceptionHandler.java
            │   ├── model/
            │   │   ├── Budget.java
            │   │   └── Expense.java
            │   ├── repository/
            │   │   ├── BudgetRepository.java
            │   │   └── ExpenseRepository.java
            │   └── service/
            │       └── ExpenseService.java
            └── resources/
                ├── application.properties
                └── static/
                    ├── index.html
                    ├── style.css
                    └── app.js
```

## Requirements
- JDK 17 or newer
- Maven 3.6.3 or newer
- Internet connection for Maven to download dependencies on the first run

Check your installations in Command Prompt:
```bash
java -version
mvn -version
```

## Run on Windows
1. Extract the project ZIP.
2. Open the `Monthly-Expense-Tracker\backend` folder in a terminal.
3. Run:
   ```bash
   mvn spring-boot:run
   ```
4. Wait until Spring Boot says it has started.
5. Open `http://localhost:8080` in your browser.

The frontend is served by Spring Boot, so you do not need a separate frontend server.

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses?month=YYYY-MM` | List expenses; optional month filter |
| POST | `/api/expenses` | Create an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/budget` | Read monthly budget |
| PUT | `/api/budget` | Update monthly budget |
| GET | `/api/summary?month=YYYY-MM` | Monthly totals and category totals |

Example create-expense request:
```json
{
  "title": "Lunch",
  "category": "Food",
  "amount": 150.00,
  "date": "2026-10-16"
}
```

Example budget request:
```json
{
  "amount": 10000
}
```

## H2 database
The app uses a file-based H2 database in `backend/data/`. This means data is retained when you stop and restart the app. Do not upload your live database files if they contain personal spending data. The repository ignores generated database files.

For local debugging, the H2 console is available at `http://localhost:8080/h2-console`:
- JDBC URL: `jdbc:h2:file:./data/expensetracker`
- User Name: `sa`
- Password: leave blank

## Troubleshooting
- **`mvn` is not recognized:** install Maven and add its `bin` folder to PATH, or use an IDE with Maven support.
- **`java` is not recognized:** install JDK 17+ and configure `JAVA_HOME` and PATH.
- **Port 8080 is busy:** stop the other app or change `server.port` in `application.properties`.
- **Browser shows an error:** make sure the terminal running Spring Boot is still open and startup completed successfully.
- **Maven download fails:** check your internet connection and run `mvn spring-boot:run` again.

## GitHub upload
From the project root (the folder containing `.gitignore` and `README.md`):
```bash
git init
git add .
git commit -m "Build Monthly Expense Tracker web app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Monthly-Expense-Tracker.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username. Create an empty repository on GitHub first. Never commit private credentials or personal database records.
