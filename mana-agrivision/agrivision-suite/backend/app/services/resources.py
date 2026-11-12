
from datetime import datetime, timezone

from fastapi import HTTPException
from postgrest.exceptions import APIError

from app.db.supabase import get_db


# Existing Supabase database columns.
TABLE_COLUMNS = {
    "farms": [
        "farm_name",
        "location",
        "state",
        "district",
        "village",
        "land_area",
        "land_unit",
        "soil_type",
        "description",
    ],
    "farm_management": [
        "farm_id",
        "record_type",
        "title",
        "record_date",
        "status",
    ],
    "farm_resources": [
        "farm_id",
        "resource_type",
        "item_name",
        "quantity",
        "unit",
        "amount",
        "transaction_date",
    ],
    "app_records": [
        "category",
        "kind",
    ],
    "learning": [
        "record_type",
        "title",
        "description",
        "content",
        "category",
        "resource_url",
        "progress",
        "status",
    ],
    "market_data": [
        "record_type",
        "crop_name",
        "state",
        "district",
        "market_name",
        "min_price",
        "max_price",
        "modal_price",
        "price_date",
        "source",
    ],
}


def _get_timestamp(table: str):
    """Return timestamp in the format expected by the table."""

    now = datetime.now(timezone.utc)

    # app_records uses BIGINT timestamps.
    if table == "app_records":
        return int(now.timestamp())

    return now.isoformat()


def _flatten_for_table(table: str, row: dict):
    """Convert a Supabase row into a frontend-friendly response."""

    if not row:
        return row

    result = dict(row.get("data") or {})

    # Include actual database columns.
    for key in TABLE_COLUMNS.get(table, []):
        if key in row and row[key] is not None:
            result[key] = row[key]

    result.update({
        "id": row.get("id"),
        "user_id": row.get("owner_id"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    })

    return result


def _build_record(
    table: str,
    user_id: str,
    data: dict,
    existing=None
):
    """Build a database record using the existing table schema."""

    timestamp = _get_timestamp(table)

    record = {
        "owner_id": user_id,
        "data": data,
        "updated_at": timestamp,
    }

    if existing is None:
        record["created_at"] = timestamp

    # Copy supported fields into database columns.
    for key in TABLE_COLUMNS.get(table, []):
        if key in data:
            record[key] = data[key]

    # Required field for farm_management.
    if table == "farm_management":
        record["record_type"] = (
            data.get("record_type") or "task"
        )

    # Required fields for app_records (Crops).
    if table == "app_records":
        record["category"] = (
            data.get("category") or "crop"
        )

        record["kind"] = (
            data.get("kind") or "crop"
        )

    return record


def list_owned(
    table: str,
    user_id: str,
    filters: dict | None = None,
    limit: int = 100,
    offset: int = 0
):
    """List records belonging to the logged-in user."""

    try:
        query = (
            get_db()
            .table(table)
            .select("*")
            .eq("owner_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        rows = query.execute().data or []

        result = [
            _flatten_for_table(table, row)
            for row in rows
        ]

        # Apply optional filters.
        for key, value in (filters or {}).items():
            if value is not None:
                result = [
                    item for item in result
                    if str(item.get(key)) == str(value)
                ]

        return result

    except APIError as exc:
        print(f"Supabase list error [{table}]: {exc}")

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch {table} records"
        )


def create_owned(
    table: str,
    user_id: str,
    data: dict
):
    """Create a new record."""

    try:
        record = _build_record(
            table,
            user_id,
            data
        )

        result = (
            get_db()
            .table(table)
            .insert(record)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Unable to create record"
            )

        return _flatten_for_table(
            table,
            result.data[0]
        )

    except APIError as exc:
        print(f"Supabase create error [{table}]: {exc}")

        raise HTTPException(
            status_code=400,
            detail=(
                f"Unable to create {table} record. "
                "Check required fields."
            )
        )


def get_owned(
    table: str,
    user_id: str,
    item_id: str
):
    """Get one record belonging to the logged-in user."""

    try:
        result = (
            get_db()
            .table(table)
            .select("*")
            .eq("id", item_id)
            .eq("owner_id", user_id)
            .maybe_single()
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Record not found"
            )

        return _flatten_for_table(
            table,
            result.data
        )

    except APIError as exc:
        print(f"Supabase get error [{table}]: {exc}")

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch {table} record"
        )


def update_owned(
    table: str,
    user_id: str,
    item_id: str,
    data: dict
):
    """Update an existing record."""

    try:
        current = get_owned(
            table,
            user_id,
            item_id
        )

        merged = {
            key: value
            for key, value in current.items()
            if key not in {
                "id",
                "user_id",
                "created_at",
                "updated_at",
            }
        }

        merged.update(data)

        record = _build_record(
            table,
            user_id,
            merged,
            existing=current
        )

        result = (
            get_db()
            .table(table)
            .update(record)
            .eq("id", item_id)
            .eq("owner_id", user_id)
            .execute()
        )

        if not result.data:
            return get_owned(
                table,
                user_id,
                item_id
            )

        return _flatten_for_table(
            table,
            result.data[0]
        )

    except APIError as exc:
        print(f"Supabase update error [{table}]: {exc}")

        raise HTTPException(
            status_code=400,
            detail=f"Unable to update {table} record"
        )


def delete_owned(
    table: str,
    user_id: str,
    item_id: str
):
    """Delete a record belonging to the logged-in user."""

    try:
        get_owned(
            table,
            user_id,
            item_id
        )

        (
            get_db()
            .table(table)
            .delete()
            .eq("id", item_id)
            .eq("owner_id", user_id)
            .execute()
        )

    except APIError as exc:
        print(f"Supabase delete error [{table}]: {exc}")

        raise HTTPException(
            status_code=400,
            detail=f"Unable to delete {table} record"
        )
