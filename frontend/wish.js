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
    const sizes = ["small", "big"];

    let color = "blue";
    let size = "normal";
    let shape = objectName;

    const colorIndex = parts.findIndex(part => colors.includes(part));

    if (colorIndex !== -1) {
        color = parts[colorIndex];
    }
    //finds a size word anywhere in the description
    const sizeIndex = parts.findIndex(part => sizes.includes(part));

    if (sizeIndex !== -1) {
        size = parts[sizeIndex];
    }
    //removes both color and size words, leaving the shape name.
    shape = parts.filter(part =>
        !colors.includes(part) && !sizes.includes(part)
    ).join(" ");

    return {
        object: shape,
        color: color,
        size: size
    };
}



function interpretDescription(description) {
    const objects = description.split(" and ");

    //map() runs interpretObject() on each description and result is an array of structured instructions.
    return objects.map(objectName => interpretObject(objectName.trim()));
}


function displayObject(objectName) {
    const instructions = interpretDescription(objectName);

    let displayedObjects = [];
    let limitReached = false;

    const positions = [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 100, y: 300 },
        { x: 300, y: 300 }
    ];


    //instructions.entries() gives us both the index and the object:
    for (const [index, item] of instructions.entries()) {
        const shape = item.object;
        const color = item.color;


        //To get rid of positions[index] undefined if the user enters a fifth object.
        if (index >= positions.length) {

            limitReached = true;
            break;
        }
        const x = positions[index].x;
        const y = positions[index].y;

        //skips the unsupported object and moves to the next iteration.
        if (!drawings[shape]) {
            continue;
        }

        if (shape === "ball") {
            drawBall(color, x, y, item.size);
        } else if (shape === "house") {
            drawHouse(color, x - 50, y - 50, item.size);
        } else if (shape === "tree") {
            drawTree(color, x - 50, y - 100, item.size);
        } else if (shape === "star") {
            drawStar(color, x - 250, y - 180,item.size);
        }

        displayedObjects.push(color + " " + shape);
    }

    if (limitReached) {
        message.textContent = "WISH can draw up to 4 objects at a time.";
    } else if (displayedObjects.length > 0) {
        message.textContent = "WISH drew: " + displayedObjects.join(" and ");
    } else {
        message.textContent = "Sorry, WISH doesn't support these objects yet.";
    }

}



//calling the createObject() on click of the btn 
document.getElementById("createObjectBtn").addEventListener("click", createObject);



//DRAW A CIRCLE
function drawBall(color, x, y, size = "normal") {

    //Starts a new drawing path. does not prevent shapes from overlapping. It starts a new drawing path so that the new shape can be handled independently.
    ctx.beginPath();

    let radius = 60;

    if (size === "small") {
        radius = 30;
    } else if (size === "big") {
        radius = 85;
    }

    //Math.PI)	Defines a circle centred at (200, 200) with a radius of 60 pixels. 2 * Math.PI represents a full circle in radians, approximately 6.283.
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

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


function drawHouse(color = "blue", x = 0, y = 0, size = "normal") {
    let scale = 1;

    if (size === "small") {
        scale = 0.6;
    } else if (size === "big") {
        scale = 1.3;
    }

    // Draw the roof
    ctx.beginPath();
    ctx.moveTo(x + 50 * scale, y + 20 * scale);
    ctx.lineTo(x, y + 60 * scale);
    ctx.lineTo(x + 100 * scale, y + 60 * scale);
    ctx.closePath();
    ctx.fillStyle = "#b29173";
    ctx.fill();

    // Draw the body
    ctx.fillStyle = color;
    ctx.fillRect(
        x + 10 * scale,
        y + 60 * scale,
        80 * scale,
        40 * scale
    );

    // Draw the door
    ctx.fillStyle = "#1697a1";
    ctx.fillRect(
        x + 50 * scale,
        y + 75 * scale,
        20 * scale,
        25 * scale
    );

    // Draw the window
    ctx.fillStyle = "#f6eeee";
    ctx.fillRect(
        x + 22 * scale,
        y + 65 * scale,
        15 * scale,
        15 * scale
    );
}



function drawTree(color = "green", x = 0, y = 0, size = "normal") {
    let scale = 1;

    if (size === "small") {
        scale = 0.6;
    } else if (size === "big") {
        scale = 1.3;
    }

    // Triangular canopy
    ctx.beginPath();
    ctx.moveTo(x + 50 * scale, y + 50 * scale);
    ctx.lineTo(x + 10 * scale, y + 150 * scale);
    ctx.lineTo(x + 90 * scale, y + 150 * scale);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Rectangular trunk
    ctx.fillStyle = "#b6350a";
    ctx.fillRect(
        x + 40 * scale,
        y + 150 * scale,
        20 * scale,
        70 * scale
    );
}





function drawStar(color = "yellow", x = 0, y = 0, size = "normal") {
    let scale = 1;

    if (size === "small") {
        scale = 0.6;
    } else if (size === "big") {
        scale = 1.3;
    }

    ctx.beginPath();
    ctx.moveTo(x + 250, y + 100);
    ctx.lineTo(x + 250 + 25 * scale, y + 100 + 75 * scale);
    ctx.lineTo(x + 250 + 100 * scale, y + 100 + 75 * scale);
    ctx.lineTo(x + 250 + 40 * scale, y + 100 + 120 * scale);
    ctx.lineTo(x + 250 + 60 * scale, y + 100 + 190 * scale);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
}




