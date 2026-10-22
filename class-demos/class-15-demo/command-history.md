way we opened terminal:

1. Navigate to Finder / File Explorer
    -Mac: RIght Click -> Services -> Open in Terminal
2. pwd
3. npm init -y
4. npm install express nunjucks

ways in which we run our server.js file

    1. node server.js
    this requires a restart
    every time we make
    changes to the file
    2. node --watch server,js
    this watches our server.js 
    file for changes and will 
    automatically restart the server
    3. node --watch --watch-path=views server.js
    this watches our server.js 
    file and all of our njk files 
    in our views folder