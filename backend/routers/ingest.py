import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, File, UploadFile, Depends, Response

from backend.auth import (
    verify_bearer_token,
    require_case_management_role,
    AuthenticatedUser
)
from backend.schemas import (
    IngestValidateResponse,
    IngestConfirmRequest,
    IngestConfirmResponse
)
from backend.ingestion import ingestion_service

logger = logging.getLogger("jandrishti.ingest")

router = APIRouter(prefix="/api/ingest", tags=["Data Ingestion"])

@router.get("/template")
@router.get("/template.csv", include_in_schema=False)
def download_csv_template():
    """Download standard MPLADS CSV ingestion template with sample rows."""
    content = ingestion_service.get_csv_template()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mplads_ingestion_template.csv"}
    )

@router.post("/upload", response_model=IngestValidateResponse)
async def upload_and_validate_dataset(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Upload CSV or Excel file, parse contents, and execute comprehensive validation checks."""
    try:
        content = await file.read()
        rows = ingestion_service.parse_file_content(file.filename, content)
        report = ingestion_service.validate_dataset(rows)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

@router.post("/validate-json", response_model=IngestValidateResponse)
def validate_dataset_json(
    rows: List[Dict[str, Any]],
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Validate raw tabular project records against MPLADS validation rules."""
    return ingestion_service.validate_dataset(rows)

@router.post("/sample-demo", response_model=IngestValidateResponse)
def load_sample_demo_batch(
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Load built-in realistic synthetic demo batch with intentional analytical anomalies for testing."""
    demo_rows = ingestion_service.get_sample_demo_batch()
    return ingestion_service.validate_dataset(demo_rows)

@router.post("/confirm", response_model=IngestConfirmResponse)
def confirm_dataset_import(
    req: IngestConfirmRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Confirm import of validated records, normalize to database, and trigger risk engine & alerts."""
    try:
        result = ingestion_service.confirm_import(
            batch_id=req.batch_id,
            user=current_user.display_name,
            role=current_user.role
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Import confirm error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to confirm import: {str(e)}")
