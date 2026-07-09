import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..services.auth import require_admin

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingUpdateRequest(BaseModel):
    content: str

# Helper to find the markdown path
def get_markdown_file_path(page_id: str) -> str:
    # Ensure page_id is valid
    if page_id not in ("ai", "data", "docs"):
        raise HTTPException(status_code=400, detail="Invalid page ID. Must be 'ai', 'data', or 'docs'.")
    
    # Try different paths relative to where the server might be running
    paths_to_try = [
        # Relative to project root
        os.path.join("frontend", "public", "markdown", f"{page_id}.md"),
        # Relative to server-side directory
        os.path.join("..", "frontend", "public", "markdown", f"{page_id}.md"),
        # Absolute path in typical setup
        os.path.join("/Users/adiaimanputra/Documents/Codes/Class/CSC577/Projects/LETI_Project_Working_Folder/frontend/public/markdown", f"{page_id}.md")
    ]
    
    for path in paths_to_try:
        if os.path.exists(os.path.dirname(path)):
            return path
            
    # Default fallback to first path
    return paths_to_try[0]

@router.get("/{page_id}")
async def get_setting(page_id: str):
    file_path = get_markdown_file_path(page_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Markdown file for page '{page_id}' not found.")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"page_id": page_id, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@router.put("/{page_id}")
async def update_setting(
    page_id: str,
    request: SettingUpdateRequest,
    _current_user = Depends(require_admin)
):
    file_path = get_markdown_file_path(page_id)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(request.content)
        return {"page_id": page_id, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing file: {str(e)}")
