from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser_service import parse_csv, parse_pdf

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename")
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            transactions = parse_csv(content)
        elif filename.endswith(".pdf"):
            transactions = parse_pdf(content)
        else:
            raise HTTPException(status_code=400, detail="Only CSV and PDF files are supported")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {"count": len(transactions), "transactions": transactions}
