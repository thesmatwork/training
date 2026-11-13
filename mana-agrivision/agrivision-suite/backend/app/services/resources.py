from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException
from postgrest.exceptions import APIError

from app.db.supabase import get_db


TABLE_COLUMNS = {
    "farms": ["farm_name", "location", "state", "district", "village", "land_area", "land_unit", "soil_type", "description"],
    "farm_management": ["farm_id", "record_type", "title", "record_date", "status"],
    "farm_resources": ["farm_id", "resource_type", "item_name", "quantity", "unit", "amount", "transaction_date"],
    "app_records": ["category", "kind", "pk", "sk"],
    "learning": ["record_type", "title", "description", "content", "category", "resource_url", "progress", "status"],
    "market_data": ["record_type", "crop_name", "state", "district", "market_name", "min_price", "max_price", "modal_price", "price_date", "source"],
    "ai_assistant": ["conversation_id", "record_type", "role", "content"],
}


def _now(table: str):
    now = datetime.now(timezone.utc)
    return int(now.timestamp()) if table == "app_records" else now.isoformat()


def _unwrap(payload: dict) -> dict:
    if isinstance(payload, dict) and isinstance(payload.get("data"), dict):
        return {**payload["data"], **{k: v for k, v in payload.items() if k != "data"}}
    return payload if isinstance(payload, dict) else {}


def _flatten_for_table(table: str, row: dict):
    if not row:
        return row
    result = dict(row.get("data") or {})
    for key in TABLE_COLUMNS.get(table, []):
        if row.get(key) is not None:
            result[key] = row[key]
    result.update({
        "id": row.get("id"),
        "user_id": row.get("owner_id"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    })
    return result


def _build_record(table: str, user_id: str, payload: dict, existing=None, fixed_filters=None):
    data = _unwrap(payload)
    timestamp = _now(table)
    record = {"owner_id": user_id, "data": data, "updated_at": timestamp}
    if existing is None:
        record["created_at"] = timestamp

    for key in TABLE_COLUMNS.get(table, []):
        if key in data and key not in {"pk", "sk"}:
            record[key] = data[key]

    if table == "app_records":
        category = (fixed_filters or {}).get("category") or data.get("category") or "general"
        kind = (fixed_filters or {}).get("kind") or data.get("kind") or category
        record.update({
            "id": (existing or {}).get("id") or str(uuid4()),
            "pk": (existing or {}).get("pk") or f"USER#{user_id}",
            "sk": (existing or {}).get("sk") or f"{str(kind).upper()}#{uuid4()}",
            "category": category,
            "kind": kind,
        })

    if table == "farm_management":
        record["record_type"] = (fixed_filters or {}).get("record_type") or data.get("record_type") or "task"
        if not record.get("record_date"):
            record["record_date"] = data.get("due_date") or data.get("date")

    if table == "farm_resources":
        record["resource_type"] = (fixed_filters or {}).get("resource_type") or data.get("resource_type") or "general"
        record["item_name"] = data.get("item_name") or data.get("name") or data.get("title") or "Unnamed item"
        if not record.get("transaction_date"):
            record["transaction_date"] = data.get("date")

    if table == "learning":
        record["record_type"] = (fixed_filters or {}).get("record_type") or data.get("record_type") or "progress"

    return record


def _scope(query, user_id: str, fixed_filters=None):
    query = query.eq("owner_id", user_id)
    for key, value in (fixed_filters or {}).items():
        query = query.eq(key, value)
    return query


def list_owned(table: str, user_id: str, filters=None, limit=100, offset=0, fixed_filters=None):
    try:
        query = _scope(get_db().table(table).select("*"), user_id, fixed_filters)
        rows = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute().data or []
        result = [_flatten_for_table(table, row) for row in rows]
        for key, value in (filters or {}).items():
            if value is not None:
                result = [item for item in result if str(item.get(key)) == str(value)]
        return result
    except APIError as exc:
        print(f"Supabase list error [{table}]: {exc}")
        raise HTTPException(status_code=500, detail=f"Unable to fetch {table} records") from exc


def create_owned(table: str, user_id: str, data: dict, fixed_filters=None):
    try:
        record = _build_record(table, user_id, data, fixed_filters=fixed_filters)
        result = get_db().table(table).insert(record).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Unable to create record")
        return _flatten_for_table(table, result.data[0])
    except APIError as exc:
        print(f"Supabase create error [{table}]: {exc}")
        raise HTTPException(status_code=400, detail=f"Unable to create {table} record. Check required fields.") from exc


def get_owned(table: str, user_id: str, item_id: str, fixed_filters=None):
    try:
        query = _scope(get_db().table(table).select("*"), user_id, fixed_filters)
        row = query.eq("id", item_id).maybe_single().execute().data
        if not row:
            raise HTTPException(status_code=404, detail="Record not found")
        return _flatten_for_table(table, row)
    except APIError as exc:
        print(f"Supabase get error [{table}]: {exc}")
        raise HTTPException(status_code=500, detail=f"Unable to fetch {table} record") from exc


def update_owned(table: str, user_id: str, item_id: str, data: dict, fixed_filters=None):
    try:
        current = get_owned(table, user_id, item_id, fixed_filters)
        merged = {k: v for k, v in current.items() if k not in {"id", "user_id", "created_at", "updated_at"}}
        merged.update(_unwrap(data))
        raw = _scope(get_db().table(table).select("*"), user_id, fixed_filters).eq("id", item_id).maybe_single().execute().data
        record = _build_record(table, user_id, merged, existing=raw, fixed_filters=fixed_filters)
        result = _scope(get_db().table(table).update(record), user_id, fixed_filters).eq("id", item_id).execute()
        if not result.data:
            return get_owned(table, user_id, item_id, fixed_filters)
        return _flatten_for_table(table, result.data[0])
    except APIError as exc:
        print(f"Supabase update error [{table}]: {exc}")
        raise HTTPException(status_code=400, detail=f"Unable to update {table} record") from exc


def delete_owned(table: str, user_id: str, item_id: str, fixed_filters=None):
    try:
        get_owned(table, user_id, item_id, fixed_filters)
        _scope(get_db().table(table).delete(), user_id, fixed_filters).eq("id", item_id).execute()
    except APIError as exc:
        print(f"Supabase delete error [{table}]: {exc}")
        raise HTTPException(status_code=400, detail=f"Unable to delete {table} record") from exc
