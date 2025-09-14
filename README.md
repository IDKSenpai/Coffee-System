# Coffee-System  

.First you need to go to folder frontend and run: npm i  
.Second go to folder backend and run: npm i  
=> After that go to file .env in folder backend and configure:  
DB_CONNECTION=sqlsrv      <-- use sql serve to avoid error database
DB_HOST=127.0.0.1         <-- your default host 
DB_PORT=1433              <-- your database port (sql server defualt port 1433)
DB_DATABASE=Coffee_Syste  <-- your database name  
DB_USERNAME=sa            <-- your dataabse username
DB_PASSWORD=              <-- your password databse if don't have leave it empty  

.Third step go to folder backend run: php artisan storage:link  
.Fourth go to folder backend and run: php artisan migrate 

==> Create Account: go to folder backend and run: php artisan tinker
and then run under two command:
use Illuminate\Support\Facades\Hash;
\App\Models\User::create(['username' => 'admin', 'password' => Hash::make('123'), 'role' => 'owner',]);
--You done Create Account!!--

Final:  
- You need to go to folder frontend run: npm run dev
- Go to folder backend run php artisan serve

After that open chrome and run: http://localhost:5173/
