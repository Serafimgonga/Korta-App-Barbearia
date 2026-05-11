from fastapi import FastAPI

app = FastAPI(title="KORTA API")

@app.get("/")
def root():
    return {"message": "KORTA API is running"}