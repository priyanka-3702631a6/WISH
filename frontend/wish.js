//lookup object for dynamic function
const drawings = {
    ball: drawBall,
    house: drawHouse
};


//displaying what you entered in input box
function createObject() {
    const obj = document.getElementById("takeObject").value.trim();
    const message = document.getElementById("message");
    if (obj !== "") {


        fetch("http://127.0.0.1:8000/object/" + encodeURIComponent(obj))
            //First .then() — parse JSON and check the HTTP status.
            .then(response => {
                return response.json().then(data => {
                    // Handle unsuccessful HTTP responses
                    if (!response.ok) {
                        //The server responds, but the status is unsuccessful, such as 404.
                        throw new Error("HTTP " + response.status + ": " + data.detail);
                    }
                    //return the Promise produced by response.json().
                    return data;
                });
            })

            //data represents the parsed JSON response i.e It is the JSON response after JavaScript parses it using response.json().
            .then(data => {
                message.textContent = "Backend received: " + data.object;

                // it's cleared after a successful backend response, before WISH checks whether the object is supported.
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const objectName = data.object.toLowerCase();
                const drawFunction = drawings[objectName];

                if (drawFunction !== undefined) {
                    drawFunction();
                } else {
                    message.textContent = "Sorry, WISH doesn't support this object yet.";
                }
            })

            //.catch() can handle a failed connection, but it won't automatically handle every unsuccessful HTTP response. 
            .catch(error => {
                //all status code except  in the successful 200–299 range even 404
                if (error.message.startsWith("HTTP ")) {
                    message.textContent = "Request failed: " + error.message;
                }
                //fastapi stopped 
                else {
                    message.textContent = "Cannot connect to WISH. Please try again.";
                }
            });


    } else {
        message.textContent = "You haven't entered an Object";

    }
}

//calling the createObject() on click of the btn 
document.getElementById("createObjectBtn").addEventListener("click", createObject);

//Find the drawing area
const canvas = document.getElementById("sketchCanvas");

//getContext("2d") gives us the tools to draw shapes, lines, and other graphics inside the Canvas. We store those tools in ctx, short for context.
const ctx = canvas.getContext("2d");



//DRAW A CIRCLE
function drawBall() {

    //Starts a new drawing path. does not prevent shapes from overlapping. It starts a new drawing path so that the new shape can be handled independently.
    ctx.beginPath();

    //Math.PI)	Defines a circle centred at (200, 200) with a radius of 60 pixels. 2 * Math.PI represents a full circle in radians, approximately 6.283.
    ctx.arc(200, 200, 60, 0, 2 * Math.PI);

    //Sets the fill colour to blue. As its default color is black
    ctx.fillStyle = "blue";

    //Fills the circle using that colour.
    ctx.fill();
}

/*
moveTo(x, y) moves the drawing position without drawing a line.
lineTo(x, y) draws a line to the next point.
closePath() connects the final point to the starting point.
Notice the order: we draw the roof first, then the house's body. Both shapes meet at y = 60.
*/
function drawHouse() {
    // Draw the roof
    ctx.beginPath();
    ctx.moveTo(50, 20);   // Top of roof
    ctx.lineTo(0, 60);   // Left corner
    ctx.lineTo(100, 60);   // Right corner
    ctx.closePath();
    ctx.fillStyle = "#b29173";
    ctx.fill();

    // Draw the body of the house
    ctx.fillStyle = "#edbe93";
    //fillRect() already draws and fills the rectangle in one operation.
    ctx.fillRect(10, 60, 80, 40);

    // Draw the door of the house
    ctx.fillStyle = "#1697a1";
    ctx.fillRect(50, 75, 20, 25);

    //add window
    ctx.fillStyle = "#f6eeee";
    ctx.fillRect(22, 65, 15, 15);
}