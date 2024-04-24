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

  if (req.method === "GET" && req.url.match(/\.css$/)) {
    // Handle requests for CSS files
    const filePath = path.join(__dirname, req.url); // Construct file path
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      }
    });
  }

  // Handle static file requests
  else if (req.method === "GET" && req.url.match(/\.html$/)) {
    const filePath = path.join(__dirname, req.url); // Construct file path
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
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
  } else if (req.method === "PUT" && req.url.startsWith("/update")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const updatedTask = JSON.parse(body);
        console.log(updatedTask);
        fs.readFile(DATA_FILE_PATH, (err, data) => {
          if (err) {
            console.error("Error reading data file:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          } else {
            const tasks = JSON.parse(data).tasks;
            const taskIndex = tasks.findIndex(
              (task) => task.taskID === updatedTask.taskID
            );
            console.log(taskIndex);
            if (taskIndex !== -1) {
              tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
              fs.writeFile(
                DATA_FILE_PATH,
                JSON.stringify({ tasks: tasks }),
                (err) => {
                  if (err) {
                    console.error("Error writing to data file:", err);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                  } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        message: "Task updated successfully.",
                        task: tasks[taskIndex],
                      })
                    );
                  }
                }
              );
            } else {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end("Task not found");
            }
          }
        });
      } catch (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON in request body");
      }
    });
  } else if (req.method === "DELETE" && req.url === "/delete") {
    //Getting the data that is coming from the form which is the ID
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    //end of call request
    req.on("end", () => {
      //convert info from user to json format
      const taskDelete = JSON.parse(body);
      console.log(taskDelete);
      //Read the file data.json
      fs.readFile(DATA_FILE_PATH, (err, data) => {
        //Error handling if cannot access data
        if (err) {
          console.error("Error reading data file:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          //getting the task from the json file
          const tasks = JSON.parse(data).tasks;
          //console.log(tasks);
          //Updating the task and loop through the array
          //only return the task that has the ID
          const updatedTasks = tasks.filter(
            (task) => task.taskID !== Number(taskDelete.taskID)
          );
          //console.log("updated tasks", updatedTasks);
          //Write the updated files without file deleted back to file.
          fs.writeFile(
            DATA_FILE_PATH,
            JSON.stringify({ tasks: updatedTasks }),
            //Handle error when writing to the file
            (err) => {
              if (err) {
                console.error("Error deleting task:", err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
              } else {
                console.log("Task deleted successfully.");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: "Task deleted successfully.",
                  })
                );
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
