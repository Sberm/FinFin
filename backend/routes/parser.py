from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser_service import parse_csv, extract_pdf_text
from services.llm_service import parse_pdf_transactions

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            transactions = parse_csv(content)
        elif filename.endswith(".pdf"):
            raw_text = extract_pdf_text(content)
            transactions = await parse_pdf_transactions(raw_text)
        else:
            raise HTTPException(status_code=400, detail="Only CSV and PDF files are supported")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

    return {"count": len(transactions), "transactions": transactions}
