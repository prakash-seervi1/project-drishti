from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ADK Agent Service is running"}

# Placeholder: Import and mount agent chat endpoint here 