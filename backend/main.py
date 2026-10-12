#imported the FastAPI class from the FastAPI package.
from fastapi import FastAPI, HTTPException
#CORSMiddleware is the FastAPI/Starlette middleware that adds the appropriate CORS headers to responses.
from fastapi.middleware.cors import CORSMiddleware

"""
- FastAPI → the class we imported.
- FastAPI() → creates a FastAPI application.
- app → the variable that holds our application.

So conceptually:
FastAPI package → FastAPI class → create an app → store it in app
"""


#FastAPI() is calling the class to create an instance (object) of that class.
app = FastAPI()
#adds a layer that handles certain aspects of requests and responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


"""  
"/" represents the root URL of our backend, / is the part FastAPI will recognize i.e, 
The @app.get("/") line tells FastAPI:
"When someone sends a GET request to /, FastAPI, register home() function as the handler for GET requests to /.
"""
@app.get("/")
def home():
    return {"message": "WISH backend is running"}


#path parameter name and function parameter name has to be same like object_name
@app.get("/object/{object_name}")
def get_object(object_name: str):
    object_name = object_name.strip()

    if object_name == "":
        raise HTTPException(
            status_code=400,
            detail="Must enter an object"
        )

    return {"object": object_name}
    
         
    