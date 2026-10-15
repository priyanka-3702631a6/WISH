//lookup object for dynamic function
const drawings = {
    ball: drawBall,
    house: drawHouse,
    tree: drawTree,
    star: drawStar
};

const objectInput = document.getElementById("takeObject");
const message = document.getElementById("message");

//Find the drawing area
const canvas = document.getElementById("sketchCanvas");
//getContext("2d") gives us the tools to draw shapes, lines, and other graphics inside the Canvas. We store those tools in ctx, short for context.
const ctx = canvas.getContext("2d");

//displaying what you entered in input box
function createObject() {
    const obj = objectInput.value.trim();
    if (obj !== "") {


        fetch("http://127.0.0.1:8000/object/" + encodeURIComponent(obj))
            //First .then() — parse JSON and check the HTTP status.
            .then(response => {
                return response.json().then(data => {
                    // Handle unsuccessful HTTP responses
                    if (!response.ok) {
                        //The server responds, but the status is unsuccessful, such as 404.
                        const error = new Error("HTTP " + response.status + ": " + data.detail);
                        error.name = "HttpError";
                        throw error;
                    }
                    //return the Promise produced by response.json().
                    return data;
                });
            })

            // data is the parsed JSON response.
            .then(data => {

                // it's cleared after a successful backend response, before WISH checks whether the object is supported.
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                displayObject(data.object.toLowerCase());

            })

            //.catch() can handle a failed connection, but it won't automatically handle every unsuccessful HTTP response. 
            .catch(error => {
                //all status code except  in the successful 200–299 range even 404
                if (error.name === "HttpError") {
                    message.textContent = "Request failed: " + error.message;
                }
                //fastapi stopped but TypeError isn't exclusive to network failures. For example, some JavaScript bugs can also produce a TypeError
                else if (error instanceof TypeError) {
                    message.textContent = "Cannot connect to WISH. Please try again.";
                } else {
                    message.textContent = "Something went wrong in WISH. Please try again.";
                    console.error(error);
                }
            });


    } else {
        //clearing the previous canvas if there 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        message.textContent = "You haven't entered an Object";

    }
}


function interpretObject(objectName) {
    const parts = objectName.split(" ");
    const colors = ["blue", "red", "green", "yellow", "purple"];

    let color = "blue";
    let shape = objectName;

    if (colors.includes(parts[0])) {
        color = parts[0];
        shape = parts.slice(1).join(" ");
    }

    return {
        object: shape,
        color: color
    };
}



function displayObject(objectName) {
    const instructions = interpretObject(objectName);

    const shape = instructions.object;
    const color = instructions.color;

    if (drawings[shape] !== undefined) {
        message.textContent = "Backend received: " + objectName;
        drawings[shape](color);
    } else {
        message.textContent = "Sorry, WISH doesn't support this object yet.";
    }
}


//calling the createObject() on click of the btn 
document.getElementById("createObjectBtn").addEventListener("click", createObject);



//DRAW A CIRCLE
function drawBall(color) {

    //Starts a new drawing path. does not prevent shapes from overlapping. It starts a new drawing path so that the new shape can be handled independently.
    ctx.beginPath();

    //Math.PI)	Defines a circle centred at (200, 200) with a radius of 60 pixels. 2 * Math.PI represents a full circle in radians, approximately 6.283.
    ctx.arc(200, 200, 60, 0, 2 * Math.PI);

    //Sets the fill colour to blue. As its default color is black
    ctx.fillStyle = color;

    //Fills the circle using that colour.
    ctx.fill();
}

/*
moveTo(x, y) moves the drawing position without drawing a line.
lineTo(x, y) draws a line to the next point.
closePath() connects the final point to the starting point.
Notice the order: we draw the roof first, then the house's body. Both shapes meet at y = 60.
*/
function drawHouse(color= "blue") {
    // Draw the roof
    ctx.beginPath();
    ctx.moveTo(50, 20);   // Top of roof
    ctx.lineTo(0, 60);   // Left corner
    ctx.lineTo(100, 60);   // Right corner
    ctx.closePath();
    ctx.fillStyle = "#b29173";
    ctx.fill();

    // Draw the body of the house
    ctx.fillStyle = color;
    //fillRect() already draws and fills the rectangle in one operation.
    ctx.fillRect(10, 60, 80, 40);

    // Draw the door of the house
    ctx.fillStyle = "#1697a1";
    ctx.fillRect(50, 75, 20, 25);

    //add window
    ctx.fillStyle = "#f6eeee";
    ctx.fillRect(22, 65, 15, 15);
}

function drawTree(color="green") {

    //Green triangular canopy
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(10, 150);
    ctx.lineTo(90, 150);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    //Brown rectangular trunk
    ctx.fillStyle = "#b6350a";
    ctx.fillRect(40, 150, 20, 70)

}

function drawStar(color="yellow") {

    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(225, 175);
    ctx.lineTo(300, 175);
    ctx.lineTo(240, 220);
    ctx.lineTo(260, 290);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}