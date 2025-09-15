# Coffee-System

!!Requirement:  
- Node Js
- PHP
- Sql Server

. First you need to go to folder frontend and run: npm i  

. Second go to folder backend and run: npm i  

=> After that go to file .env in folder backend and configure:  
DB_CONNECTION=sqlsrv &nbsp;&nbsp; <-- use sql serve to avoid error database  
DB_HOST=127.0.0.1 &nbsp;&nbsp; <-- your default host  
DB_PORT=1433 &nbsp;&nbsp; <-- your database port (sql server defualt port 1433)  
DB_DATABASE=Coffee_Syste &nbsp;&nbsp; <-- your database name  
DB_USERNAME=sa &nbsp;&nbsp; <-- your dataabse username  
DB_PASSWORD= &nbsp;&nbsp; <-- your password databse if don't have leave it empty  

. Third step go to folder backend run: php artisan storage:link  
. Fourth go to folder backend and run: php artisan migrate  

==> Create Account go to backend folder and run: npm run dev    

- php artisan migrate:fresh --seed  
  --You done Create Account!!--  

Final:  

- Open root folder and run: npm run dev  

After that open Chrome and run: http://localhost:5173/  
