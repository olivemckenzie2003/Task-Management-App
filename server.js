const tasks = require("./data");
const http = require("http");

//The Node.js file system module allows you to work with the file system on your computer.
//To include the File System module, use the require() method: const fs = require('fs');
//Common use for the File System module: Read files.
const fs = require("fs");

//The Path module provides a way of working with directories and file paths.
const path = require("path");

//If you are working on a web application that needs to be accessible to the internet,
//you will need to open port 3000 to allow traffic to reach your application
const PORT = 3001;

//represents the absolute path to the directory containing
//the currently executing script.
//path.join utility provided by the Path module. It allows you to concatenate
//multiple path segments together to form a new path
const DATA_FILE_PATH = path.join(__dirname, "data.json");

//The createServer method creates a server on your computer
//The http.createServer() method turns your computer into an HTTP server.
//The http.createServer() method creates an HTTP Server object.
//The HTTP Server object can listen to ports on your computer and execute
//a function, a requestListener, each time a request is made.
//http.createServer(requestListener);
//requestListener-Optional. Specifies a function to be executed every
//time the server gets a request. This function is called a requestListener,
const server = http.createServer((req, res) => {
  //Creating end point for when the front end want to get data from the back end
  //Check if the request coming from the fetch has the requested code "/tasks?id="

  if (req.method === "GET" && req.url.includes("/tasks?id=")) {
    //if it true it will read the file data.json file
    fs.readFile(DATA_FILE_PATH, (err, data) => {
      //if some call the task with id
      //if it not available read the file data.json throw an error
      if (err) {
        console.error("Error reading data file:", err);
        //500 internal server error. There is an issue with the server
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        //When File is found means data.json found from the backend
        //Check the string of characters and if there is an equal sign
        //it will spill the text before and after the array
        // Check the request url .split means takes in a string and where it see equalto it will
        //break the string into two. First bit before the equal sign will be text/string
        //the second text in the array will be the text after the equals sign
        //get the task ID coming from the front end
        const query = req.url.split("=")[1];
        //After retreive the id from the front end check inside task array (data.task)
        //find method that loops through all the elements in an array.
        //Check which element is equal to the ID of the query
        //If true save the value in "singleData "
        const singleData = JSON.parse(data.toString()).tasks.find(
          //must be same value and sametype
          (d) => d.TaskID === Number(query)
        );
        //if find single data send it back to the front end
        //send response codde that it is successful back to the front end
        if (singleData) {
          //resource when found successfully return the data to the front end
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(singleData));
        } else {
          //when a resource is not found from the back end
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Task not found");
        }
      }
    });
  }
  //if the response === to send message and submit button activatied
  else if (req.method === "GET" && req.url === "/tasks") {
    fs.readFile(DATA_FILE_PATH, (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      }
    });
  } else if (req.method === "POST" && req.url === "/submit") {
    //Given that the request sent to the backend is a Readable stream,
    //the EventEmitter API is used as a means of reading data off
    //this stream (we do not need to import the ‘events’ module
    //here since the request object extends EventEmitter):
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });

    req.on("end", () => {
      const task = JSON.parse(body);
      let tasks;
      fs.readFile(DATA_FILE_PATH, (err, data) => {
        if (err) {
          console.error("Error reading data file:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          if (data.length > 0) {
            //check for task array,if not there it points to an empty array
            tasks = JSON.parse(data).tasks || [];
          }
          //Push new task to array
          tasks.push(task);
          //write into the data.json file and save the data
          fs.writeFile(
            DATA_FILE_PATH,
            // write a new data into data.json such that it has a name called task
            // add it to array comming from line 88 tasks.push(task);
            JSON.stringify({ tasks: tasks }),
            (err) => {
              if (err) {
                console.error("Error writing data file:", err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
              } else {
                console.log("Task saved successfully.");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(task));
              }
            }
          );
        }
      });
    });
  } else {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*

const fs = require('fs');
const pathToFile = 'path/to/your/json/file.json'; // Replace with your actual file path

// Read the JSON data from the file
let data = require(pathToFile);

// Specify the key you want to delete
const deleteKey = 'nickname';

// Delete the key from the data object
delete data[deleteKey];

// Write the updated data back to the file
fs.writeFileSync(pathToFile, JSON.stringify(data, null, 4), 'utf8');

// Respond with a success message
console.log(`${deleteKey} was deleted`);



*/
