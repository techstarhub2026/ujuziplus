import re
import glob
import os

migration_dir = r"C:\Users\IMC\Documents\ujuzi\prisma\migrations"
migration_sqls = {}

for path in glob.glob(os.path.join(migration_dir, "*", "migration.sql")):
    folder = os.path.basename(os.path.dirname(path))
    with open(path, "r", encoding="utf-8") as f:
        migration_sqls[folder] = f.read()

all_sql = "\n".join(migration_sqls.values())

# Extract line-by-line and capture enum defaults to find camelCase defaults
create_table_lines = {}
current_table = None
for line in all_sql.splitlines():
    m = re.match(r'CREATE TABLE (\w+)', line)
    if m:
        current_table = m.group(1)
        create_table_lines[current_table] = []
    elif current_table:
        create_table_lines[current_table].append(line)

# Known camelCase enum values from MySQL
ENUM_DEFAULTS = {
    'roles': ['STUDENT', 'INSTRUCTOR', 'ORG_ADMIN', 'MODERATOR', 'ADMIN'],
    'courses': ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ARTICLE', 'AUDIO', 'QUIZ', 'ASSIGNMENT', 'VIDEO'],
    'orders': ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'MPESA', 'AIRTEL_MONEY', 'TIGO_PESA', 'HALOPESA', 'CARD', 'BANK_TRANSFER'],
    'submissions': ['DRAFT', 'SUBMITTED', 'REVISION_REQUESTED', 'GRADED'],
    'notifications': ['REPLY_ON_POST', 'LIKE_ON_POST', 'NEW_ENROLLMENT', 'COURSE_COMPLETE', 'CERTIFICATE_ISSUED', 'ASSIGNMENT_SUBMITTED', 'ASSIGNMENT_GRADED', 'MENTOR_REQUEST', 'MENTOR_REQUEST_UPDATE', 'MENTOR_SESSION_SCHEDULED', 'MENTOR_SESSION_REMINDER', 'PROGRAM_REGISTERED', 'SYSTEM'],
    'orgs': ['UNIVERSITY', 'SCHOOL', 'BOOTCAMP', 'TRAINING_CENTER', 'MEMBER', 'ADMIN', 'PENDING', 'APPROVED'],
    'invites': ['INVITED'],
    'kits': ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'GUIDE', 'VIDEO', 'WORKSHEET', 'CODE', 'OTHER'],
    'programs': ['OPEN', 'CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'HYBRID', 'ONLINE', 'IN_PERSON'],
    'competitions': ['UPCOMING', 'ACTIVE', 'JUDGING', 'COMPLETED', 'CANCELLED'],
    'mentors': ['GENERAL', 'ACADEMIC', 'INDUSTRY', 'PENDING', 'ACCEPTED', 'REJECTED', 'DRAFT', 'REVIEW', 'PUBLISHED', 'GUIDANCE', 'SESSION', 'VIRTUAL', 'IN_PERSON'],
}

# Find columns that need camelCase by checking these patterns
# In MySQL migrations, columns with camelCase type VARS are common
# Let me check each CREATE TABLE block

all_camel_renames = {}

for table, lines in create_table_lines.items():
    camel_cols = {}
    for line in lines:
        # Match: camelCase FieldName Type ...
        m = re.match(r'\s+([a-zA-Z][a-zA-Z0-9]*)([A-Z][a-zA-Z0-9]*)\s+', line)
        if not m:
            m = re.match(r'\s+([a-zA-Z][a-zA-Z0-9]*)\s+(TIMESTAMP|VARCHAR|INTEGER|TEXT|BOOLEAN|JSON|DECIMAL|FLOAT)\s*\(', line)
        
        if m:
            col = m.group(0).strip().split()[0]
            # Verify camelCase (not SQL keywords)
            if col.lower() not in ('primary', 'constraint', 'unique', 'key', 'index', 'foreign', 'references', 'on', 'delete', 'cascade', 'restrict', 'set', 'null', 'create', 'table', 'add', 'alter', 'column', 'if', 'not', 'exists', 'default', 'true', 'false'):
                if len(col) > 1 and any(c.isupper() for c in col[1:]):
                    camel_cols[col] = col.lower()
    
    if camel_cols:
        all_camel_renames[table] = camel_cols

print("-- Rename columns from lowercase (from MySQL conversion) back to original camelCase")
print("-- This matches the old Prisma client cached on Railway\n")

for table, renames in sorted(all_camel_renames.items()):
    for camel_name, lower_name in sorted(renames.items()):
        print(f"ALTER TABLE {table} RENAME COLUMN {lower_name} TO {camel_name};")

print()
print("-- MISSING TABLES (models with no migration):")
print()

# Find models that don't have migration
all_tables = set(create_table_lines.keys())
schema_path = r"C:\Users\IMC\Documents\ujuzi\prisma\schema.prisma"
with open(schema_path, "r") as f:
    schema = f.read()
model_tables = re.findall(r'@@map\("(\w+)"\)', schema)
for mt in model_tables:
    if mt not in all_tables:
        print(f"-- {mt}")
