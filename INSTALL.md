1. Install node.js (4+) and npm
2. Install global npm packages used to build webcdr:
    ```
    npm -g install bower browserify
    ```

3. Install bower dependencies:
    ```
    cd PATH_TO_WEBCDR/public
    bower install
    cd ..
    ```

4. Install npm dependencies:
    ```
    npm install
    ```
   
5. Build frontend:
    ```
    npm run build
    ```
   
6. Create a MySQL database for cdr data (WARNING: the script drops tables if they exist!):
    ```
    cd PATH_TO_WEBCDR/install
    mysqladmin create asteriskcdrdb
    mysql asteriskcdrdb -uuser -ppassword < db.sql
    ```
   
7. Set up your Asterisk to save cdr data into the database you've created
8. Set up your Asterisk to save call recordings to mp3 files. Files must contain uniqueid in names to find matching cdrs. Also, `record` column in the database table must be set to a non-null value to indicate presence of a recording
9. You can export following variables before starting service or pass them from service file
    * CONFIG=cdr        - cdr.ini file will be user as config file (default: config.ini)
    * PORT=8080         - server listen port (default: 9030)
    * LISTEN=0.0.0.0    - listen IP (default: 127.0.0.1)
10. Set database credentials, recordings glob pattern and other parameters in config.ini
11. Start the server (http://127.0.0.1:9030 by default):
    ```
    node server.js
    ```

    Use `admin`/`admincdr` to login for the first time. Don't forget to change the default password!

    Or if you want to use AD authentication start the server:
    ```
    node serverLdap.js
    ```
12. Use a process manager like forever, pm2, systemd to run server in background.
13. (optional) Set up standalone webserver to serve static files, proxy dynamic requests to node.js.
