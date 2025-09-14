# Coffee-System  

.First you need to go to folder frontend and run: npm i  
.Second go to folder backend and run: npm i  
after that go to file .env in folder backend and configure:  
DB_CONNECTION=sqlsrv  
DB_HOST=127.0.0.1  
DB_PORT=1433  
DB_DATABASE=Coffee_Syste  <-- your database name  
DB_USERNAME=sa  <-- your dataabse username
DB_PASSWORD=  <-- your password databse if don't have leave it empty  

.Third step go to folder backend run: php artisan storage:link  
.Fourth go to folder backend run: php artisan migrate or php artisan migrate:fresh

Final:  
-You need to go to folder frontend run: npm run dev
_Go to folder backend run php artisan serve

After that open chrome: and run http://localhost:5173/
