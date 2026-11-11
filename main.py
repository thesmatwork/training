
import csv
import os

# Store valid records based on their type
records = {}

# Store invalid records
rejected_records = []

# Counters
total_processed = 0

# Required columns
required_columns = ["ID", "Name", "RecordType", "Amount"]

# Open input CSV file
with open("records.csv", "r", newline="", encoding="utf-8") as file:

    reader = csv.DictReader(file)
    headers = reader.fieldnames

    # Check whether CSV file is empty
    if not headers:
        print("CSV file is empty!")
        exit()

    # Check required columns
    if not all(column in headers for column in required_columns):
        print("Invalid CSV structure! Required columns are missing.")
        exit()

    # Read each row
    for row in reader:

        total_processed += 1

        # Check for missing or extra column values
        if None in row or any(value is None for value in row.values()):

            # Keep only original CSV columns in rejected output
            clean_row = {
                column: row.get(column) or ""
                for column in headers
            }

            rejected_records.append(clean_row)
            print("Rejected: Malformed row")
            continue

        # Check whether ID is empty
        if not row["ID"] or not row["ID"].strip():

            rejected_records.append(row)
            print("Rejected: Missing ID")
            continue

        # Check whether RecordType is empty
        if not row["RecordType"] or not row["RecordType"].strip():

            rejected_records.append(row)
            print("Rejected: Missing RecordType")
            continue

        # Remove extra spaces from RecordType
        record_type = row["RecordType"].strip()

        # Create group if it does not exist
        if record_type not in records:
            records[record_type] = []

        # Add valid record to its group
        records[record_type].append(row)


# Create folders and write separate CSV files
for record_type, record_list in records.items():

    # Create directory
    os.makedirs(record_type, exist_ok=True)

    # Count records
    count = len(record_list)

    # Generate filename
    filename = f"{record_type}_{count}.csv"

    # Create file path
    filepath = os.path.join(record_type, filename)

    # Write records
    with open(filepath, "w", newline="", encoding="utf-8") as output_file:

        writer = csv.DictWriter(
            output_file,
            fieldnames=headers
        )

        writer.writeheader()
        writer.writerows(record_list)


# Save rejected records every time
with open("rejected_records.csv", "w", newline="", encoding="utf-8") as rejected_file:

    writer = csv.DictWriter(
        rejected_file,
        fieldnames=headers
    )

    writer.writeheader()
    writer.writerows(rejected_records)


# Calculate accepted records
accepted_records = sum(
    len(record_list) for record_list in records.values()
)

# Display final summary

print("\n========== CSV SEGREGATION SUMMARY ==========")

print("Total Records Processed:", total_processed)
print("Accepted Records:", accepted_records)
print("Rejected Records:", len(rejected_records))

print("\nRecords by Type:")

for record_type, record_list in records.items():
    print(record_type, ":", len(record_list), "records")

print("\nRejected records saved in rejected_records.csv")

print("=============================================")